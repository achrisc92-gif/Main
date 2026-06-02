import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { buildDayPlanPrompt } from '@/lib/ai'
import { parseJSONSafely, todayISO } from '@/lib/utils'
import type { TimeBlock } from '@/types/database'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type TimeBlockInput = {
  title: string
  type: TimeBlock['type']
  start_time: string
  end_time: string
  notes?: string
}

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = todayISO()

  const [tasksRes, oppsRes, profileRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id).in('status', ['open', 'in_progress']).order('due_date'),
    supabase.from('opportunities').select('*').eq('user_id', user.id).order('health_score', { ascending: false }).limit(10),
    supabase.from('profiles').select('role, sales_style').eq('user_id', user.id).single(),
  ])

  const { system, user: userPrompt } = buildDayPlanPrompt(
    tasksRes.data || [],
    oppsRes.data || [],
    profileRes.data || {}
  )

  let outputText = ''
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    })
    outputText = message.content[0].type === 'text' ? message.content[0].text : '[]'
  } catch (err) {
    console.error('Anthropic error:', err)
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
  }

  const timeBlocks = parseJSONSafely<TimeBlockInput[]>(outputText, [])

  // Delete existing blocks for today before inserting new ones
  await supabase.from('time_blocks').delete().eq('user_id', user.id).eq('date', today)

  const blocksToInsert = timeBlocks
    .filter((b) => b.title && b.start_time && b.end_time)
    .map((b) => ({
      user_id: user.id,
      title: b.title,
      type: (b.type || 'other') as TimeBlock['type'],
      start_time: b.start_time,
      end_time: b.end_time,
      date: today,
      notes: b.notes || null,
      status: 'planned' as const,
    }))

  const { data: inserted } = await supabase.from('time_blocks').insert(blocksToInsert).select()

  return NextResponse.json({ blocks: inserted || [] })
}

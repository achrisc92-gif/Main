import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { buildBlockItPrompt } from '@/lib/ai'
import { parseJSONSafely } from '@/lib/utils'
import type { BlockItOutput } from '@/types/database'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { notes: string; crm: string; framework: string; mode: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { notes, crm, framework, mode } = body
  if (!notes?.trim()) return NextResponse.json({ error: 'Notes are required' }, { status: 400 })

  const { system, user: userPrompt } = buildBlockItPrompt(notes, crm, framework, mode)

  let outputText = ''
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    })
    outputText = message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (err) {
    console.error('Anthropic error:', err)
    return NextResponse.json({ error: 'AI processing failed. Check your ANTHROPIC_API_KEY.' }, { status: 500 })
  }

  const fallbackOutput: BlockItOutput = {
    executive_summary: 'Could not parse AI output.',
    crm_notes: outputText,
    follow_up_email: { subject: 'Follow-up', body: '' },
    next_best_action: '',
    pain_points: [],
    buying_signals: [],
    objections: [],
    framework_analysis: {},
    health_score: 50,
    deal_stage: 'Discovery',
    stage_progress: 25,
    tasks: [],
  }

  const output = parseJSONSafely<BlockItOutput>(outputText, fallbackOutput)

  // Save to database
  try {
    // Upsert opportunity if we have a company name
    let opportunityId: string | null = null
    if (output.company) {
      const { data: existingOpp } = await supabase
        .from('opportunities')
        .select('id')
        .eq('user_id', user.id)
        .eq('company', output.company)
        .maybeSingle()

      if (existingOpp) {
        await supabase.from('opportunities').update({
          stage: output.deal_stage,
          health_score: Math.max(0, Math.min(100, output.health_score)),
          next_best_action: output.next_best_action,
          notes: output.crm_notes,
          framework_analysis: output.framework_analysis,
          contact_name: output.contact_name || undefined,
          contact_email: output.contact_email || undefined,
          deal_value: output.deal_value || undefined,
        }).eq('id', existingOpp.id)
        opportunityId = existingOpp.id
      } else {
        const { data: newOpp } = await supabase.from('opportunities').insert({
          user_id: user.id,
          company: output.company,
          contact_name: output.contact_name || null,
          contact_email: output.contact_email || null,
          deal_value: output.deal_value || null,
          stage: output.deal_stage,
          health_score: Math.max(0, Math.min(100, output.health_score)),
          next_best_action: output.next_best_action,
          notes: output.crm_notes,
          framework_analysis: output.framework_analysis,
        }).select('id').single()
        opportunityId = newOpp?.id || null
      }
    }

    // Save AI output
    await supabase.from('ai_outputs').insert({
      user_id: user.id,
      opportunity_id: opportunityId,
      input_notes: notes,
      crm,
      framework,
      ai_mode: mode,
      output_json: output,
    })

    // Create tasks
    if (output.tasks?.length) {
      await supabase.from('tasks').insert(
        output.tasks.map((t) => ({
          user_id: user.id,
          opportunity_id: opportunityId,
          title: t.title,
          due_date: t.due_date || null,
          priority: t.priority,
          status: 'open' as const,
        }))
      )
    }
  } catch (dbErr) {
    console.error('DB save error:', dbErr)
    // Return output even if DB save fails
  }

  return NextResponse.json({ output })
}

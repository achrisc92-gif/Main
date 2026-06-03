import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { buildDirectorPrompt } from '@/lib/ai'

export const runtime = 'edge'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }), { status: 500 })
  }

  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.split(' ')[1]
  if (!token) return new Response('Unauthorized', { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return new Response('Unauthorized', { status: 401 })

  let body: { message: string; history: Array<{ role: 'user' | 'assistant'; content: string }> }
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid body', { status: 400 })
  }

  const { message, history } = body
  if (!message?.trim()) return new Response('Message required', { status: 400 })

  // Fetch context using service role (bypasses RLS for user's own data)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [oppsRes, tasksRes] = await Promise.all([
    supabaseAdmin.from('opportunities').select('company,stage,health_score,next_best_action').eq('user_id', user.id).order('health_score', { ascending: false }).limit(10),
    supabaseAdmin.from('tasks').select('title,priority,due_date').eq('user_id', user.id).in('status', ['open', 'in_progress']).limit(10),
  ])

  const { system, messages } = buildDirectorPrompt(oppsRes.data || [], tasksRes.data || [], [])

  const allMessages = [
    ...history.slice(-20),
    { role: 'user' as const, content: message },
  ]

  // Save user message
  await supabaseAdmin.from('agent_conversations').insert({ user_id: user.id, role: 'user', content: message })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let assistantText = ''
      try {
        const messageStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system,
          messages: allMessages,
        })

        for await (const event of messageStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            assistantText += event.delta.text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))

        // Save assistant message after stream completes
        await supabaseAdmin.from('agent_conversations').insert({
          user_id: user.id,
          role: 'assistant',
          content: assistantText,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

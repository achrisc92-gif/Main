export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import BottomNav from '@/components/BottomNav'
import AgentChat from '@/components/AgentChat'
import type { AgentConversation } from '@/types/database'

export default async function DirectorPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: history } = await supabase
    .from('agent_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(50)

  const messages = (history || [])
    .filter((h: AgentConversation) => h.role === 'user' || h.role === 'assistant')
    .map((h: AgentConversation) => ({ role: h.role as 'user' | 'assistant', content: h.content }))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Director</h1>
          <div className="page-subtitle">Your personal sales coach</div>
        </div>
        <span className="chip chip-purple" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
          STREAMING
        </span>
      </div>

      <AgentChat initialMessages={messages} />

      <BottomNav />
    </div>
  )
}

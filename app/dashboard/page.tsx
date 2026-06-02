export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import BottomNav from '@/components/BottomNav'
import TaskList from '@/components/TaskList'
import Link from 'next/link'
import { formatCurrency, healthScoreHex, todayISO } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const today = todayISO()

  const [profileRes, tasksRes, oppsRes, blocksRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('tasks').select('*').eq('user_id', user.id).in('status', ['open', 'in_progress']).order('due_date', { ascending: true }).limit(5),
    supabase.from('opportunities').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
    supabase.from('time_blocks').select('*').eq('user_id', user.id).eq('date', today).order('start_time'),
  ])

  const profile = profileRes.data
  const tasks = tasksRes.data || []
  const opps = oppsRes.data || []
  const blocks = blocksRes.data || []

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const totalValue = opps.reduce((sum, o) => sum + (o.deal_value || 0), 0)
  const avgHealth = opps.length ? Math.round(opps.reduce((s, o) => s + o.health_score, 0) / opps.length) : 0

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Hey, {firstName} 👋</h1>
          <div className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
        <Link href="/settings" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M6 20v-2a6 6 0 0 1 12 0v2" />
          </svg>
        </Link>
      </div>

      {/* Quick BLOCK IT */}
      <Link href="/block-it" className="btn-block-it" style={{ marginBottom: 20, textDecoration: 'none', display: 'flex' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        BLOCK IT
      </Link>

      {/* Stats */}
      <div className="stat-row animate-fade-up">
        <div className="stat-card">
          <div className="stat-label">Pipeline</div>
          <div className="stat-value">{opps.length}</div>
          <div className="stat-sub">{formatCurrency(totalValue)} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Health</div>
          <div className="stat-value" style={{ color: healthScoreHex(avgHealth) }}>{avgHealth}</div>
          <div className="stat-sub">/100</div>
        </div>
      </div>

      {/* Today's Schedule */}
      {blocks.length > 0 && (
        <div className="section animate-fade-up animate-fade-up-1">
          <div className="section-header">
            <span className="section-title">Today&apos;s Schedule</span>
            <Link href="/myday" style={{ fontSize: 12, color: 'var(--blue)' }}>See all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {blocks.slice(0, 3).map((b) => (
              <div key={b.id} className="card-sm" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', minWidth: 56 }}>
                  {b.start_time.slice(0, 5)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{b.title}</div>
                <span className={`chip chip-${b.status === 'completed' ? 'green' : b.status === 'in_progress' ? 'blue' : ''}`} style={{ fontSize: 10 }}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Tasks */}
      <div className="section animate-fade-up animate-fade-up-2">
        <div className="section-header">
          <span className="section-title">Open Tasks ({tasks.length})</span>
          <Link href="/myday" style={{ fontSize: 12, color: 'var(--blue)' }}>See all</Link>
        </div>
        <TaskList tasks={tasks} />
      </div>

      {/* Pipeline snapshot */}
      {opps.length > 0 && (
        <div className="section animate-fade-up animate-fade-up-3">
          <div className="section-header">
            <span className="section-title">Pipeline</span>
            <Link href="/pipeline" style={{ fontSize: 12, color: 'var(--blue)' }}>See all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {opps.slice(0, 3).map((opp) => {
              const color = healthScoreHex(opp.health_score)
              return (
                <div key={opp.id} className="card-sm" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }} className="truncate">{opp.company}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{opp.stage}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{opp.health_score}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

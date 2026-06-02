'use client'

import type { Opportunity } from '@/types/database'
import { healthScoreHex, formatCurrency } from '@/lib/utils'

interface OpportunityListProps {
  opportunities: Opportunity[]
}

const STAGE_ORDER = ['Prospecting', 'Discovery', 'Qualification', 'Demo', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

function HealthBar({ score }: { score: number }) {
  const color = healthScoreHex(score)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 28, textAlign: 'right' }}>{score}</span>
    </div>
  )
}

export default function OpportunityList({ opportunities }: OpportunityListProps) {
  if (opportunities.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">📊</div>
        <div className="empty-title">No opportunities yet</div>
        <div className="empty-body">Block a meeting to auto-create opportunities in your pipeline.</div>
      </div>
    )
  }

  const byStage = STAGE_ORDER.reduce<Record<string, Opportunity[]>>((acc, stage) => {
    const group = opportunities.filter((o) => o.stage === stage)
    if (group.length > 0) acc[stage] = group
    return acc
  }, {})

  const otherStages = opportunities.filter((o) => !STAGE_ORDER.includes(o.stage))
  if (otherStages.length > 0) {
    byStage['Other'] = otherStages
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(byStage).map(([stage, opps]) => (
        <div key={stage}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              {stage}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>({opps.length})</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {opps.map((opp, i) => (
              <div
                key={opp.id}
                className="card-sm animate-fade-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }} className="truncate">
                      {opp.company}
                    </div>
                    {opp.contact_name && (
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{opp.contact_name}</div>
                    )}
                  </div>
                  {opp.deal_value && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', flexShrink: 0, marginLeft: 12 }}>
                      {formatCurrency(opp.deal_value)}
                    </div>
                  )}
                </div>

                <HealthBar score={opp.health_score} />

                {opp.next_best_action && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    → {opp.next_best_action}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

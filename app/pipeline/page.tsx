'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import OpportunityList from '@/components/OpportunityList'
import type { Opportunity } from '@/types/database'
import { formatCurrency, healthScoreHex } from '@/lib/utils'

export default function PipelinePage() {
  const router = useRouter()
  const supabase = createClient()

  const [opps, setOpps] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData() // eslint-disable-line react-hooks/exhaustive-deps
  }, []) // intentional: runs once on mount

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .eq('user_id', user.id)
      .order('health_score', { ascending: false })

    setOpps(data || [])
    setLoading(false)
  }

  const totalValue = opps.reduce((s, o) => s + (o.deal_value || 0), 0)
  const avgHealth = opps.length ? Math.round(opps.reduce((s, o) => s + o.health_score, 0) / opps.length) : 0
  const atRisk = opps.filter((o) => o.health_score < 45).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pipeline</h1>
          <div className="page-subtitle">{opps.length} opportunities</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span className="spinner" />
        </div>
      ) : (
        <>
          {/* Stats */}
          {opps.length > 0 && (
            <div className="stat-row animate-fade-up" style={{ marginBottom: 20 }}>
              <div className="stat-card">
                <div className="stat-label">Total Value</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{formatCurrency(totalValue)}</div>
                <div className="stat-sub">{opps.length} deals</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Health</div>
                <div className="stat-value" style={{ color: healthScoreHex(avgHealth) }}>{avgHealth}</div>
                <div className="stat-sub" style={{ color: atRisk > 0 ? 'var(--red)' : 'var(--text3)' }}>
                  {atRisk > 0 ? `${atRisk} at risk` : 'All healthy'}
                </div>
              </div>
            </div>
          )}

          <div className="animate-fade-up animate-fade-up-1">
            <OpportunityList opportunities={opps} />
          </div>
        </>
      )}

      <BottomNav />
    </div>
  )
}

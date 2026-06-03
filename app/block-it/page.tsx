'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BlockItWorkspace from '@/components/BlockItWorkspace'
import CRMOutput from '@/components/CRMOutput'
import BottomNav from '@/components/BottomNav'
import { useToast } from '@/components/Toast'
import type { BlockItOutput, CRM, Framework, AIMode } from '@/types/database'

export default function BlockItPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<BlockItOutput | null>(null)
  const [selectedCrm, setSelectedCrm] = useState<CRM>('Salesforce')
  const [profile, setProfile] = useState<{ default_crm: string; default_framework: string } | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      supabase.from('profiles').select('default_crm, default_framework').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setProfile(data) })
    })
  }, []) // intentional: runs once on mount

  async function handleSubmit({ notes, crm, framework, mode }: { notes: string; crm: CRM; framework: Framework; mode: AIMode }) {
    setLoading(true)
    setOutput(null)
    setSelectedCrm(crm)

    try {
      const res = await fetch('/api/block-it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, crm, framework, mode }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'BLOCK IT failed')
      }

      const data = await res.json()
      setOutput(data.output)
      addToast('BLOCK IT complete!', 'success')

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">BLOCK IT</h1>
          <div className="page-subtitle">Transform notes into CRM-ready intelligence</div>
        </div>
        {output && (
          <button
            onClick={() => setOutput(null)}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            New
          </button>
        )}
      </div>

      {output ? (
        <CRMOutput output={output} crm={selectedCrm} />
      ) : (
        <BlockItWorkspace
          defaultCrm={profile?.default_crm}
          defaultFramework={profile?.default_framework}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}

      <BottomNav />
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { BlockItOutput } from '@/types/database'
import { useToast } from './Toast'

interface ExportSheetProps {
  output: BlockItOutput
  crm: string
  company?: string
  contact?: string
  onClose: () => void
}

const FORMATS = [
  { id: 'salesforce', label: 'Salesforce', icon: '☁️' },
  { id: 'hubspot', label: 'HubSpot', icon: '🧡' },
  { id: 'dynamics', label: 'Dynamics 365', icon: '🔷' },
  { id: 'zoho', label: 'Zoho CRM', icon: '🟢' },
  { id: 'pipedrive', label: 'Pipedrive', icon: '🟣' },
  { id: 'csv', label: 'Universal CSV', icon: '📊' },
  { id: 'json', label: 'JSON', icon: '{ }' },
  { id: 'copy', label: 'Copy Notes', icon: '📋' },
]

export default function ExportSheet({ output, crm, company, contact, onClose }: ExportSheetProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { addToast } = useToast()

  async function handleExport(format: string) {
    if (format === 'copy') {
      await navigator.clipboard.writeText(output.crm_notes || output.executive_summary)
      addToast('Notes copied to clipboard', 'success')
      onClose()
      return
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `block-it-${company || 'output'}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      addToast('JSON downloaded', 'success')
      onClose()
      return
    }

    setLoading(format)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ output, crm: format, format, company, contact }),
      })

      if (!res.ok) throw new Error('Export failed')
      const { text } = await res.json()

      if (format === 'csv') {
        const blob = new Blob([text], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `block-it-${company || 'output'}-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
        addToast('CSV downloaded', 'success')
      } else {
        await navigator.clipboard.writeText(text)
        addToast(`${format.charAt(0).toUpperCase() + format.slice(1)} format copied`, 'success')
      }

      onClose()
    } catch {
      addToast('Export failed', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Export CRM Notes</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => handleExport(fmt.id)}
              disabled={!!loading}
              style={{
                padding: '14px 16px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                opacity: loading && loading !== fmt.id ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 18 }}>{loading === fmt.id ? '…' : fmt.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{fmt.label}</span>
            </button>
          ))}
        </div>

        <button onClick={onClose} className="btn-ghost" style={{ width: '100%', marginTop: 16 }}>
          Cancel
        </button>
      </div>
    </>
  )
}

'use client'

import { useState } from 'react'
import VoiceRecorder from './VoiceRecorder'
import DriveMode from './DriveMode'
import type { CRM, Framework, AIMode } from '@/types/database'

interface BlockItWorkspaceProps {
  defaultCrm?: string
  defaultFramework?: string
  onSubmit: (data: {
    notes: string
    crm: CRM
    framework: Framework
    mode: AIMode
  }) => void
  loading: boolean
}

const CRMS: CRM[] = ['Salesforce', 'HubSpot', 'Dynamics', 'Zoho', 'Pipedrive', 'Custom']
const FRAMEWORKS: Framework[] = ['MEDDICC', 'BANT', 'SPICED', 'Sandler', 'Challenger']
const MODES: { id: AIMode; label: string; desc: string }[] = [
  { id: 'ai', label: 'AI Gen', desc: 'AI-written notes' },
  { id: 'human', label: 'Human', desc: 'First-person voice' },
  { id: 'director', label: 'Director', desc: 'Includes coaching' },
  { id: 'export', label: 'Export', desc: 'CRM-formatted' },
]

export default function BlockItWorkspace({ defaultCrm = 'Salesforce', defaultFramework = 'MEDDICC', onSubmit, loading }: BlockItWorkspaceProps) {
  const [notes, setNotes] = useState('')
  const [crm, setCrm] = useState<CRM>((defaultCrm as CRM) || 'Salesforce')
  const [framework, setFramework] = useState<Framework>((defaultFramework as Framework) || 'MEDDICC')
  const [mode, setMode] = useState<AIMode>('ai')
  const [driveMode, setDriveMode] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!notes.trim()) return
    onSubmit({ notes, crm, framework, mode })
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = () => setNotes((prev) => prev + '\n' + (reader.result as string))
      reader.readAsText(file)
      return
    }

    if (file.type === 'application/json') {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string)
          setNotes((prev) => prev + '\n' + JSON.stringify(data, null, 2))
        } catch {}
      }
      reader.readAsText(file)
      return
    }

    // For DOCX/PDF, send to API for parsing
    const formData = new FormData()
    formData.append('file', file)
    fetch('/api/transcribe', { method: 'POST', body: formData })
      .then((r) => r.json())
      .then((d) => {
        if (d.transcript) setNotes((prev) => prev + '\n' + d.transcript)
      })
      .catch(() => {})
  }

  return (
    <>
      {driveMode && (
        <DriveMode
          onTranscript={(text) => { setNotes((prev) => prev ? prev + '\n' + text : text); setDriveMode(false) }}
          onClose={() => setDriveMode(false)}
        />
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Notes textarea */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label">Meeting Notes / Transcript</label>
            <button
              type="button"
              onClick={() => setDriveMode(true)}
              style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Drive Mode
            </button>
          </div>
          <textarea
            className="form-textarea"
            placeholder="Paste your meeting notes, call transcript, or record your voice below…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            style={{ minHeight: 160 }}
          />
        </div>

        {/* Voice recorder */}
        <VoiceRecorder onTranscript={(text) => setNotes((prev) => prev ? prev + '\n' + text : text)} />

        {/* File upload */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--surface)', border: '1px dashed var(--border2)', borderRadius: 12, cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>Upload file (TXT, DOCX, PDF)</span>
          <input type="file" accept=".txt,.docx,.pdf,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        {/* CRM selector */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">CRM Target</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CRMS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCrm(c)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  background: crm === c ? 'var(--blue)' : 'var(--surface)',
                  color: crm === c ? '#fff' : 'var(--text2)',
                  border: `1px solid ${crm === c ? 'transparent' : 'var(--border2)'}`,
                  transition: 'all 0.15s ease',
                  minHeight: 36,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Framework selector */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Sales Framework</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FRAMEWORKS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFramework(f)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  background: framework === f ? 'var(--purple)' : 'var(--surface)',
                  color: framework === f ? '#fff' : 'var(--text2)',
                  border: `1px solid ${framework === f ? 'transparent' : 'var(--border2)'}`,
                  transition: 'all 0.15s ease',
                  minHeight: 36,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* AI Mode */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">AI Mode</label>
          <div className="segmented">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`segmented-item${mode === m.id ? ' active' : ''}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-block-it" disabled={loading || !notes.trim()} style={{ marginTop: 8 }}>
          {loading ? (
            <>
              <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              BLOCKING…
            </>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              BLOCK IT
            </>
          )}
        </button>
      </form>
    </>
  )
}

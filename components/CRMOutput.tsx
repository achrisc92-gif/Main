'use client'

import { useState } from 'react'
import type { BlockItOutput } from '@/types/database'
import { healthScoreHex, formatDate, priorityColor } from '@/lib/utils'
import { useToast } from './Toast'
import ExportSheet from './ExportSheet'

interface CRMOutputProps {
  output: BlockItOutput
  crm: string
}

function HealthRing({ score }: { score: number }) {
  const RADIUS = 42
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE
  const color = healthScoreHex(score)

  return (
    <div className="health-ring-wrap">
      <svg viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text x="50" y="46" textAnchor="middle" fill={color} fontSize="22" fontWeight="800" fontFamily="inherit">
          {score}
        </text>
        <text x="50" y="62" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="inherit">
          /100
        </text>
      </svg>
      <div className="health-ring-label">Health</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card animate-fade-up" style={{ marginBottom: 12 }}>
      <div className="card-title">{title}</div>
      {children}
    </div>
  )
}

export default function CRMOutput({ output, crm }: CRMOutputProps) {
  const { addToast } = useToast()
  const [emailSubject, setEmailSubject] = useState(output.follow_up_email?.subject || '')
  const [emailBody, setEmailBody] = useState(output.follow_up_email?.body || '')
  const [emailTo, setEmailTo] = useState(output.contact_email || '')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showFramework, setShowFramework] = useState(false)

  const color = healthScoreHex(output.health_score)

  async function sendEmail() {
    if (!emailTo) {
      addToast('Enter recipient email', 'error')
      return
    }
    setSendingEmail(true)
    try {
      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo, subject: emailSubject, body: emailBody }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Send failed')
      }
      addToast('Email sent via Gmail!', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Email failed', 'error')
    } finally {
      setSendingEmail(false)
    }
  }

  async function copyEmail() {
    await navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`)
    addToast('Email copied to clipboard', 'success')
  }

  return (
    <div>
      {/* Score + Stage row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          <HealthRing score={output.health_score} />
          <div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Deal Stage</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{output.deal_stage}</div>
            <div style={{ marginTop: 8, height: 6, background: 'var(--border)', borderRadius: 3, width: 100, overflow: 'hidden' }}>
              <div style={{ width: `${output.stage_progress}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 1s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <Section title="Executive Summary">
        <p className="prose">{output.executive_summary}</p>
      </Section>

      {/* CRM Notes */}
      <Section title={`${crm} CRM Notes`}>
        <p className="prose">{output.crm_notes}</p>
        <button
          onClick={() => { navigator.clipboard.writeText(output.crm_notes); addToast('CRM notes copied', 'success') }}
          className="btn-ghost"
          style={{ marginTop: 12, padding: '8px 0', color: 'var(--blue)', fontSize: 13, fontWeight: 600 }}
        >
          Copy Notes
        </button>
      </Section>

      {/* Next Best Action */}
      <div className="card animate-fade-up" style={{ marginBottom: 12, borderColor: 'rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.05)' }}>
        <div className="card-title" style={{ color: 'var(--blue)' }}>Next Best Action</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
          {output.next_best_action}
        </p>
      </div>

      {/* Signals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="card-sm animate-fade-up">
          <div className="card-title" style={{ color: 'var(--green)' }}>Buying Signals</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {output.buying_signals?.length ? output.buying_signals.map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>• {s}</div>
            )) : <div style={{ fontSize: 12, color: 'var(--text3)' }}>None identified</div>}
          </div>
        </div>
        <div className="card-sm animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="card-title" style={{ color: 'var(--red)' }}>Objections</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {output.objections?.length ? output.objections.map((o, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>• {o}</div>
            )) : <div style={{ fontSize: 12, color: 'var(--text3)' }}>None raised</div>}
          </div>
        </div>
      </div>

      {/* Pain Points */}
      {output.pain_points?.length > 0 && (
        <Section title="Pain Points">
          <div className="tags">
            {output.pain_points.map((p, i) => (
              <span key={i} className="chip chip-amber">{p}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Framework Analysis */}
      {output.framework_analysis && Object.keys(output.framework_analysis).length > 0 && (
        <div className="card animate-fade-up" style={{ marginBottom: 12 }}>
          <button
            onClick={() => setShowFramework(!showFramework)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span className="card-title" style={{ marginBottom: 0 }}>Framework Analysis</span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showFramework ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showFramework && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(output.framework_analysis).map(([key, value]) => (
                <div key={key}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 3 }}>
                    {key}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Follow-up Email */}
      <Section title="Follow-up Email">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="email"
            className="form-input"
            placeholder="recipient@company.com"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            style={{ fontSize: 14 }}
          />
          <input
            type="text"
            className="form-input"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            style={{ fontSize: 14 }}
          />
          <textarea
            className="form-textarea"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={6}
            style={{ fontSize: 13, minHeight: 140 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={sendEmail} disabled={sendingEmail} className="btn-primary" style={{ flex: 1, fontSize: 14 }}>
              {sendingEmail ? <span className="spinner" /> : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
              {sendingEmail ? 'Sending…' : 'Send via Gmail'}
            </button>
            <button onClick={copyEmail} className="btn-secondary" style={{ padding: '0 16px' }}>
              Copy
            </button>
          </div>
        </div>
      </Section>

      {/* Tasks */}
      {output.tasks?.length > 0 && (
        <Section title={`Auto-Created Tasks (${output.tasks.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {output.tasks.map((task, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${priorityColor(task.priority)}`, flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    {formatDate(task.due_date)} · {task.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Director Coaching */}
      {output.director_coaching && (
        <div className="card animate-fade-up" style={{ marginBottom: 12, borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.05)' }}>
          <div className="card-title" style={{ color: 'var(--purple)' }}>
            🏆 AI Director Coaching
          </div>
          <p className="prose">{output.director_coaching}</p>
        </div>
      )}

      {/* Export button */}
      <button onClick={() => setShowExport(true)} className="btn-secondary" style={{ width: '100%', marginBottom: 16, marginTop: 4 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export CRM Notes
      </button>

      {showExport && (
        <ExportSheet
          output={output}
          crm={crm}
          company={output.company}
          contact={output.contact_name}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}

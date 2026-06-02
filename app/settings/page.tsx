'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { useToast } from '@/components/Toast'
import type { Profile } from '@/types/database'

const CRMS = ['Salesforce', 'HubSpot', 'Dynamics', 'Zoho', 'Pipedrive', 'Custom']
const FRAMEWORKS = ['MEDDICC', 'BANT', 'SPICED', 'Sandler', 'Challenger']
const ROLES = ['Account Executive', 'Account Manager', 'CSM', 'BDR', 'SDR', 'Territory Manager', 'National Account Manager', 'Field Sales']

export default function SettingsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadProfile() // eslint-disable-line react-hooks/exhaustive-deps
  }, []) // intentional: runs once on mount

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    setUserId(user.id)

    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    if (data) setProfile(data)
    setLoading(false)
  }

  async function saveProfile() {
    if (!userId) return
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: profile.full_name,
        role: profile.role,
        company: profile.company,
        default_crm: profile.default_crm,
        default_framework: profile.default_framework,
        email_signature: profile.email_signature,
      }).eq('user_id', userId)

      if (error) throw error
      addToast('Settings saved', 'success')
    } catch {
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function connectGmail() {
    window.location.href = '/api/gmail/connect'
  }

  async function disconnectGmail() {
    if (!userId) return
    await supabase.from('profiles').update({
      gmail_connected: false,
      gmail_email: null,
      gmail_access_token: null,
      gmail_refresh_token: null,
    }).eq('user_id', userId)
    setProfile((p) => ({ ...p, gmail_connected: false, gmail_email: null }))
    addToast('Gmail disconnected', 'info')
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <span className="spinner" />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Profile */}
      <div className="card animate-fade-up" style={{ marginBottom: 16 }}>
        <div className="card-title">Profile</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={profile.full_name || ''} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Role</label>
            <select className="form-select" value={profile.role || ''} onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}>
              <option value="">Select role</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Company</label>
            <input type="text" className="form-input" value={profile.company || ''} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Defaults */}
      <div className="card animate-fade-up animate-fade-up-1" style={{ marginBottom: 16 }}>
        <div className="card-title">Defaults</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Default CRM</label>
            <select className="form-select" value={profile.default_crm || 'Salesforce'} onChange={(e) => setProfile((p) => ({ ...p, default_crm: e.target.value }))}>
              {CRMS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Default Framework</label>
            <select className="form-select" value={profile.default_framework || 'MEDDICC'} onChange={(e) => setProfile((p) => ({ ...p, default_framework: e.target.value }))}>
              {FRAMEWORKS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Email Signature */}
      <div className="card animate-fade-up animate-fade-up-2" style={{ marginBottom: 16 }}>
        <div className="card-title">Email Signature</div>
        <textarea
          className="form-textarea"
          placeholder="Your email signature…"
          value={profile.email_signature || ''}
          onChange={(e) => setProfile((p) => ({ ...p, email_signature: e.target.value }))}
          rows={4}
          style={{ minHeight: 100 }}
        />
      </div>

      {/* Gmail */}
      <div className="card animate-fade-up animate-fade-up-3" style={{ marginBottom: 16 }}>
        <div className="card-title">Gmail Integration</div>
        {profile.gmail_connected ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
              <span style={{ fontSize: 14, color: 'var(--text)' }}>Connected as {profile.gmail_email}</span>
            </div>
            <button onClick={disconnectGmail} className="btn-danger" style={{ width: '100%', fontSize: 14 }}>
              Disconnect Gmail
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.5 }}>
              Connect Gmail to send follow-up emails directly from BLOCK.
            </p>
            <button onClick={connectGmail} className="btn-primary" style={{ fontSize: 14 }}>
              Connect Gmail
            </button>
          </div>
        )}
      </div>

      {/* Save */}
      <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ marginBottom: 12 }}>
        {saving ? <span className="spinner" /> : null}
        {saving ? 'Saving…' : 'Save Settings'}
      </button>

      {/* Sign out */}
      <button onClick={signOut} className="btn-secondary" style={{ width: '100%', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}>
        Sign Out
      </button>

      <BottomNav />
    </div>
  )
}

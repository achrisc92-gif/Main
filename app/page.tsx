import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px', minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '28px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)' }}>BLOCK</span>
        <Link href="/auth" style={{ padding: '10px 18px', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
          Sign in
        </Link>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 80 }}>
        <div className="animate-fade-up" style={{ marginBottom: 12 }}>
          <span className="chip chip-blue" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
            AI SALES ADMIN
          </span>
        </div>

        <h1 className="animate-fade-up animate-fade-up-1" style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 20 }}>
          Stop typing<br />
          <span style={{ color: 'var(--blue)' }}>CRM notes.</span><br />
          BLOCK them.
        </h1>

        <p className="animate-fade-up animate-fade-up-2" style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 32, maxWidth: 360 }}>
          Paste notes or record voice after any meeting. BLOCK instantly returns CRM updates, follow-up emails, deal health scores, and a time-blocked action plan.
        </p>

        <Link href="/auth" className="btn-block-it animate-fade-up animate-fade-up-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          GET STARTED FREE
        </Link>

        <p className="animate-fade-up animate-fade-up-4" style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>
          No credit card required
        </p>

        {/* Features */}
        <div className="animate-fade-up animate-fade-up-5" style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['⚡', 'BLOCK IT', 'Paste notes → CRM-ready output in seconds'],
            ['🎙️', 'Voice Mode', 'Record calls, auto-transcribe with Whisper'],
            ['📊', 'MEDDICC / BANT', 'AI framework analysis on every deal'],
            ['💌', 'Follow-up Email', 'Auto-generated, editable, Gmail-ready'],
            ['📅', 'My Day', 'AI time-blocked daily schedule'],
            ['🏆', 'AI Director', 'Streaming deal coaching from your AI Sales Director'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.4 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 0 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>
          Built for Account Executives, CSMs, BDRs & Field Sales
        </p>
      </div>
    </div>
  )
}

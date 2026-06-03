import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, body: emailBody } = await request.json()
  if (!to || !subject || !emailBody) {
    return NextResponse.json({ error: 'Missing to, subject, or body' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('gmail_connected, gmail_access_token, gmail_refresh_token, gmail_email, email_signature')
    .eq('user_id', user.id)
    .single()

  if (!profile?.gmail_connected || !profile.gmail_access_token) {
    return NextResponse.json({ error: 'Gmail is not connected. Go to Settings to connect Gmail.' }, { status: 400 })
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: 'Google OAuth is not configured on the server.' }, { status: 500 })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  oauth2Client.setCredentials({
    access_token: profile.gmail_access_token,
    refresh_token: profile.gmail_refresh_token || undefined,
  })

  // Refresh token if needed
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await supabase.from('profiles').update({ gmail_access_token: tokens.access_token }).eq('user_id', user.id)
    }
  })

  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    const signature = profile.email_signature ? `\n\n${profile.email_signature}` : ''
    const fullBody = emailBody + signature

    const messageParts = [
      `From: ${profile.gmail_email}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      fullBody,
    ]

    const raw = Buffer.from(messageParts.join('\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Gmail send error:', err)
    return NextResponse.json({ error: 'Failed to send email. Your Gmail token may have expired. Reconnect in Settings.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/settings?gmail=error', request.url))
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.redirect(new URL('/settings?gmail=config_error', request.url))
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user's Gmail address
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/auth', request.url))

    await supabase.from('profiles').update({
      gmail_connected: true,
      gmail_email: userInfo.email || null,
      gmail_access_token: tokens.access_token || null,
      gmail_refresh_token: tokens.refresh_token || null,
    }).eq('user_id', user.id)

    return NextResponse.redirect(new URL('/settings?gmail=connected', request.url))
  } catch (err) {
    console.error('Gmail callback error:', err)
    return NextResponse.redirect(new URL('/settings?gmail=error', request.url))
  }
}

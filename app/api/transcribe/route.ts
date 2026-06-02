import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const audio = formData.get('audio') as File | null
  const file = formData.get('file') as File | null

  // Handle document file parsing
  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer())

    if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      try {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        return NextResponse.json({ transcript: result.value })
      } catch {
        return NextResponse.json({ error: 'DOCX parsing failed. Ensure mammoth is installed.' }, { status: 500 })
      }
    }

    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const pdfParseModule = (await import('pdf-parse')) as unknown as { default?: (buf: Buffer) => Promise<{ text: string }>; (buf: Buffer): Promise<{ text: string }> }
        const pdfParse = pdfParseModule.default ?? (pdfParseModule as unknown as (buf: Buffer) => Promise<{ text: string }>)
        const data = await pdfParse(buffer)
        return NextResponse.json({ transcript: data.text })
      } catch {
        return NextResponse.json({ error: 'PDF parsing failed. Ensure pdf-parse is installed.' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  // Handle audio transcription
  if (!audio) {
    return NextResponse.json({ error: 'No audio or file provided' }, { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 })
  }

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'en',
    })

    // Save voice note
    await supabase.from('voice_notes').insert({
      user_id: user.id,
      transcript: transcription.text,
      duration: null,
    })

    return NextResponse.json({ transcript: transcription.text })
  } catch (err) {
    console.error('Whisper error:', err)
    return NextResponse.json({ error: 'Transcription failed. Check your OPENAI_API_KEY.' }, { status: 500 })
  }
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from './Toast'

type SpeechRecognitionCtor = new () => {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  start(): void
  stop(): void
}

type SpeechRecognitionEvent = {
  resultIndex: number
  results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } }
}

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const { addToast } = useToast()
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)

  const recognitionRef = useRef<{ stop(): void } | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const useSpeechRef = useRef(false)

  useEffect(() => {
    const win = window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }
    useSpeechRef.current = !!(win.SpeechRecognition || win.webkitSpeechRecognition)
  }, [])

  async function startRecording() {
    setTranscript('')
    setRecording(true)

    const win = window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      let final = ''
      recognition.onresult = (e) => {
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript + ' '
          } else {
            interim += e.results[i][0].transcript
          }
        }
        setTranscript(final + interim)
      }

      recognition.onerror = () => {
        addToast('Microphone error. Try again.', 'error')
        setRecording(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        chunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          stream.getTracks().forEach((t) => t.stop())
          await transcribeWithWhisper(blob)
        }

        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()
      } catch {
        addToast('Microphone access denied', 'error')
        setRecording(false)
      }
    }
  }

  async function stopRecording() {
    setRecording(false)

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      const text = transcript.trim()
      if (text) onTranscript(text)
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
  }

  async function transcribeWithWhisper(blob: Blob) {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')

      const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Transcription failed')
      const data = await res.json()
      setTranscript(data.transcript)
      onTranscript(data.transcript)
    } catch {
      addToast('Transcription failed. Check your OpenAI API key.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: recording ? 'var(--red)' : 'var(--surface2)',
            border: '1px solid ' + (recording ? 'rgba(239,68,68,0.3)' : 'var(--border2)'),
            color: recording ? '#fff' : 'var(--text2)',
            animation: recording ? 'pulse-record 1.5s ease-in-out infinite' : 'none',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? (
            <span className="spinner" style={{ width: 18, height: 18 }} />
          ) : recording ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: recording ? 'var(--red)' : 'var(--text2)' }}>
            {loading ? 'Transcribing…' : recording ? 'Recording — tap to stop' : 'Tap to record voice'}
          </div>
          {!recording && !loading && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              Voice transcript auto-fills notes
            </div>
          )}
        </div>
      </div>

      {transcript && (
        <div style={{ padding: '12px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, maxHeight: 100, overflowY: 'auto' }}>
          {transcript}
        </div>
      )}
    </div>
  )
}

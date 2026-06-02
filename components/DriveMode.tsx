'use client'

import { useState, useRef } from 'react'
import { useToast } from './Toast'

type SpeechRecognitionCtor = new () => {
  continuous: boolean
  interimResults: boolean
  lang: string
  resultIndex: number
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  start(): void
  stop(): void
}

type SpeechRecognitionEvent = {
  resultIndex: number
  results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } }
}

interface DriveModeProps {
  onTranscript: (text: string) => void
  onClose: () => void
}

export default function DriveMode({ onTranscript, onClose }: DriveModeProps) {
  const { addToast } = useToast()
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)

  const recognitionRef = useRef<{ stop(): void } | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const finalRef = useRef('')

  async function startRecording() {
    setTranscript('')
    finalRef.current = ''
    setRecording(true)

    const win = window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (e) => {
        let interim = ''
        let newFinal = finalRef.current
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            newFinal += e.results[i][0].transcript + ' '
          } else {
            interim += e.results[i][0].transcript
          }
        }
        finalRef.current = newFinal
        setTranscript(newFinal + interim)
      }

      recognition.onerror = () => {
        addToast('Microphone error', 'error')
        setRecording(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mr = new MediaRecorder(stream)
        chunksRef.current = []

        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        mr.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          stream.getTracks().forEach((t) => t.stop())
          setLoading(true)
          try {
            const formData = new FormData()
            formData.append('audio', blob, 'recording.webm')
            const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
            const data = await res.json()
            setTranscript(data.transcript)
            finalRef.current = data.transcript
          } catch {
            addToast('Transcription failed', 'error')
          } finally {
            setLoading(false)
          }
        }

        mediaRecorderRef.current = mr
        mr.start()
      } catch {
        addToast('Microphone access denied', 'error')
        setRecording(false)
      }
    }
  }

  function stopRecording() {
    setRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
  }

  function handleDone() {
    const text = finalRef.current.trim() || transcript.trim()
    if (text) {
      onTranscript(text)
    }
    onClose()
  }

  return (
    <div className="drive-mode">
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text3)', textTransform: 'uppercase' }}>
          Drive Mode
        </span>
        <button onClick={onClose} style={{ color: 'var(--text3)', padding: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Transcript */}
      <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        {transcript ? (
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)', textAlign: 'center', maxWidth: 340 }}>
            {transcript}
          </p>
        ) : (
          <p style={{ fontSize: 20, color: 'var(--text3)', textAlign: 'center', fontWeight: 500 }}>
            {recording ? 'Listening…' : 'Tap the button to start recording'}
          </p>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          className={`drive-record-btn${recording ? ' recording' : ''}`}
        >
          {loading ? (
            <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
          ) : recording ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          )}
        </button>

        <div style={{ display: 'flex', gap: 16 }}>
          {transcript && !recording && (
            <button onClick={handleDone} className="btn-primary" style={{ minWidth: 160 }}>
              Use Transcript
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

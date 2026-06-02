'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useToast } from './Toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AgentChatProps {
  initialMessages?: Message[]
}

export default function AgentChat({ initialMessages = [] }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setLoading(true)

    const userMessage: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        addToast('Session expired. Please sign in again.', 'error')
        return
      }

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: text, history: messages }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data) as { text: string }
            assistantText += parsed.text
            const finalText = assistantText
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: finalText },
            ])
          } catch {}
        }
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to get response', 'error')
      setMessages((prev) => prev.filter((_, i) => i !== prev.length - 1))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const starters = [
    'How do I advance this deal?',
    'What are my biggest risks this week?',
    'Help me prep for a tough negotiation',
    'How do I find the economic buyer?',
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100svh - 180px)', minHeight: 400 }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {messages.length === 0 && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                AI Sales Director
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                Ask anything about your deals, strategy, or sales tactics.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 14,
                    color: 'var(--text2)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: 14,
                lineHeight: 1.6,
                background: msg.role === 'user' ? 'var(--blue)' : 'var(--surface)',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <span style={{ display: 'flex', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', animation: 'pulse-record 1.2s ease infinite 0s' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', animation: 'pulse-record 1.2s ease infinite 0.2s' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', animation: 'pulse-record 1.2s ease infinite 0.4s' }} />
                </span>
              ) : '…')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <textarea
          className="form-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your AI Sales Director…"
          rows={2}
          style={{ minHeight: 52, resize: 'none', flex: 1, fontSize: 14 }}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            width: 48,
            height: 52,
            borderRadius: 12,
            background: input.trim() ? 'var(--purple)' : 'var(--surface2)',
            border: '1px solid ' + (input.trim() ? 'rgba(168,85,247,0.3)' : 'var(--border)'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease',
            color: input.trim() ? '#fff' : 'var(--text3)',
          }}
        >
          {loading ? (
            <span className="spinner" style={{ width: 18, height: 18 }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

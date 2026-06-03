'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { TimeBlock } from '@/types/database'
import { formatTime } from '@/lib/utils'
import { useToast } from './Toast'

const typeColors: Record<string, string> = {
  prospecting: 'var(--blue)',
  discovery: 'var(--purple)',
  followup: 'var(--amber)',
  meeting: 'var(--green)',
  crm: 'var(--text2)',
  pipeline: 'var(--blue)',
  break: 'var(--text3)',
  admin: 'var(--text3)',
  other: 'var(--text3)',
}

const statusLabels: Record<string, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Done',
  skipped: 'Skipped',
}

interface TimeBlockListProps {
  blocks: TimeBlock[]
}

export default function TimeBlockList({ blocks: initialBlocks }: TimeBlockListProps) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const { addToast } = useToast()
  const supabase = createClient()

  async function updateStatus(block: TimeBlock, status: TimeBlock['status']) {
    const { error } = await supabase.from('time_blocks').update({ status }).eq('id', block.id)
    if (error) {
      addToast('Failed to update', 'error')
      return
    }
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, status } : b)))
  }

  if (blocks.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">📅</div>
        <div className="empty-title">No schedule yet</div>
        <div className="empty-body">Tap Generate Day Plan to create an AI time-blocked schedule.</div>
      </div>
    )
  }

  const sorted = [...blocks].sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map((block, i) => {
        const color = typeColors[block.type] || 'var(--text2)'
        const isDone = block.status === 'completed'
        const isSkipped = block.status === 'skipped'

        return (
          <div
            key={block.id}
            className="card-sm animate-fade-up"
            style={{
              animationDelay: `${i * 0.04}s`,
              opacity: isSkipped ? 0.4 : 1,
              borderLeft: `3px solid ${color}`,
              borderRadius: '0 12px 12px 0',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ minWidth: 72, flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
                {formatTime(block.start_time)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {formatTime(block.end_time)}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: isDone ? 'var(--text2)' : 'var(--text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                {block.title}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
                  {block.type}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>·</span>
                <select
                  value={block.status}
                  onChange={(e) => updateStatus(block, e.target.value as TimeBlock['status'])}
                  style={{
                    fontSize: 11,
                    color: 'var(--text2)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {(['planned', 'in_progress', 'completed', 'skipped'] as const).map((s) => (
                    <option key={s} value={s} style={{ background: 'var(--surface)' }}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
              {block.notes && (
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, lineHeight: 1.4 }}>
                  {block.notes}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

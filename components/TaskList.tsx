'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Task } from '@/types/database'
import { priorityColor, formatDate } from '@/lib/utils'
import { useToast } from './Toast'

interface TaskListProps {
  tasks: Task[]
  showOpportunity?: boolean
}

export default function TaskList({ tasks: initialTasks, showOpportunity = false }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const { addToast } = useToast()
  const supabase = createClient()

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'completed' ? 'open' : 'completed'
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)

    if (error) {
      addToast('Failed to update task', 'error')
      return
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">✓</div>
        <div className="empty-title">All clear</div>
        <div className="empty-body">No open tasks. Block a meeting to auto-create tasks.</div>
      </div>
    )
  }

  const open = tasks.filter((t) => t.status !== 'completed' && t.status !== 'skipped')
  const done = tasks.filter((t) => t.status === 'completed')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {open.map((task, i) => (
        <div
          key={task.id}
          className="card-sm animate-fade-up"
          style={{ animationDelay: `${i * 0.04}s`, display: 'flex', gap: 12, alignItems: 'flex-start' }}
        >
          <button
            onClick={() => toggleTask(task)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: `2px solid ${priorityColor(task.priority)}`,
              background: 'transparent',
              flexShrink: 0,
              marginTop: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>
              {task.title}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 5, alignItems: 'center' }}>
              <span
                className="chip"
                style={{
                  borderColor: priorityColor(task.priority) + '40',
                  color: priorityColor(task.priority),
                  background: priorityColor(task.priority) + '15',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {task.priority}
              </span>
              {task.due_date && (
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{formatDate(task.due_date)}</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 0 4px' }}>
            Completed ({done.length})
          </div>
          {done.map((task) => (
            <div
              key={task.id}
              className="card-sm"
              style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: 0.5 }}
            >
              <button
                onClick={() => toggleTask(task)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: '2px solid var(--green)',
                  background: 'var(--green)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2 6 5 9 10 3" />
                </svg>
              </button>
              <div style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'line-through' }}>
                {task.title}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

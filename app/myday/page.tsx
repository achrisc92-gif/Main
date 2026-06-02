'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import TaskList from '@/components/TaskList'
import TimeBlockList from '@/components/TimeBlockList'
import { useToast } from '@/components/Toast'
import { todayISO } from '@/lib/utils'
import type { Task, TimeBlock } from '@/types/database'

export default function MyDayPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const [tasks, setTasks] = useState<Task[]>([])
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData() // eslint-disable-line react-hooks/exhaustive-deps
  }, []) // intentional: runs once on mount

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const today = todayISO()

    const [tasksRes, blocksRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).in('status', ['open', 'in_progress', 'completed']).order('due_date', { ascending: true }),
      supabase.from('time_blocks').select('*').eq('user_id', user.id).eq('date', today).order('start_time'),
    ])

    setTasks(tasksRes.data || [])
    setBlocks(blocksRes.data || [])
    setLoading(false)
  }

  async function generateDayPlan() {
    setGenerating(true)
    try {
      const res = await fetch('/api/day-plan', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate plan')
      }
      const data = await res.json()
      setBlocks(data.blocks || [])
      addToast('Day plan generated!', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to generate plan', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const openTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'skipped')

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Day</h1>
          <div className="page-subtitle">{today}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span className="spinner" />
        </div>
      ) : (
        <>
          {/* Day Plan */}
          <div className="section animate-fade-up">
            <div className="section-header">
              <span className="section-title">Schedule</span>
              <button
                onClick={generateDayPlan}
                disabled={generating}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                {generating ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Generating…</> : '✨ Generate Plan'}
              </button>
            </div>
            <TimeBlockList blocks={blocks} />
          </div>

          {/* Tasks */}
          <div className="section animate-fade-up animate-fade-up-1">
            <div className="section-header">
              <span className="section-title">Tasks ({openTasks.length} open)</span>
            </div>
            <TaskList tasks={tasks} />
          </div>
        </>
      )}

      <BottomNav />
    </div>
  )
}

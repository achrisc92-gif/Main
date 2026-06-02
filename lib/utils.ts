export function healthScoreColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 70) return 'green'
  if (score >= 45) return 'amber'
  return 'red'
}

export function healthScoreHex(score: number): string {
  const color = healthScoreColor(score)
  if (color === 'green') return '#22C55E'
  if (color === 'amber') return '#F59E0B'
  return '#EF4444'
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return `${display}:${m} ${ampm}`
}

export function parseJSONSafely<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    return fallback
  }
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function priorityColor(priority: 'low' | 'medium' | 'high'): string {
  if (priority === 'high') return '#EF4444'
  if (priority === 'medium') return '#F59E0B'
  return '#22C55E'
}

export function stageToProgress(stage: string): number {
  const stages: Record<string, number> = {
    Prospecting: 10,
    Discovery: 25,
    Qualification: 40,
    Demo: 55,
    Proposal: 70,
    Negotiation: 85,
    'Closed Won': 100,
    'Closed Lost': 0,
  }
  return stages[stage] ?? 50
}

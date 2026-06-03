import type { Task, Opportunity, AgentConversation } from '@/types/database'

export function buildBlockItPrompt(
  notes: string,
  crm: string,
  framework: string,
  mode: string
): { system: string; user: string } {
  const system = `You are an elite sales operations assistant. Convert messy sales notes into CRM-ready sales intelligence.
Return ONLY valid JSON with no markdown, no explanation, no code fences.

The JSON must match this exact schema:
{
  "executive_summary": "2-3 sentence summary",
  "crm_notes": "Formatted CRM notes for ${crm}",
  "follow_up_email": { "subject": "...", "body": "..." },
  "next_best_action": "Single most important next step",
  "pain_points": ["array of pain points"],
  "buying_signals": ["array of buying signals"],
  "objections": ["array of objections raised"],
  "framework_analysis": {/* ${framework} fields with analysis */},
  "health_score": 0-100,
  "deal_stage": "Stage name",
  "stage_progress": 0-100,
  "tasks": [{ "title": "...", "due_date": "YYYY-MM-DD", "priority": "low|medium|high" }],
  "director_coaching": "Specific coaching advice (include if mode is director)",
  "company": "Company name if mentioned",
  "contact_name": "Contact name if mentioned",
  "contact_email": "Contact email if mentioned",
  "deal_value": null or number if mentioned
}

Health score rules: Green 70-100 (strong deal), Amber 45-69 (needs work), Red 0-44 (at risk).
Stage progress is % through the sales cycle (0=just started, 100=closed).

For framework_analysis, use these fields:
- MEDDICC: Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, Competition
- BANT: Budget, Authority, Need, Timeline
- SPICED: Situation, Pain, Impact, Critical Event, Decision
- Sandler: Pain, Budget, Decision
- Challenger: Reframe, Teach, Tailor, Take Control

AI mode context: ${mode === 'director' ? 'Include director_coaching with specific tactical advice.' : 'Omit director_coaching.'}
${mode === 'human' ? 'Write CRM notes in first-person, conversational tone as if the rep wrote them.' : ''}
${mode === 'export' ? 'Format CRM notes specifically for clean export to ' + crm + '.' : ''}`

  const user = `Sales notes to analyze:

${notes}

CRM target: ${crm}
Sales framework: ${framework}
Mode: ${mode}

Today's date: ${new Date().toISOString().split('T')[0]}`

  return { system, user }
}

export function buildDayPlanPrompt(
  tasks: Task[],
  opportunities: Opportunity[],
  profile: { role?: string | null; sales_style?: string | null }
): { system: string; user: string } {
  const system = `You are a high-performance sales productivity coach. Create a time-blocked daily schedule for a sales professional.
Return ONLY valid JSON array with no markdown, no explanation.

Each time block must match this schema:
[{
  "title": "Activity name",
  "type": "prospecting|discovery|followup|meeting|crm|pipeline|break|admin|other",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "notes": "Brief context"
}]

Rules:
- Start at 08:00, end by 18:00
- Include a lunch break (12:00-13:00)
- Group similar activities
- Prioritize high-value revenue activities in the morning
- Balance prospecting, follow-ups, and CRM work
- Tasks with today's due date get dedicated time blocks
- Keep blocks 30-90 minutes each`

  const user = `Open tasks: ${JSON.stringify(tasks.slice(0, 20).map(t => ({ title: t.title, priority: t.priority, due: t.due_date })))}
Active opportunities: ${JSON.stringify(opportunities.slice(0, 10).map(o => ({ company: o.company, stage: o.stage, health: o.health_score })))}
Role: ${profile.role || 'Account Executive'}
Sales style: ${profile.sales_style || 'Consultative'}
Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`

  return { system, user }
}

type PartialOpportunity = Pick<Opportunity, 'company' | 'stage' | 'health_score' | 'next_best_action'>
type PartialTask = Pick<Task, 'title' | 'priority' | 'due_date'>

export function buildDirectorPrompt(
  opportunities: PartialOpportunity[],
  tasks: PartialTask[],
  history: AgentConversation[]
): { system: string; messages: Array<{ role: 'user' | 'assistant'; content: string }> } {
  const context = opportunities.length > 0
    ? `Active pipeline: ${opportunities.map(o => `${o.company} (${o.stage}, health: ${o.health_score})`).join(', ')}`
    : 'No active opportunities on record.'

  const system = `You are an elite AI Sales Director — a practical revenue coach with deep expertise in enterprise sales, MEDDICC, BANT, SPICED, Sandler, and Challenger methodologies.

Your job: Give specific, actionable, deal-relevant coaching. No generic motivational fluff. No platitudes.
Speak like a seasoned VP of Sales who has closed hundreds of deals.

Current pipeline context:
${context}

Open tasks: ${tasks.slice(0, 5).map(t => t.title).join(', ') || 'None'}

Rules:
- Be direct and specific
- Reference actual deals when relevant
- Give tactical next steps, not vague advice
- Challenge the rep's thinking when needed
- Keep responses focused and concise (2-4 paragraphs max)`

  const messages = history.map(h => ({
    role: h.role as 'user' | 'assistant',
    content: h.content,
  })).filter(h => h.role === 'user' || h.role === 'assistant')

  return { system, messages }
}

export function buildExportText(
  output: {
    executive_summary?: string
    crm_notes?: string
    next_best_action?: string
    framework_analysis?: Record<string, unknown>
    health_score?: number
    deal_stage?: string
    follow_up_email?: { subject: string; body: string }
  },
  crm: string,
  company?: string,
  contact?: string
): string {
  const header = `=== ${crm.toUpperCase()} CRM UPDATE ===
Date: ${new Date().toLocaleDateString('en-US')}
${company ? `Account: ${company}` : ''}
${contact ? `Contact: ${contact}` : ''}
Stage: ${output.deal_stage || ''}
Health Score: ${output.health_score || 0}/100
`

  const notes = `
MEETING NOTES:
${output.crm_notes || ''}

NEXT STEP:
${output.next_best_action || ''}
`

  const framework = output.framework_analysis && Object.keys(output.framework_analysis).length > 0
    ? `\nFRAMEWORK ANALYSIS:\n${Object.entries(output.framework_analysis)
        .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
        .join('\n')}`
    : ''

  return `${header}${notes}${framework}`.trim()
}

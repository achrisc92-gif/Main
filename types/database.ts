export type Profile = {
  id: string
  user_id: string
  full_name: string | null
  role: string | null
  company: string | null
  sales_style: string | null
  default_crm: string
  default_framework: string
  email_signature: string | null
  gmail_email: string | null
  gmail_connected: boolean
  gmail_access_token: string | null
  gmail_refresh_token: string | null
  created_at: string
  updated_at: string
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export type Opportunity = {
  id: string
  user_id: string
  company: string
  contact_name: string | null
  contact_email: string | null
  deal_value: number | null
  stage: string
  health_score: number
  next_best_action: string | null
  notes: string | null
  framework_analysis: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type OpportunityInsert = Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>
export type OpportunityUpdate = Partial<Omit<Opportunity, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export type Task = {
  id: string
  user_id: string
  opportunity_id: string | null
  title: string
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'completed' | 'skipped'
  created_at: string
  updated_at: string
}

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export type TimeBlock = {
  id: string
  user_id: string
  title: string
  type: 'prospecting' | 'discovery' | 'followup' | 'meeting' | 'crm' | 'pipeline' | 'break' | 'admin' | 'other'
  start_time: string
  end_time: string
  date: string
  notes: string | null
  status: 'planned' | 'in_progress' | 'completed' | 'skipped'
  created_at: string
  updated_at: string
}

export type TimeBlockInsert = Omit<TimeBlock, 'id' | 'created_at' | 'updated_at'>

export type AiOutput = {
  id: string
  user_id: string
  opportunity_id: string | null
  input_notes: string
  crm: string
  framework: string
  ai_mode: string
  output_json: BlockItOutput
  created_at: string
}

export type VoiceNote = {
  id: string
  user_id: string
  transcript: string
  duration: number | null
  created_at: string
}

export type AgentConversation = {
  id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export type BlockItOutput = {
  executive_summary: string
  crm_notes: string
  follow_up_email: {
    subject: string
    body: string
  }
  next_best_action: string
  pain_points: string[]
  buying_signals: string[]
  objections: string[]
  framework_analysis: Record<string, unknown>
  health_score: number
  deal_stage: string
  stage_progress: number
  tasks: Array<{
    title: string
    due_date: string
    priority: 'low' | 'medium' | 'high'
  }>
  director_coaching?: string
  company?: string
  contact_name?: string
  contact_email?: string
  deal_value?: number
}

export type CRM = 'Salesforce' | 'HubSpot' | 'Dynamics' | 'Zoho' | 'Pipedrive' | 'Custom'
export type Framework = 'MEDDICC' | 'BANT' | 'SPICED' | 'Sandler' | 'Challenger'
export type AIMode = 'human' | 'ai' | 'director' | 'export'
export type ExportFormat = 'salesforce' | 'hubspot' | 'dynamics' | 'zoho' | 'pipedrive' | 'csv' | 'json' | 'copy'

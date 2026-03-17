export type TriggerType = 
  | 'PE investment'
  | 'VC investment'
  | 'acquisition'
  | 'disposal'
  | 'refancing'
  | 'leadership hire'
  | 'leadership exit'
  | 'positive trading update'
  | 'expansion'
  | 'restructuring'
  | 'other significant change'

export type EventStatus = 
  | 'new'
  | 'reviewed'
  | 'assigned'
  | 'actioned'
  | 'ignored'

export interface Consultant {
  id: string
  full_name: string
  email: string
  active: boolean
}

export interface MarketEvent {
  id: string
  company_name: string
  trigger_type: TriggerType
  summary: string | null
  source_url: string | null
  announcement_date: string
  sector: string | null
  geography: string | null
  key_contacts: string | null
  advisors: string | null
  investor: string | null
  likely_hiring_need: string | null
  consultant_id: string | null
  status: EventStatus
  priority_score: number
  created_at: string
  updated_at: string
  consultant?: Consultant | null

  // Stage 2: AI Enhancements
  raw_text?: string | null
  confidence_score?: number | null
  ai_summary?: string | null
  ai_why_it_matters?: string | null
  ai_hiring_need?: string | null
  ai_outreach_draft?: string | null
  ai_extracted_entities?: any | null
  is_automation_ingested?: boolean
}

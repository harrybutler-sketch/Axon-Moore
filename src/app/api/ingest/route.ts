import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractMarketTrigger } from '@/lib/openai'
import { type MarketEvent } from '@/types'

export async function POST(request: Request) {
  try {
    const { type, content } = await request.json()
    const supabase = await createClient()

    // 1. Run AI Extraction
    const extractedData = await extractMarketTrigger(content)

    // 2. Prepare Data for Supabase
    const eventData = {
      company_name: extractedData.company_name,
      trigger_type: mapTriggerType(extractedData.event_type),
      summary: extractedData.summary,
      sector: extractedData.sector,
      geography: extractedData.geography,
      announcement_date: extractedData.event_date,
      source_url: type === 'url' ? content : '#',
      priority_score: mapUrgencyToScore(extractedData.urgency_level),
      status: extractedData.confidence_score > 0.7 ? 'new' : 'reviewed',
      
      // Stage 2 Fields
      raw_text: content,
      confidence_score: extractedData.confidence_score,
      ai_summary: extractedData.summary,
      ai_why_it_matters: extractedData.ai_why_it_matters,
      ai_hiring_need: extractedData.likely_hiring_need,
      ai_outreach_draft: extractedData.outreach_email_draft,
      ai_extracted_entities: extractedData,
      is_automation_ingested: false,
    }

    // 3. Insert into Supabase
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (error) throw error

    // 4. Auto-assignment (Simple Geography Logic)
    if (extractedData.geography.toLowerCase().includes('manchester') || extractedData.geography.toLowerCase().includes('north')) {
      const { data: consultant } = await supabase
        .from('consultants')
        .select('id')
        .ilike('full_name', '%Sarah%')
        .single()
      
      if (consultant) {
        await supabase
          .from('events')
          .update({ consultant_id: consultant.id, status: 'assigned' })
          .eq('id', data.id)
      }
    }

    return NextResponse.json({ id: data.id })
  } catch (error: any) {
    console.error('Ingest Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function mapTriggerType(type: string): string {
  const types = [
    'PE investment', 'VC investment', 'acquisition', 'disposal', 
    'refining', 'leadership hire', 'leadership exit', 
    'positive trading update', 'expansion', 'restructuring', 'other'
  ]
  const normalized = type.toLowerCase()
  return types.find(t => normalized.includes(t.toLowerCase())) || 'other'
}

function mapUrgencyToScore(urgency: string): number {
  switch (urgency.toLowerCase()) {
    case 'high': return 90
    case 'medium': return 60
    case 'low': return 30
    default: return 50
  }
}

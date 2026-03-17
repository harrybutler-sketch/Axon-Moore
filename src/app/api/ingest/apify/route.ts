import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runApifyActor, getApifyDataset } from '@/lib/apify'
import { extractMarketTrigger } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const { action, actorId, input, datasetId } = await request.json()

    if (action === 'trigger') {
      const run = await runApifyActor(actorId, input)
      console.log(`[Apify] Triggered actor ${actorId}. Run ID: ${run.id}`)
      return NextResponse.json({ runId: run.id, datasetId: run.defaultDatasetId })
    }

    const supabase = await createClient()

    if (action === 'ingest') {
      if (!datasetId) {
        return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 })
      }

      const items = await getApifyDataset(datasetId)
      const results = []

      // Limit to first 5 items to avoid overloading in this demo
      for (const item of items.slice(0, 5)) {
        // Extract raw text from different scraper formats
        const content = item.description || item.text || item.title || JSON.stringify(item)
        
        try {
          const extractedData = await extractMarketTrigger(content)
          
          const eventData = {
            company_name: extractedData.company_name,
            trigger_type: mapTriggerType(extractedData.event_type),
            summary: extractedData.summary,
            sector: extractedData.sector,
            geography: extractedData.geography,
            announcement_date: extractedData.event_date,
            source_url: item.url || '#',
            priority_score: mapUrgencyToScore(extractedData.urgency_level),
            status: extractedData.confidence_score > 0.7 ? 'new' : 'reviewed',
            raw_text: content,
            confidence_score: extractedData.confidence_score,
            ai_summary: extractedData.summary,
            ai_why_it_matters: extractedData.ai_why_it_matters,
            ai_hiring_need: extractedData.likely_hiring_need,
            ai_outreach_draft: extractedData.outreach_email_draft,
            ai_extracted_entities: extractedData,
            is_automation_ingested: true,
          }

          const { data, error } = await supabase
            .from('events')
            .insert([eventData])
            .select()
            .single()

          if (!error) results.push(data)
        } catch (e) {
          console.error('Error processing item:', e)
        }
      }

      return NextResponse.json({ ingestedCount: results.length, events: results })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Apify Ingest Error:', error)
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

import { createClient } from '@/lib/supabase/server'
import { extractMarketTrigger } from '@/lib/openai'

// Mock news feeds
const MOCK_NEWS_FEED = [
  "Manchester fintech TechPay raises £20m Series B to expand European operations.",
  "Retail giant HomeCloud announces surprise departure of CFO Robert Sterling.",
  "PE firm BridgePoint acquires majority stake in North West logistics firm CargoFast.",
  "London AI startup DeepMinders secures seed funding from LocalGlobe."
]

export async function automationWorker() {
  console.log('--- Starting Automation Worker ---')
  const supabase = await createClient()

  for (const headline of MOCK_NEWS_FEED) {
    console.log(`Processing: ${headline}`)
    
    // 1. Check if we already have this company/event (simple check)
    const companyName = headline.split(' ')[0] // Very crude
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .ilike('company_name', `%${companyName}%`)
      .limit(1)

    if (existing && existing.length > 0) {
      console.log(`Skipping existing company: ${companyName}`)
      continue
    }

    // 2. AI Extraction
    try {
      const extractedData = await extractMarketTrigger(headline)
      
      // 3. Ingest if high confidence/relevance
      if (extractedData.confidence_score > 0.6) {
        const { error } = await supabase.from('events').insert([{
          company_name: extractedData.company_name,
          trigger_type: extractedData.event_type.toLowerCase().includes('investment') ? 'PE investment' : 'acquisition',
          summary: extractedData.summary,
          sector: extractedData.sector,
          geography: extractedData.geography,
          announcement_date: extractedData.event_date,
          source_url: '#',
          priority_score: extractedData.urgency_level === 'high' ? 90 : 50,
          status: 'new',
          raw_text: headline,
          confidence_score: extractedData.confidence_score,
          ai_summary: extractedData.summary,
          ai_why_it_matters: extractedData.ai_why_it_matters,
          ai_hiring_need: extractedData.likely_hiring_need,
          ai_outreach_draft: extractedData.outreach_email_draft,
          ai_extracted_entities: extractedData,
          is_automation_ingested: true
        }])

        if (error) console.error('Ingestion error:', error)
        else console.log(`Successfully ingested: ${extractedData.company_name}`)
      }
    } catch (err) {
      console.error('AI Error during automation:', err)
    }
  }
  
  console.log('--- Automation Worker Finished ---')
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runApifyActor, getApifyDataset, waitForApifyRun } from '@/lib/apify'
import { extractMarketTrigger } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const { action, actorId, input, datasetId, runId } = await request.json()

    if (action === 'trigger') {
      const token = process.env.APIFY_API_TOKEN;
      const hasToken = !!token;
      console.log('--------------------------------------------------');
      console.log(`[APIFY TRIGGER DEBUG]`);
      console.log(`Action: trigger`);
      console.log(`Actor ID: ${actorId}`);
      console.log(`Token Found: ${hasToken} (${hasToken ? token.substring(0, 10) + '...' : 'NONE'})`);
      console.log(`Input: ${JSON.stringify(input).substring(0, 100)}...`);
      
      try {
        const run = await runApifyActor(actorId, input)
        console.log(`[APIFY SUCCESS] Run ID: ${run.id}`);
        console.log('--------------------------------------------------');
        return NextResponse.json({ runId: run.id, datasetId: run.defaultDatasetId })
      } catch (err: any) {
        console.error(`[APIFY FAILURE] ${err.message}`);
        console.log('--------------------------------------------------');
        throw err; // Let the catch block handle the response
      }
    }

    const supabase = await createClient()

    if (action === 'ingest') {
      if (!datasetId && !runId) {
        return NextResponse.json({ error: 'Dataset ID or Run ID is required' }, { status: 400 })
      }

      let targetDatasetId = datasetId;

      // If runId is provided, wait for it to finish and get the datasetId
      if (runId) {
        console.log(`[Apify Ingest] Waiting for run ${runId} to finish...`);
        try {
          const run = await waitForApifyRun(runId);
          targetDatasetId = run.defaultDatasetId;
          console.log(`[Apify Ingest] Run finished. Dataset ID: ${targetDatasetId}`);
        } catch (waitErr: any) {
          console.error(`[Apify Ingest] Wait failed: ${waitErr.message}`);
          return NextResponse.json({ error: waitErr.message }, { status: 500 });
        }
      }

      console.log(`[Apify Ingest] Fetching data from dataset ${targetDatasetId}...`);
      const rawItems = await getApifyDataset(targetDatasetId)
      
      // Flatten organic results if they exist (Google Search format)
      let items: any[] = []
      rawItems.forEach((item: any) => {
        if (item.organicResults && Array.isArray(item.organicResults)) {
          items = [...items, ...item.organicResults]
        } else if (item.results && Array.isArray(item.results)) {
          items = [...items, ...item.results]
        } else {
          items.push(item)
        }
      })

      const results: any[] = []

      console.log(`[Apify Ingest] Processing ${items.length} items...`);
      // Limit to first 10 items for a rich demo
      for (const item of items.slice(0, 10)) {
        // Extract raw text from different scraper formats
        const content = `${item.title || ''}\n${item.description || item.snippet || item.text || ''}`
        
        try {
          console.log(`[Apify Ingest] Extracting from: ${item.title?.substring(0, 30)}...`);
          const extractedData = await extractMarketTrigger(content)
          console.log(`[Apify Ingest] Success: ${extractedData.company_name}`);
          const eventData = {
            id: 'apify-' + (item.id || Math.random().toString(36).substr(2, 9)),
            company_name: extractedData.company_name,
            trigger_type: mapTriggerType(extractedData.event_type),
            summary: extractedData.summary,
            sector: extractedData.sector,
            geography: extractedData.geography,
            announcement_date: extractedData.event_date || new Date().toISOString(),
            source_url: item.url || '#',
            priority_score: mapUrgencyToScore(extractedData.urgency_level),
            status: 'new',
            raw_text: content,
            confidence_score: extractedData.confidence_score,
            ai_summary: extractedData.summary,
            ai_why_it_matters: extractedData.ai_why_it_matters,
            ai_hiring_need: extractedData.likely_hiring_need,
            ai_outreach_draft: extractedData.outreach_email_draft,
            ai_extracted_entities: extractedData,
            is_automation_ingested: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          // Always add to results for the local demo return
          results.push(eventData)

          // Try to save to Supabase if available
          try {
            await supabase.from('events').insert([eventData])
          } catch (dbErr) {
            // Silently fail DB insert in demo mode
          }
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

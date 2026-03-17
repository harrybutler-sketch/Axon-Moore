import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
})

// Schema for structured extraction
export const ExtractionSchema = z.object({
  company_name: z.string(),
  event_type: z.string(),
  event_date: z.string(),
  sector: z.string(),
  geography: z.string(),
  summary: z.string(),
  
  // High-value contacts for Axon Moore
  senior_leadership: z.array(z.object({
    name: z.string(),
    role: z.string(),
    context: z.string().describe("e.g. Founder, Incoming CFO, Departing MD")
  })),
  
  investors: z.array(z.object({
    firm_name: z.string(),
    investment_director: z.string().optional(),
    type: z.string().describe("e.g. PE, VC, Angel")
  })),
  
  advisors: z.array(z.object({
    firm_name: z.string(),
    individual_name: z.string().optional(),
    category: z.enum(['Corporate Finance', 'Legal', 'Tax', 'Commercial DD', 'Other'])
  })),

  likely_trigger_reason: z.string(),
  likely_hiring_need: z.string(),
  urgency_level: z.enum(['low', 'medium', 'high']),
  confidence_score: z.number().min(0).max(1),
  ai_why_it_matters: z.string(),
  suggested_next_action: z.string(),
  outreach_email_draft: z.string(),
})

export type ExtractedData = z.infer<typeof ExtractionSchema>

export async function extractMarketTrigger(text: string): Promise<ExtractedData> {
  // If no API key, return demo data
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not found. Returning mock extraction.')
    return getMockExtraction(text)
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert recruitment researcher for Axon Moore.
        Your goal is to extract intelligence from market announcements to help our marketing team equip consultants for high-quality outreach.
        
        CRITICAL FOCUS ON RECRUITMENT TRIGGERS:
        1. Changes in Leadership: CEO, MD, CFO, FD, or Financial Controller appointments or exits.
        2. Investment/Funding: Private Equity (PE) or Venture Capital (VC) investment, Series A/B/C rounds, or Growth Capital.
        3. M&A Activity: Completion of acquisitions, company disposals, or sales of businesses.
        4. Financial Structural Changes: Refinancing, restructuring, or scale-up professionalization.
        5. Positive Performance: PR updates on positive trading or expansion plans.
        
        GOAL: Identify events that indicate a "significant change" requiring recruitment services (especially finance team professionalization or inherited team refresh).
        
        EXTRACTION TASKS:
        1. Identify the Senior Leadership (CEO, MD, Founders).
        2. Identify the PE/VC Investment Director if mentioned.
        3. Identify ALL Advisors (Corporate Finance, Legal, Tax) - both firms AND specific individuals.
        4. Predict the likely finance team hiring needs (CFO, FD, Financial Controller, etc.).`
      },
      {
        role: 'user',
        content: text
      }
    ],
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No content returned from OpenAI')

  return JSON.parse(content) as ExtractedData
}

function getMockExtraction(text: string): ExtractedData {
  return {
    company_name: text.substring(0, 20).split(' ')[0] || 'Unknown Corp',
    event_type: 'PE investment',
    event_date: new Date().toISOString().split('T')[0],
    sector: 'Technology',
    geography: 'Manchester, UK',
    summary: 'Mock summary of the extracted article text.',
    
    senior_leadership: [
      { name: 'Sarah Smith', role: 'CEO', context: 'Founder' },
      { name: 'Mark Jones', role: 'CFO', context: 'Incoming post-deal' }
    ],
    
    investors: [
      { firm_name: 'Summit Partners', investment_director: 'David Ross', type: 'PE' }
    ],
    
    advisors: [
      { firm_name: 'Deloitte', individual_name: 'Jane Doe', category: 'Tax' },
      { firm_name: 'Goldman Sachs', individual_name: 'Richard Branson', category: 'Corporate Finance' }
    ],

    likely_trigger_reason: 'Recent Series B funding round.',
    likely_hiring_need: 'CFO, Finance Director',
    urgency_level: 'high',
    confidence_score: 0.95,
    ai_why_it_matters: 'Scale-up companies often professionalize their finance function after PE investment.',
    suggested_next_action: 'Direct outreach to CEO regarding their finance team expansion.',
    outreach_email_draft: 'Hi [Name], I saw the great news about [Company]...',
  }
}

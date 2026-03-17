import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
})

export async function generateCredentialCopy(eventDetails: any) {
  const prompt = `
    You are a marketing strategist for Axon Moore.
    Based on this market trigger, generate a high-impact "Credential Summary" that our consultants can use to demonstrate our expertise.
    
    EVENT: ${JSON.stringify(eventDetails)}
    
    FORMAT:
    1. MARKET CONTEXT: Why this specific deal matters in the current sector climate.
    2. OUR CREDENTIALS: A template section highlighting similar work (use professional tone).
    3. TARGETED OUTREACH ANGLE: Specific talking points for:
       - The CEO/Founder (Congratulatory, focus on scale)
       - The PE Investor (Focus on portco professionalization)
       - The CF/Legal Advisors (Focus on speed and quality of finance team hires)
  `

  if (!process.env.OPENAI_API_KEY) {
    return "MOCK CREDENTIAL COPY: [Axon Moore Credentials for " + eventDetails.company_name + "]. We have a strong track record in " + eventDetails.sector + "..."
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }]
  })

  return response.choices[0].message.content
}

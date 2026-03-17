import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CONSULTANTS = [
  { full_name: 'Mark Taylor', email: 'm.taylor@axonmoore.com', active: true },
  { full_name: 'Sarah Jenkins', email: 's.jenkins@axonmoore.com', active: true },
  { full_name: 'David Lloyd', email: 'd.lloyd@axonmoore.com', active: true },
  { full_name: 'Emma Richardson', email: 'e.richardson@axonmoore.com', active: true },
]

const EVENTS = [
  {
    company_name: 'FinTech Dynamics',
    trigger_type: 'PE investment',
    summary: 'Series B funding of $45m from Summit Partners. Likely need for a CFO with PE exit experience and a new Finance Director to scale the Manchester hub.',
    sector: 'Technology / Finance',
    geography: 'Manchester, UK',
    priority_score: 85,
    status: 'new',
    likely_hiring_need: 'CFO, Finance Director',
    announcement_date: '2026-03-01'
  },
  {
    company_name: 'Global Logistics Ltd',
    trigger_type: 'acquisition',
    summary: 'Acquired by DHL. Group reporting structure likely to change. Potential transition for the existing FD or need for integration specialist.',
    sector: 'Logistics',
    geography: 'North West / London',
    priority_score: 92,
    status: 'reviewed',
    likely_hiring_need: 'Group Controller, M&A Specialist',
    announcement_date: '2026-03-05'
  },
  {
    company_name: 'CloudScale AI',
    trigger_type: 'VC investment',
    summary: 'Raising seed round. Need first finance hire - likely a Finance Manager or part-time FD.',
    sector: 'Technology / AI',
    geography: 'London',
    priority_score: 45,
    status: 'new',
    likely_hiring_need: 'Finance Manager',
    announcement_date: '2026-03-10'
  },
  {
    company_name: 'Retail Group PLC',
    trigger_type: 'leadership exit',
    summary: 'CFO Graham Bell retiring after 12 years. Succession plan not yet confirmed. High priority search opportunity.',
    sector: 'Retail',
    geography: 'Leeds, UK',
    priority_score: 98,
    status: 'assigned',
    likely_hiring_need: 'CFO (Search)',
    announcement_date: '2026-03-08'
  },
  {
    company_name: 'Energy Solutions',
    trigger_type: 'expansion',
    summary: 'Opening new office in Berlin. Need DACH-region finance leads.',
    sector: 'Renewables',
    geography: 'Berlin / Global',
    priority_score: 65,
    status: 'new',
    likely_hiring_need: 'Regional Finance Lead',
    announcement_date: '2026-03-11'
  }
]

export async function seed() {
  console.log('Seeding consultants...')
  const { data: consultants, error: cError } = await supabase
    .from('consultants')
    .insert(CONSULTANTS)
    .select()

  if (cError) {
    console.error('Error seeding consultants:', cError)
    return
  }

  console.log('Seeding events...')
  const eventsWithConsultants = EVENTS.map((event, i) => ({
    ...event,
    consultant_id: consultants[i % consultants.length].id
  }))

  const { error: eError } = await supabase
    .from('events')
    .insert(eventsWithConsultants)

  if (eError) {
    console.error('Error seeding events:', eError)
  } else {
    console.log('Seeding complete!')
  }
}

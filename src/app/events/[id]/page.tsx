'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Building2, 
  MapPin, 
  Tag, 
  Calendar, 
  Link as LinkIcon, 
  User as UserIcon,
  ChevronLeft,
  ExternalLink,
  Briefcase,
  Users as UsersIcon,
  Handshake,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  FileText,
  Copy,
  FileSearch,
  Loader2
} from 'lucide-react'
import { type MarketEvent, type Consultant, type EventStatus } from '@/types'
import Link from 'next/link'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [event, setEvent] = useState<MarketEvent | null>(null)
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [generatingMarketing, setGeneratingMarketing] = useState(false)
  const [marketingCopy, setMarketingCopy] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const [eventRes, consultantsRes] = await Promise.all([
        supabase.from('events').select('*, consultant:consultants(*)').eq('id', id).single(),
        supabase.from('consultants').select('*').eq('active', true)
      ])

      if (eventRes.data) setEvent(eventRes.data)
      if (consultantsRes.data) setConsultants(consultantsRes.data)
      setLoading(false)
    }
    loadData()
  }, [id, supabase])

  const updateStatus = async (status: EventStatus) => {
    setUpdating(true)
    const { error } = await supabase.from('events').update({ status }).eq('id', id)
    if (!error) setEvent(prev => prev ? { ...prev, status } : null)
    setUpdating(false)
  }

  const assignConsultant = async (consultant_id: string | null) => {
    setUpdating(true)
    const { error } = await supabase.from('events').update({ consultant_id }).eq('id', id)
    if (!error) {
      const consultant = consultants.find(c => c.id === consultant_id) || null
      setEvent(prev => prev ? { ...prev, consultant_id, consultant } as MarketEvent : null)
    }
    setUpdating(false)
  }

  const generateMarketing = async () => {
    setGeneratingMarketing(true)
    try {
      const response = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
      const data = await response.json()
      setMarketingCopy(data.content)
    } catch (err) {
      console.error(err)
    } finally {
      setGeneratingMarketing(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-white/30">Loading event details...</div>
  if (!event) return <div className="p-12 text-center text-white/30">Event not found.</div>

  const statusOptions: EventStatus[] = ['new', 'reviewed', 'assigned', 'actioned', 'ignored']

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">{event.company_name}</h1>
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-full border",
                event.priority_score >= 80 ? 'text-red-400 border-red-400/20 bg-red-400/10' : 'text-orange-400 border-orange-400/20 bg-orange-400/10'
              )}>
                P{event.priority_score}
              </span>
            </div>
            <div className="flex items-center gap-4 text-white/40 text-sm">
              <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-brand-orange" /> {event.trigger_type}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.geography || 'Global'}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.announcement_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {event.source_url && (
            <a href={event.source_url} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all text-sm">
              <ExternalLink className="w-4 h-4" /> Source
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Section */}
          <section className="glass-card p-8 rounded-2xl border border-white/10">
            <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-6 flex items-center gap-3">
              <AlertCircle className="w-4 h-4" /> Why this matters
            </h2>
            <p className="text-white/80 leading-relaxed text-lg whitespace-pre-wrap">
              {event.summary || 'No summary provided for this event.'}
            </p>
          </section>

          {/* Detailed Contexts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Business Context
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1">Sector</label>
                  <p className="text-white/90">{event.sector || 'Unspecified'}</p>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1">Investor(s)</label>
                  <p className="text-white/90">{event.investor || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1">Advisors</label>
                  <p className="text-white/90">{event.advisors || 'N/A'}</p>
                </div>
              </div>
            </section>

            <section className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                <UsersIcon className="w-3 h-3" /> Deal Team & Leadership
              </h3>
              <div className="space-y-4">
                {event.ai_extracted_entities?.senior_leadership && Array.isArray(event.ai_extracted_entities.senior_leadership) && event.ai_extracted_entities.senior_leadership.length > 0 ? (
                  <div className="space-y-3">
                    {event.ai_extracted_entities.senior_leadership.map((person: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5">
                        <div>
                          <p className="text-sm font-bold text-white">{person.name}</p>
                          <p className="text-[10px] text-white/40 uppercase">{person.role}</p>
                        </div>
                        <span className="text-[10px] text-brand-orange/70 font-bold">{person.context}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] text-white/40 uppercase block mb-1">Key Contacts</label>
                    <p className="text-white/90">{event.key_contacts || 'No contacts documented'}</p>
                  </div>
                )}
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1">Likely Hiring Need</label>
                  <p className="text-white font-semibold text-brand-orange">{event.likely_hiring_need || 'Unknown'}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Advisors & Investors Detailed Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                <Handshake className="w-3 h-3" /> Deal Advisors
              </h3>
              <div className="space-y-2">
                {event.ai_extracted_entities?.advisors && Array.isArray(event.ai_extracted_entities.advisors) && event.ai_extracted_entities.advisors.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-white/5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-white/30 uppercase font-bold">
                        <tr>
                          <th className="p-2">Firm</th>
                          <th className="p-2">Individual</th>
                          <th className="p-2">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {event.ai_extracted_entities.advisors.map((adv: any, i: number) => (
                          <tr key={i} className="text-white/80">
                            <td className="p-2 font-bold">{adv.firm_name}</td>
                            <td className="p-2">{adv.individual_name || '-'}</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px]">{adv.category}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-white/30 italic">No advisors identified yet.</p>
                )}
              </div>
            </section>

            <section className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Investors / PE
              </h3>
              <div className="space-y-2">
                {event.ai_extracted_entities?.investors && Array.isArray(event.ai_extracted_entities.investors) && event.ai_extracted_entities.investors.length > 0 ? (
                  <div className="space-y-3">
                    {event.ai_extracted_entities.investors.map((inv: any, i: number) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-white">{inv.firm_name}</p>
                          <p className="text-[10px] text-white/40 uppercase">{inv.type}</p>
                        </div>
                        {inv.investment_director && (
                          <div className="text-right">
                            <p className="text-[10px] text-white/30 uppercase mb-0.5">Director</p>
                            <p className="text-xs font-bold text-brand-orange">{inv.investment_director}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/30 italic">No investors identified yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <section className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Management</h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block ml-1">Current Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={updating}
                    className={cn(
                      "text-[10px] font-bold py-2 rounded-lg border transition-all truncate",
                      event.status === s 
                        ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20' 
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block ml-1">Assign Consultant</label>
              <select
                value={event.consultant_id || ''}
                onChange={e => assignConsultant(e.target.value || null)}
                disabled={updating}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
              >
                <option value="">Unassigned</option>
                {consultants.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
          </section>

          {/* Marketing Credential Generator */}
          <section className="glass-card p-6 rounded-2xl border border-brand-orange/30 bg-brand-orange/[0.02] space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                <FileSearch className="text-brand-orange w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Marketing Credential Hub</h4>
            </div>
            
            <p className="text-xs text-white/50 leading-relaxed italic">
              Generate branded credential copy for consultants to use in outreach to CEOs, Investors, and Advisors.
            </p>

            {!marketingCopy ? (
              <button
                onClick={generateMarketing}
                disabled={generatingMarketing}
                className="w-full orange-gradient text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {generatingMarketing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Sales Collateral
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-white/80 leading-relaxed space-y-4 whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
                  {marketingCopy}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(marketingCopy)
                    alert('Collateral copied!')
                  }}
                  className="w-full bg-white/5 border border-white/10 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-white/10 transition-colors uppercase"
                >
                  <Copy className="inline w-3 h-3 mr-1" /> Copy Collateral
                </button>
                <button
                  onClick={() => setMarketingCopy(null)}
                  className="w-full text-[9px] text-white/20 hover:text-white/40 uppercase font-bold"
                >
                  Regenerate
                </button>
              </div>
            )}
          </section>

          {/* AI Intelligence Section */}
          {event.ai_summary && (
            <section className="glass-card rounded-2xl border border-brand-orange/30 overflow-hidden bg-brand-orange/[0.03]">
              <div className="bg-brand-orange/10 px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-orange" />
                  <h3 className="font-bold text-white uppercase tracking-widest text-xs">AI Market Intelligence</h3>
                </div>
                {event.confidence_score !== undefined && event.confidence_score !== null && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    event.confidence_score > 0.8 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {Math.round(event.confidence_score * 100)}% Confidence
                  </span>
                )}
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest leading-none">AI Summary</p>
                  <p className="text-sm text-white/70 leading-relaxed italic">"{event.ai_summary}"</p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest leading-none">Why it matters</p>
                    <p className="text-xs text-white/80 leading-relaxed font-outfit uppercase">{event.ai_why_it_matters}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest leading-none">Likely Hiring Need</p>
                    <p className="text-xs font-bold text-brand-orange uppercase">{event.ai_hiring_need}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-white/30" />
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Outreach Draft</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (event.ai_outreach_draft) {
                          navigator.clipboard.writeText(event.ai_outreach_draft)
                          alert('Draft copied!')
                        }
                      }}
                      className="text-[10px] text-brand-orange hover:underline uppercase font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 italic text-sm text-white/40 leading-relaxed whitespace-pre-wrap">
                    {event.ai_outreach_draft}
                  </div>
                </div>

                <div className="pt-4">
                  <button className="text-[10px] font-bold text-white/40 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" /> Regenerate Analysis
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="glass-card p-6 rounded-2xl border border-orange-500/20 bg-orange-500/[0.02] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-brand-orange w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Market Action</h4>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Based on this <span className="text-white font-bold">{event.trigger_type}</span>, we expect 
              immediate movement in {event.sector || 'this sector'}. Reach out to existing contacts at 
              <span className="text-white font-bold ml-1">{event.company_name}</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

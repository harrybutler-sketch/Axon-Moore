'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ExternalLink, 
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  User as UserIcon,
  Download,
  Loader2
} from 'lucide-react'
import { type MarketEvent, type TriggerType, type EventStatus } from '@/types'
import Link from 'next/link'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const MOCK_EVENTS: MarketEvent[] = [
  {
    id: '1',
    company_name: 'FinTech Dynamics',
    trigger_type: 'PE investment',
    summary: 'Series B funding of $45m from Summit Partners. Likely need for a CFO with PE exit experience and a new Finance Director to scale the Manchester hub.',
    sector: 'Technology / Finance',
    geography: 'Manchester, UK',
    priority_score: 85,
    status: 'new',
    likely_hiring_need: 'CFO, Finance Director',
    announcement_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_url: '#',
    key_contacts: 'John Doe (CEO), Jane Smith (COO)',
    advisors: 'Goldman Sachs',
    investor: 'Summit Partners',
    consultant_id: null
  },
  {
    id: '2',
    company_name: 'Global Logistics Ltd',
    trigger_type: 'acquisition',
    summary: 'Acquired by DHL. Group reporting structure likely to change. Potential transition for the existing FD or need for integration specialist.',
    sector: 'Logistics',
    geography: 'London / North West',
    priority_score: 92,
    status: 'reviewed',
    likely_hiring_need: 'Group Controller, M&A Specialist',
    announcement_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_url: '#',
    key_contacts: 'Robert Brown (Founder)',
    advisors: 'KPMG',
    investor: 'DHL Group',
    consultant_id: null
  },
  {
    id: '3',
    company_name: 'CloudScale AI',
    trigger_type: 'VC investment',
    summary: 'Raising seed round. Need first finance hire - likely a Finance Manager or part-time FD.',
    sector: 'Technology / AI',
    geography: 'London',
    priority_score: 45,
    status: 'new',
    likely_hiring_need: 'Finance Manager',
    announcement_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_url: '#',
    key_contacts: 'Alice Wang (CTO)',
    advisors: 'SeedLegals',
    investor: 'LocalGlobe',
    consultant_id: null
  }
]

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function EventsTable() {
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [triggerFilter, setTriggerFilter] = useState<TriggerType | 'all'>('all')
  const [scraping, setScraping] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*, consultant:consultants(*)')
        .order('priority_score', { ascending: false })

      if (!error && data && data.length > 0) {
        setEvents(data)
      } else {
        setEvents(MOCK_EVENTS)
      }
      setLoading(false)
    }

    fetchEvents()
  }, [supabase])

  const handleScrapeLatest = async () => {
    setScraping(true)
    try {
      // 1. Trigger Google Scraper
      const googleRes = await fetch('/api/ingest/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'trigger',
          actorId: 'apify/google-search-scraper',
          input: { 
            queries: [
              'new Private Equity investment UK 2024',
              'CFO appointment Manchester recruitment',
              'Finance Director hire London PE',
              'M&A news finance UK mergers',
              'Series A funding UK finance team',
              'Series B funding UK finance team',
              'Private Equity exit UK news',
              'Interim FD roles Manchester',
              'Scale-up company CFO hiring UK',
              'company restructuring finance team news UK',
              'refinancing news finance UK',
              'positive trading update UK company',
              'acquisition completed finance news UK',
              'business sale news UK finance',
              'new CFO starting role PE portco'
            ].join(', '),
            maxPagesPerQuery: 1 
          }
        })
      })
      const googleData = await googleRes.json()

      // 2. Trigger LinkedIn Scraper
      const linkedinRes = await fetch('/api/ingest/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'trigger',
          actorId: 'apify/linkedin-search-scraper',
          input: { 
            searchUrl: 'https://www.linkedin.com/search/results/content/?keywords=(hiring%20OR%20"new%20role"%20OR%20"appointed"%20OR%20"started")%20AND%20(CFO%20OR%20"Finance%20Director"%20OR%20"Financial%20Controller"%20OR%20"FD")%20AND%20(PE%20OR%20VC%20OR%20"Private%20Equity"%20OR%20"Venture%20Capital"%20OR%20"refinancing"%20OR%20"acquisition")'
          }
        })
      })
      const linkedinData = await linkedinRes.json()

      // 3. Wait a few seconds to simulate/allow start (in real app would use webhooks)
      await new Promise(r => setTimeout(r, 3000))

      // 4. Ingest Google Results
      if (googleData.datasetId) {
        await fetch('/api/ingest/apify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ingest', datasetId: googleData.datasetId })
        })
      }

      // 5. Ingest LinkedIn Results
      if (linkedinData.datasetId) {
        await fetch('/api/ingest/apify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ingest', datasetId: linkedinData.datasetId })
        })
      }

      // 6. Refresh Events
      const { data } = await supabase
        .from('events')
        .select('*, consultant:consultants(*)')
        .order('priority_score', { ascending: false })
      
      if (data) setEvents(data)
    } catch (err) {
      console.error('Scrape failed:', err)
    } finally {
      setScraping(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.company_name.toLowerCase().includes(search.toLowerCase()) || 
                          event.summary?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    const matchesTrigger = triggerFilter === 'all' || event.trigger_type === triggerFilter
    return matchesSearch && matchesStatus && matchesTrigger
  })

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'reviewed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'assigned': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'actioned': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'ignored': return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-red-400 bg-red-400/10 border-red-400/20'
    if (score >= 50) return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
    return 'text-green-400 bg-green-400/10 border-green-400/20'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search companies or summaries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white/70 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="assigned">Assigned</option>
            <option value="actioned">Actioned</option>
            <option value="ignored">Ignored</option>
          </select>

          <select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white/70 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
          >
            <option value="all">All Triggers</option>
            <option value="PE investment">PE Investment</option>
            <option value="VC investment">VC Investment</option>
            <option value="acquisition">Acquisition</option>
            <option value="leadership hire">Leadership Hire</option>
          </select>

          <button
            onClick={handleScrapeLatest}
            disabled={scraping}
            className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {scraping ? 'Scraping...' : 'Scrape Latest'}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Company</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Trigger</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Priority</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Consultant</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30">Loading market events...</td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30">No matching events found.</td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold group-hover:text-brand-orange transition-colors">
                          {event.company_name}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-white/20" />
                            <span className="text-[10px] text-white/40">{event.geography || 'N/A'}</span>
                          </div>
                          {event.source_url && event.source_url !== '#' && (
                            <a 
                              href={event.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] text-brand-orange hover:underline group/link"
                            >
                              <ExternalLink className="w-3 h-3 text-brand-orange/60 group-hover/link:text-brand-orange" />
                              Source
                            </a>
                          )}
                          <span className="text-white/10">•</span>
                          <span className="text-[10px] text-white/40">{event.sector || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-orange" />
                        <span className="text-sm text-white/70 italic">{event.trigger_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full border",
                        getPriorityColor(event.priority_score)
                      )}>
                        {event.priority_score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full border",
                        getStatusColor(event.status)
                      )}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <UserIcon className="w-3 h-3 text-white/30" />
                        </div>
                        <span className="text-xs text-white/60">
                          {event.consultant?.full_name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/events/${event.id}`}
                        className="p-2 text-white/20 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all inline-block"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

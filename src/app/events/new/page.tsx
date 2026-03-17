'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Building2, 
  MapPin, 
  Tag, 
  Calendar, 
  Link as LinkIcon, 
  User as UserIcon,
  Save,
  ChevronLeft,
  AlertCircle
} from 'lucide-react'
import { type Consultant, type TriggerType } from '@/types'
import Link from 'next/link'

const TRIGGER_TYPES: TriggerType[] = [
  'PE investment', 'VC investment', 'acquisition', 'disposal', 
  'refancing', 'leadership hire', 'leadership exit', 
  'positive trading update', 'expansion', 'restructuring', 'other significant change'
]

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    company_name: '',
    trigger_type: 'PE investment' as TriggerType,
    summary: '',
    source_url: '',
    announcement_date: new Date().toISOString().split('T')[0],
    sector: '',
    geography: '',
    key_contacts: '',
    advisors: '',
    investor: '',
    likely_hiring_need: '',
    consultant_id: '',
    priority_score: 50
  })

  useEffect(() => {
    async function loadConsultants() {
      const { data } = await supabase.from('consultants').select('*').eq('active', true)
      if (data) setConsultants(data)
    }
    loadConsultants()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('events').insert([
      { ...formData, consultant_id: formData.consultant_id || null }
    ])

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Add Market Event</h1>
          <p className="text-white/50">Capture a new recruitment trigger opportunity.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Core Info */}
          <section className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
            <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">Core Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={e => setFormData({...formData, company_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Trigger Type</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <select
                    value={formData.trigger_type}
                    onChange={e => setFormData({...formData, trigger_type: e.target.value as TriggerType})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  >
                    {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Summary / "Why this matters"</label>
              <textarea
                rows={4}
                value={formData.summary}
                onChange={e => setFormData({...formData, summary: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                placeholder="Explain the recruitment potential of this event..."
              />
            </div>
          </section>

          {/* Contextual Data */}
          <section className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
            <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">Contextual Data</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Sector</label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={e => setFormData({...formData, sector: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  placeholder="e.g. Fintech"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Geography</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={formData.geography}
                    onChange={e => setFormData({...formData, geography: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    placeholder="e.g. Manchester, UK"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Key Contacts</label>
                <input
                  type="text"
                  value={formData.key_contacts}
                  onChange={e => setFormData({...formData, key_contacts: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  placeholder="Names, LinkedIn URLs..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Likely Hiring Need</label>
                <input
                  type="text"
                  value={formData.likely_hiring_need}
                  onChange={e => setFormData({...formData, likely_hiring_need: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  placeholder="e.g. CFO, Finance Director"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Internal Logic */}
          <section className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
            <h2 className="text-sm font-bold text-brand-orange uppercase tracking-widest mb-4">Internal Settings</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Assigned Consultant</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <select
                  value={formData.consultant_id}
                  onChange={e => setFormData({...formData, consultant_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                >
                  <option value="">Unassigned</option>
                  {consultants.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Priority Score</label>
                <span className="text-xs font-bold text-brand-orange">{formData.priority_score}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.priority_score}
                onChange={e => setFormData({...formData, priority_score: parseInt(e.target.value)})}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-orange"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Announcement Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="date"
                  required
                  value={formData.announcement_date}
                  onChange={e => setFormData({...formData, announcement_date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Source URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={e => setFormData({...formData, source_url: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full orange-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Launch Event'}
            {!loading && <Save className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />}
          </button>
        </div>
      </form>
    </div>
  )
}

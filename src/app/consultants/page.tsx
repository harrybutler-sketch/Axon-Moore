'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  MoreHorizontal,
  Search,
  ShieldCheck
} from 'lucide-react'
import { type Consultant } from '@/types'

const MOCK_CONSULTANTS: Consultant[] = [
  { id: '1', full_name: 'Sarah Jenkins', email: 's.jenkins@axonmoore.com', active: true },
  { id: '2', full_name: 'Mark Taylor', email: 'm.taylor@axonmoore.com', active: true },
  { id: '3', full_name: 'David Lloyd', email: 'd.lloyd@axonmoore.com', active: true },
]

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newConsultant, setNewConsultant] = useState({ full_name: '', email: '' })
  const [search, setSearch] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchConsultants()
  }, [])

  async function fetchConsultants() {
    const { data } = await supabase.from('consultants').select('*').order('full_name')
    if (data && data.length > 0) {
      setConsultants(data)
    } else {
      setConsultants(MOCK_CONSULTANTS)
    }
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('consultants').insert([newConsultant]).select()
    if (!error && data) {
      setConsultants([...consultants, data[0]].sort((a, b) => a.full_name.localeCompare(b.full_name)))
      setNewConsultant({ full_name: '', email: '' })
      setShowAdd(false)
    }
  }

  const toggleStatus = async (id: string, active: boolean) => {
    const { error } = await supabase.from('consultants').update({ active: !active }).eq('id', id)
    if (!error) {
      setConsultants(consultants.map(c => c.id === id ? { ...c, active: !active } : c))
    }
  }

  const filteredConsultants = consultants.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Consultants</h1>
          <p className="text-white/50">Manage the Axon Moore team across geographies.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 orange-gradient text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-orange/20 hover:scale-[1.02] transition-all"
        >
          <UserPlus className="w-5 h-5" /> Add Team Member
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-2xl border border-brand-orange/20 bg-brand-orange/[0.02] animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Full Name</label>
              <input
                type="text"
                required
                value={newConsultant.full_name}
                onChange={e => setNewConsultant({...newConsultant, full_name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                placeholder="e.g. Sarah Jenkins"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                required
                value={newConsultant.email}
                onChange={e => setNewConsultant({...newConsultant, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                placeholder="s.jenkins@axonmoore.com"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-white text-brand-deep font-bold py-2 rounded-xl hover:bg-white/90 transition-all">
                Save Consultant
              </button>
              <button 
                type="button" 
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 border border-white/10 text-white/50 hover:text-white rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Filter by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-white/30">Loading team members...</div>
        ) : filteredConsultants.length === 0 ? (
          <div className="col-span-full py-12 text-center text-white/30">No consultants found.</div>
        ) : (
          filteredConsultants.map((c) => (
            <div key={c.id} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <Users className="text-white/40 group-hover:text-brand-orange transition-colors" />
                </div>
                <button 
                  onClick={() => toggleStatus(c.id, c.active)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${
                    c.active ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'
                  }`}
                >
                  {c.active ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-orange transition-colors">{c.full_name}</h3>
              <div className="flex items-center gap-2 text-white/40 text-sm mb-6">
                <Mail className="w-3 h-3" />
                <span>{c.email}</span>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-white/20 uppercase border-t border-white/5 pt-4">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Authorized</span>
                <span>•</span>
                <span>Joined {new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

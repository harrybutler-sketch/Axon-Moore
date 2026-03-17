'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type MarketEvent } from '@/types'
import { AlertCircle, CheckCircle2, UserPlus, ArrowRight, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function ReviewQueuePage() {
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchReviewItems()
  }, [])

  async function fetchReviewItems() {
    // Items that are either low confidence OR unassigned
    const { data, error } = await supabase
      .from('events')
      .select('*, consultant:consultants(*)')
      .or('confidence_score.lt.0.7,consultant_id.is.null')
      .order('created_at', { ascending: false })

    if (data) setEvents(data)
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Review Queue</h1>
        <p className="text-white/50">Market triggers requiring human verification or consultant assignment.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-white/5 text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Queue Clear!</h2>
          <p className="text-white/40 max-w-sm mx-auto">All recent market triggers have been reviewed or assigned.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between group hover:border-brand-orange/30 transition-all">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl ${
                  !event.consultant ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {!event.consultant ? <UserPlus className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white">{event.company_name}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm bg-white/5 text-white/40">
                      {event.trigger_type}
                    </span>
                    {(event.confidence_score !== undefined && event.confidence_score !== null && event.confidence_score < 0.7) && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                         Low Confidence ({Math.round(event.confidence_score * 100)}%)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60 line-clamp-1 max-w-2xl">{event.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Priority</p>
                  <p className="text-lg font-bold text-white">{event.priority_score}</p>
                </div>
                <Link
                  href={`/events/${event.id}`}
                  className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-white transition-colors flex items-center gap-2 group-hover:text-brand-orange"
                >
                  Review Trigger
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

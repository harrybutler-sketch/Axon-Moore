'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon, FileText, Sparkles, ArrowRight, Loader2, Globe, Linkedin, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AIProjectIngest() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'apify'>('url')
  const [content, setContent] = useState('')
  const [apifyInput, setApifyInput] = useState('')
  const [apifyType, setApifyType] = useState<'linkedin' | 'google'>('google')
  const [runId, setRunId] = useState<string | null>(null)
  const [datasetId, setDatasetId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ingestedCount, setIngestedCount] = useState<number | null>(null)

  const handleProcess = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: activeTab,
          content: content 
        })
      })

      if (!response.ok) throw new Error('Failed to process content')
      
      const { id } = await response.json()
      router.push(`/events/${id}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred during AI extraction.')
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerApify = async () => {
    if (!apifyInput.trim()) return
    setLoading(true)
    setError(null)
    setRunId(null)
    setDatasetId(null)
    setIngestedCount(null)

    try {
      const actorId = apifyType === 'google' ? 'apify/google-search-scraper' : 'apify/linkedin-search-scraper'
      const input = apifyType === 'google' 
        ? { queries: apifyInput, maxPagesPerQuery: 1 } 
        : { searchUrl: apifyInput }

      const response = await fetch('/api/ingest/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'trigger',
          actorId,
          input
        })
      })

      if (!response.ok) throw new Error('Failed to trigger Apify scraper')
      
      const { runId, datasetId } = await response.json()
      setRunId(runId)
      setDatasetId(datasetId)
    } catch (err: any) {
      setError(err.message || 'An error occurred while triggering Apify.')
    } finally {
      setLoading(false)
    }
  }

  const handleIngestApify = async () => {
    if (!datasetId) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ingest/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'ingest',
          datasetId
        })
      })

      if (!response.ok) throw new Error('Failed to ingest Apify results')
      
      const { ingestedCount } = await response.json()
      setIngestedCount(ingestedCount)
    } catch (err: any) {
      setError(err.message || 'An error occurred while ingesting Apify results.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-brand-orange" />
          Market Intel Ingest
        </h1>
        <p className="text-white/50">Proactively discover or manually extract recruitment triggers.</p>
      </header>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${
              activeTab === 'url' ? 'bg-white/5 text-brand-orange' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span className="font-semibold">Source URL</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${
              activeTab === 'text' ? 'bg-white/5 text-brand-orange' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="font-semibold">Raw Text</span>
          </button>
          <button
            onClick={() => setActiveTab('apify')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${
              activeTab === 'apify' ? 'bg-white/5 text-brand-orange' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="font-semibold">Apify Scrapers</span>
          </button>
        </div>

        <div className="p-8 space-y-6">
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Article or LinkedIn URL</label>
                <input
                  type="url"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="https://www.ft.com/content/..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-orange/50 transition-colors"
                />
              </div>
              <button
                onClick={handleProcess}
                disabled={loading || !content.trim()}
                className="w-full orange-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center group disabled:opacity-50"
              >
                {loading ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <Sparkles className="mr-2 w-5 h-5" />}
                Extract Market Trigger
              </button>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Paste Article Text</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste news content here..."
                  rows={10}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-orange/50 transition-colors resize-none"
                />
              </div>
              <button
                onClick={handleProcess}
                disabled={loading || !content.trim()}
                className="w-full orange-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center group disabled:opacity-50"
              >
                {loading ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <Sparkles className="mr-2 w-5 h-5" />}
                Extract Market Trigger
              </button>
            </div>
          )}

          {activeTab === 'apify' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setApifyType('google')}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    apifyType === 'google' ? 'bg-white/10 border-brand-orange text-white' : 'bg-white/5 border-white/5 text-white/40 hover:text-white/60'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Google Search
                </button>
                <button
                  onClick={() => setApifyType('linkedin')}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    apifyType === 'linkedin' ? 'bg-white/10 border-brand-orange text-white' : 'bg-white/5 border-white/5 text-white/40 hover:text-white/60'
                  }`}
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  {apifyType === 'google' ? 'Search Query (e.g. new CFO Manchester)' : 'LinkedIn URL or Search Term'}
                </label>
                <input
                  type="text"
                  value={apifyInput}
                  onChange={(e) => setApifyInput(e.target.value)}
                  placeholder={apifyType === 'google' ? 'e.g. recruitment triggers finance UK' : 'e.g. linkedin.com/company/...'}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-orange/50 transition-colors"
                />
              </div>

              {!runId ? (
                <button
                  onClick={handleTriggerApify}
                  disabled={loading || !apifyInput.trim()}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl border border-white/10 transition-all flex items-center justify-center group disabled:opacity-50"
                >
                  {loading ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <Download className="mr-2 w-5 h-5" />}
                  Trigger Scraper Run
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center justify-between">
                    <span>Scraper triggered! Run ID: {runId.substring(0, 8)}...</span>
                    {!ingestedCount && (
                      <button
                        onClick={handleIngestApify}
                        className="text-xs font-bold underline hover:text-green-300"
                      >
                        Ingest Results
                      </button>
                    )}
                  </div>
                  {ingestedCount !== null && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm">
                      Successfully ingested {ingestedCount} events into the dashboard.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 glass-card rounded-2xl border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white">Auto-Extraction</h3>
          <p className="text-sm text-white/40 italic">Identifies companies, funding amounts, and key leadership moves.</p>
        </div>
        <div className="p-6 glass-card rounded-2xl border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white">Smart Classification</h3>
          <p className="text-sm text-white/40 italic">Categorizes events into PE investment, M&A, or Restructuring.</p>
        </div>
        <div className="p-6 glass-card rounded-2xl border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white">Outreach Readiness</h3>
          <p className="text-sm text-white/40 italic">Generates custom outreach drafts based on the HIRING need detected.</p>
        </div>
      </div>
    </div>
  )
}

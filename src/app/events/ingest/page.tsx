'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon, FileText, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AIProjectIngest() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError(null)

    try {
      // In a real app, this would be an API route to handle the OpenAI call securely
      // For this demo, we'll simulate the extraction logic or call a server action
      
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-brand-orange" />
          AI Market Ingest
        </h1>
        <p className="text-white/50">Automatically extract recruitment triggers from URLs or raw article text.</p>
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
        </div>

        <div className="p-8 space-y-6">
          {activeTab === 'url' ? (
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
          ) : (
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
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={loading || !content.trim()}
            className="w-full orange-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center group disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                Extract Market Trigger
                <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
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

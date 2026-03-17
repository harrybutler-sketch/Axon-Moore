'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Building2, Lock, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-deep">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -right-[10%] w-[50%] h-[50%] bg-brand-orange/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[25%] -left-[10%] w-[50%] h-[50%] bg-brand-orange/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-orange rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-brand-orange/20">
            <Building2 className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Axon Moore</h1>
          <p className="text-white/60 text-center text-sm">Market Movers Engine — Internal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 ml-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                placeholder="name@axonmoore.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full orange-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brand-deep px-2 text-white/20">Authorized Preview</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              document.cookie = "axon_demo_session=true; path=/; max-age=3600"
              router.push('/dashboard')
              router.refresh()
            }}
            className="w-full bg-white/5 border border-white/10 text-white/70 font-semibold py-3 rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center"
          >
            Enter Demo Mode
          </button>
        </form>

        <p className="mt-8 text-center text-white/30 text-xs">
          © {new Date().getFullYear()} Axon Moore. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}

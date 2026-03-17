'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  LogOut, 
  TrendingUp,
  Building2,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Review Queue', href: '/dashboard/review', icon: Clock },
    { name: 'AI Ingest', href: '/events/ingest', icon: Sparkles },
    { name: 'Add Event', href: '/events/new', icon: PlusCircle },
    { name: 'Consultants', href: '/consultants', icon: Users },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    document.cookie = "axon_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.refresh()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-brand-deep border-r border-white/5 flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center shadow-lg shadow-brand-orange/20">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Axon Moore</h1>
            <p className="text-[10px] uppercase tracking-widest text-brand-orange font-bold">Market Movers</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-brand-orange/10 text-brand-orange" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-brand-orange" : "text-white/30 group-hover:text-white/60")} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            )
          })}
        </nav>
      </div>

{/* 
      <div className="mt-auto p-6 border-t border-white/5 bg-white/[0.02]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-xl text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <LogOut className="w-5 h-5 text-white/30 group-hover:text-red-400" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
      */}
    </aside>
  )
}

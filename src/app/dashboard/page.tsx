'use client'

export const dynamic = 'force-dynamic'

import EventsTable from '@/components/dashboard/EventsTable'
import { TrendingUp, Users, Newspaper } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { name: 'Total Opportunities', value: '1,284', icon: Newspaper, change: '+12%', color: 'text-blue-400' },
    { name: 'Active Leads', value: '142', icon: TrendingUp, change: '+5%', color: 'text-brand-orange' },
    { name: 'Engaged Consultants', value: '24', icon: Users, change: '0%', color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Market Movers</h1>
        <p className="text-white/50">Tracking high-impact recruitment triggers across sectors.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">{stat.name}</h3>
            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-orange/5 rounded-full blur-2xl group-hover:bg-brand-orange/10 transition-colors" />
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Latest Trigger Events</h2>
          <span className="text-xs text-white/30">Last updated: Just now</span>
        </div>
        <EventsTable />
      </section>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

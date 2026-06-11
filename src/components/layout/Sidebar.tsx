'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, AlertTriangle, Search,
  CheckSquare, TrendingUp, ClipboardList, ShieldAlert,
  Settings, ChevronDown, LogOut, Bell
} from 'lucide-react'
import { cn, getInitials } from '@/utils'
import type { Profile } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  user: Profile | null
}

const navItems = [
  {
    section: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    section: 'Operations',
    items: [
      { href: '/meetings', label: 'Meetings', icon: CalendarDays, badge: null },
      { href: '/issues', label: 'Issues', icon: AlertTriangle, badge: null },
      { href: '/root-cause', label: 'Root Cause', icon: Search },
      { href: '/actions', label: 'Actions', icon: CheckSquare, badge: null },
    ]
  },
  {
    section: 'Intelligence',
    items: [
      { href: '/kpi-impact', label: 'KPI Impact', icon: TrendingUp },
      { href: '/decision-log', label: 'Decision Log', icon: ClipboardList },
      { href: '/risk-register', label: 'Risk Register', icon: ShieldAlert },
    ]
  },
  {
    section: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ]
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="w-[220px] min-w-[220px] h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-scm-blue flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-gray-900 tracking-tight">SCM Insight Hub</span>
        </div>
        <p className="text-[10px] text-gray-400 pl-[36px]">Turn Meetings Into Impact.</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              {section.section}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'sidebar-nav-item',
                    isActive && 'active'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-scm-blue-light flex items-center justify-center text-[11px] font-semibold text-scm-blue flex-shrink-0">
            {getInitials(user?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{user?.full_name ?? 'User'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.department ?? 'SCM Team'}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}

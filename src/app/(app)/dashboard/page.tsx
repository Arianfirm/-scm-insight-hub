// deploy trigger 2026-06-11
import { createClient } from '@/lib/supabase/server'
import { StatCard, SectionCard, Avatar, PriorityBadge, ActionStatusBadge } from '@/components/ui'
import { DashboardCharts } from '@/components/modules/DashboardCharts'
import { formatDate, isOverdue, meetingTypeColor, MEETING_TYPE_LABELS } from '@/utils'
import { Plus, CalendarDays, AlertTriangle, CheckSquare, TrendingUp, Clock, Activity } from 'lucide-react'
import Link from 'next/link'
import type { Action, Meeting } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Parallel data fetching
  const [
    { count: totalMeetings },
    { count: totalIssues },
    { data: actionStats },
    { data: recentMeetings },
    { data: upcomingActions },
    { data: highPriorityActions },
    { data: overdueByPic },
  ] = await Promise.all([
    supabase.from('meetings').select('*', { count: 'exact', head: true }),
    supabase.from('issues').select('*', { count: 'exact', head: true }),
    supabase.from('actions').select('status, due_date, created_at'),
    supabase.from('meetings')
      .select('id, title, meeting_type, meeting_date, participants')
      .order('meeting_date', { ascending: false })
      .limit(5),
    supabase.from('actions')
      .select('id, title, due_date, priority, status, pic_id, profiles!actions_pic_id_fkey(full_name)')
      .in('status', ['open', 'in_progress'])
      .order('due_date', { ascending: true })
      .limit(5),
    supabase.from('actions')
      .select('id, title, priority, status, pic_id, profiles!actions_pic_id_fkey(full_name)')
      .in('priority', ['critical', 'high'])
      .in('status', ['open', 'in_progress'])
      .order('priority', { ascending: true })
      .limit(5),
    supabase.from('actions')
      .select('pic_id, due_date, status, profiles!actions_pic_id_fkey(full_name)')
      .in('status', ['open', 'in_progress'])
      .lt('due_date', new Date().toISOString().split('T')[0]),
  ])

  // Compute stats
  const total = actionStats?.length ?? 0
  const open = actionStats?.filter(a => a.status === 'open').length ?? 0
  const inProgress = actionStats?.filter(a => a.status === 'in_progress').length ?? 0
  const completed = actionStats?.filter(a => a.status === 'completed').length ?? 0
  const overdue = actionStats?.filter(a => isOverdue(a.due_date, a.status)).length ?? 0
  const closureRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // Overdue by PIC
  const picOverdueMap: Record<string, { name: string; count: number }> = {}
  overdueByPic?.forEach((a: any) => {
    const name = a.profiles?.full_name ?? 'Unknown'
    if (!picOverdueMap[name]) picOverdueMap[name] = { name, count: 0 }
    picOverdueMap[name].count++
  })
  const topOverduePics = Object.values(picOverdueMap).sort((a, b) => b.count - a.count).slice(0, 4)

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/meetings">
            <button className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors">
              <CalendarDays className="w-4 h-4" />
              All Meetings
            </button>
          </Link>
          <Link href="/meetings">
            <button className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark transition-colors">
              <Plus className="w-4 h-4" />
              New Meeting
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatCard label="Total Meetings" value={totalMeetings ?? 0} accentColor="#185FA5" delta="This month" deltaType="neutral" />
        <StatCard label="Total Issues" value={totalIssues ?? 0} accentColor="#E24B4A" delta={`${overdue} overdue`} deltaType={overdue > 0 ? 'negative' : 'neutral'} />
        <StatCard label="Total Actions" value={total} accentColor="#639922" delta={`${completed} closed`} deltaType="positive" />
        <StatCard label="Open Actions" value={open} accentColor="#EF9F27" delta={`${inProgress} in progress`} deltaType="neutral" />
        <StatCard label="Overdue" value={overdue} accentColor="#E24B4A" delta={overdue > 0 ? 'Needs attention' : 'All on track'} deltaType={overdue > 0 ? 'negative' : 'positive'} />
        <StatCard label="Closure Rate" value={`${closureRate}%`} accentColor="#1D9E75" delta="Actions completed" deltaType={closureRate >= 70 ? 'positive' : 'neutral'} />
        <StatCard label="Open + In Progress" value={open + inProgress} accentColor="#7F77DD" delta="Active work" deltaType="neutral" />
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Upcoming Deadlines */}
        <SectionCard
          title="Upcoming deadlines"
          subtitle="Actions due in next 14 days"
          action={<Link href="/actions" className="text-xs text-scm-blue hover:underline">View all</Link>}
        >
          {upcomingActions && upcomingActions.length > 0 ? (
            <div className="space-y-0 divide-y divide-gray-50">
              {upcomingActions.map((action: any) => (
                <div key={action.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-[44px] text-center bg-gray-50 rounded-lg py-1.5 px-1">
                    <p className="text-base font-semibold text-gray-800 leading-none">
                      {action.due_date ? new Date(action.due_date).getDate() : '—'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {action.due_date ? new Date(action.due_date).toLocaleString('en', { month: 'short' }).toUpperCase() : ''}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{action.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(action as any).profiles?.full_name ?? 'Unassigned'}</p>
                  </div>
                  <PriorityBadge priority={action.priority} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No upcoming deadlines</p>
          )}
        </SectionCard>

        {/* Recent Meetings */}
        <SectionCard
          title="Recent meetings"
          subtitle="Latest 5 meetings recorded"
          action={<Link href="/meetings" className="text-xs text-scm-blue hover:underline">View all</Link>}
        >
          {recentMeetings && recentMeetings.length > 0 ? (
            <div className="space-y-0 divide-y divide-gray-50">
              {recentMeetings.map((meeting: any) => (
                <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                  <div className="flex items-center gap-3 py-2.5 hover:bg-gray-50/50 -mx-2 px-2 rounded cursor-pointer">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: meetingTypeColor(meeting.meeting_type) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{meeting.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(meeting.meeting_date)} · {MEETING_TYPE_LABELS[meeting.meeting_type as keyof typeof MEETING_TYPE_LABELS] ?? meeting.meeting_type}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{meeting.participants?.length ?? 0} participants</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No meetings yet</p>
          )}
        </SectionCard>

        {/* High Priority Actions */}
        <SectionCard
          title="High priority actions"
          subtitle="Critical and high priority — open or in progress"
          action={<Link href="/actions" className="text-xs text-scm-blue hover:underline">View all</Link>}
        >
          {highPriorityActions && highPriorityActions.length > 0 ? (
            <div className="space-y-0 divide-y divide-gray-50">
              {highPriorityActions.map((action: any) => (
                <div key={action.id} className="flex items-center gap-3 py-2.5">
                  <PriorityBadge priority={action.priority} />
                  <p className="text-sm text-gray-800 flex-1 truncate">{action.title}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{action.profiles?.full_name ?? '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No high priority actions</p>
          )}
        </SectionCard>

        {/* Top Overdue PICs */}
        <SectionCard
          title="Top overdue PICs"
          subtitle="Team members with most overdue actions"
          action={<Link href="/actions" className="text-xs text-scm-blue hover:underline">View all</Link>}
        >
          {topOverduePics.length > 0 ? (
            <div className="space-y-0 divide-y divide-gray-50">
              {topOverduePics.map((pic) => (
                <div key={pic.name} className="flex items-center gap-3 py-2.5">
                  <Avatar name={pic.name} size="md" />
                  <p className="text-sm text-gray-800 flex-1">{pic.name}</p>
                  <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    {pic.count} overdue
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-green-600 font-medium">🎉 No overdue actions!</p>
              <p className="text-xs text-gray-400 mt-1">All team members are on track</p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

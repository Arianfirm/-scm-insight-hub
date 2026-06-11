import { createClient } from '@/lib/supabase/server'
import { PageHeader, PriorityBadge, ActionStatusBadge, Avatar } from '@/components/ui'
import { ActionTracker } from '@/components/modules/ActionTracker'
import { isOverdue, formatDate } from '@/utils'

export default async function ActionsPage() {
  const supabase = await createClient()

  const { data: actions } = await supabase
    .from('actions')
    .select(`
      *,
      profiles!actions_pic_id_fkey(id, full_name),
      issues!actions_issue_id_fkey(id, title, category)
    `)
    .order('due_date', { ascending: true, nullsFirst: false })

  const { data: profiles } = await supabase.from('profiles').select('id, full_name').order('full_name')
  const { data: issues } = await supabase.from('issues').select('id, title').order('title')
  const { data: meetings } = await supabase.from('meetings').select('id, title').order('meeting_date', { ascending: false }).limit(20)

  const enriched = (actions ?? []).map(a => ({
    ...a,
    is_overdue: isOverdue(a.due_date, a.status),
  }))

  const stats = {
    total: enriched.length,
    open: enriched.filter(a => a.status === 'open').length,
    in_progress: enriched.filter(a => a.status === 'in_progress').length,
    completed: enriched.filter(a => a.status === 'completed').length,
    overdue: enriched.filter(a => a.is_overdue).length,
  }

  return (
    <div>
      <PageHeader
        title="Action Tracker"
        subtitle={`${stats.total} total · ${stats.overdue} overdue`}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total', value: stats.total, color: '#185FA5' },
          { label: 'Open', value: stats.open, color: '#B5D4F4' },
          { label: 'In Progress', value: stats.in_progress, color: '#EF9F27' },
          { label: 'Completed', value: stats.completed, color: '#1D9E75' },
          { label: 'Overdue', value: stats.overdue, color: '#E24B4A' },
        ].map(s => (
          <div key={s.label} className="scm-card p-4 relative overflow-hidden">
            <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r" style={{ backgroundColor: s.color }} />
            <p className="text-xs text-gray-400 pl-1">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-900 pl-1" style={{ color: s.label === 'Overdue' && s.value > 0 ? '#A32D2D' : undefined }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <ActionTracker
        actions={enriched}
        profiles={profiles ?? []}
        issues={issues ?? []}
        meetings={meetings ?? []}
      />
    </div>
  )
}

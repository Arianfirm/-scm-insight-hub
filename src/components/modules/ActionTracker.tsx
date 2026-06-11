'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, LayoutList, Columns, X, AlertCircle } from 'lucide-react'
import { PriorityBadge, ActionStatusBadge, Avatar } from '@/components/ui'
import { cn, formatDate } from '@/utils'
import type { Priority, ActionStatus } from '@/types'

interface Action {
  id: string
  title: string
  description: string | null
  status: ActionStatus
  priority: Priority
  due_date: string | null
  is_overdue: boolean
  profiles: { full_name: string | null } | null
  issues: { title: string; category: string } | null
}

interface Props {
  actions: Action[]
  profiles: { id: string; full_name: string | null }[]
  issues: { id: string; title: string }[]
  meetings: { id: string; title: string }[]
}

const STATUS_COLUMNS: { status: ActionStatus; label: string; color: string; bg: string }[] = [
  { status: 'open', label: 'Open', color: '#185FA5', bg: '#E6F1FB' },
  { status: 'in_progress', label: 'In Progress', color: '#854F0B', bg: '#FAEEDA' },
  { status: 'completed', label: 'Completed', color: '#3B6D11', bg: '#EAF3DE' },
  { status: 'cancelled', label: 'Cancelled', color: '#5F5E5A', bg: '#F1EFE8' },
]

export function ActionTracker({ actions, profiles, issues, meetings }: Props) {
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    issue_id: '',
    meeting_id: '',
    pic_id: '',
    due_date: '',
    priority: 'medium' as Priority,
    status: 'open' as ActionStatus,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('actions').insert({
        title: form.title,
        description: form.description || null,
        issue_id: form.issue_id || null,
        meeting_id: form.meeting_id || null,
        pic_id: form.pic_id || null,
        due_date: form.due_date || null,
        priority: form.priority,
        status: form.status,
      })
      if (error) throw error
      toast.success('Action created')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue'

  return (
    <>
      <div className="scm-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('table')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors', view === 'table' ? 'bg-scm-blue text-white' : 'text-gray-500 hover:bg-gray-50')}
            >
              <LayoutList className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setView('kanban')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors', view === 'kanban' ? 'bg-scm-blue text-white' : 'text-gray-500 hover:bg-gray-50')}
            >
              <Columns className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark"
          >
            <Plus className="w-3.5 h-3.5" /> New Action
          </button>
        </div>

        {/* Table View */}
        {view === 'table' && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Task</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Related Issue</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">PIC</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Due Date</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Priority</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {actions.map(action => (
                <tr key={action.id} className={cn('transition-colors', action.is_overdue ? 'overdue-row' : 'hover:bg-gray-50/50')}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-800">{action.title}</p>
                    {action.is_overdue && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-red-500">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 max-w-[150px]">
                    {action.issues ? (
                      <span className="line-clamp-1 text-gray-600">{action.issues.title}</span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={action.profiles?.full_name} size="sm" />
                      <span className="text-xs text-gray-600">{action.profiles?.full_name ?? 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className={cn('px-3 py-3 text-sm', action.is_overdue ? 'text-red-600 font-medium' : 'text-gray-500')}>
                    {action.due_date ? formatDate(action.due_date) : '—'}
                  </td>
                  <td className="px-3 py-3"><PriorityBadge priority={action.priority} /></td>
                  <td className="px-3 py-3"><ActionStatusBadge status={action.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-4 gap-3 p-5">
            {STATUS_COLUMNS.map(col => {
              const colActions = actions.filter(a => a.status === col.status)
              return (
                <div key={col.status} className="bg-gray-50/70 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{col.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: col.bg, color: col.color }}>
                      {colActions.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {colActions.map(action => (
                      <div key={action.id}
                        className={cn('bg-white border rounded-lg p-3 shadow-sm', action.is_overdue ? 'border-l-2 border-l-red-400 border-t-gray-100 border-r-gray-100 border-b-gray-100' : 'border-gray-100')}>
                        <p className="text-xs font-medium text-gray-800 leading-snug mb-2">{action.title}</p>
                        <div className="flex items-center justify-between">
                          <PriorityBadge priority={action.priority} />
                          <span className="text-[10px] text-gray-400">{action.profiles?.full_name ?? '—'}</span>
                        </div>
                        {action.due_date && (
                          <p className={cn('text-[10px] mt-1.5', action.is_overdue ? 'text-red-500' : 'text-gray-400')}>
                            {action.is_overdue ? '⚠ ' : ''}Due {formatDate(action.due_date)}
                          </p>
                        )}
                      </div>
                    ))}
                    {colActions.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-6">No actions</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Action Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-gray-900">Create action</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Task title *</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={field} placeholder="e.g. Review intercompany SOP" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue resize-none" placeholder="What needs to be done?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Related issue</label>
                  <select value={form.issue_id} onChange={e => setForm(f => ({ ...f, issue_id: e.target.value }))} className={field}>
                    <option value="">— None —</option>
                    {issues.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Meeting</label>
                  <select value={form.meeting_id} onChange={e => setForm(f => ({ ...f, meeting_id: e.target.value }))} className={field}>
                    <option value="">— None —</option>
                    {meetings.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">PIC</label>
                  <select value={form.pic_id} onChange={e => setForm(f => ({ ...f, pic_id: e.target.value }))} className={field}>
                    <option value="">— Unassigned —</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Due date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className={field} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} className={field}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ActionStatus }))} className={field}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="h-9 px-5 text-sm rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark disabled:opacity-60 font-medium">
                  {loading ? 'Saving...' : 'Create action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

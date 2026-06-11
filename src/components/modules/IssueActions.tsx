'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import type { IssueCategory, ImpactLevel, Priority, IssueStatus } from '@/types'
import { CATEGORY_LABELS } from '@/utils'

export function IssueActions() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [meetings, setMeetings] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    meeting_id: '',
    title: '',
    category: 'warehouse' as IssueCategory,
    description: '',
    impact_level: 'medium' as ImpactLevel,
    priority: 'medium' as Priority,
    status: 'open' as IssueStatus,
    owner_id: '',
  })

  useEffect(() => {
    if (!open) return
    Promise.all([
      supabase.from('meetings').select('id, title').order('meeting_date', { ascending: false }).limit(20),
      supabase.from('profiles').select('id, full_name').order('full_name'),
    ]).then(([{ data: m }, { data: p }]) => {
      setMeetings(m ?? [])
      setProfiles(p ?? [])
    })
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('issues').insert({
        meeting_id: form.meeting_id || null,
        title: form.title,
        category: form.category,
        description: form.description || null,
        impact_level: form.impact_level,
        priority: form.priority,
        status: form.status,
        owner_id: form.owner_id || null,
      })
      if (error) throw error
      toast.success('Issue created')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create issue')
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Issue
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-gray-900">Log new issue</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Issue title *</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={field} placeholder="e.g. OTIF below target — June" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as IssueCategory }))} className={field}>
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Related meeting</label>
                  <select value={form.meeting_id} onChange={e => setForm(f => ({ ...f, meeting_id: e.target.value }))} className={field}>
                    <option value="">— None —</option>
                    {meetings.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue resize-none" placeholder="Describe the issue, impact, and context..." />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Impact</label>
                  <select value={form.impact_level} onChange={e => setForm(f => ({ ...f, impact_level: e.target.value as ImpactLevel }))} className={field}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
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
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as IssueStatus }))} className={field}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Owner</label>
                <select value={form.owner_id} onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))} className={field}>
                  <option value="">— Unassigned —</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="h-9 px-5 text-sm rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark disabled:opacity-60 font-medium">
                  {loading ? 'Saving...' : 'Log issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

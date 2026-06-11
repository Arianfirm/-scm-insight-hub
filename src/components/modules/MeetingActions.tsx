'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import type { MeetingType } from '@/types'
import { MEETING_TYPE_LABELS } from '@/utils'

export function MeetingActions() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '',
    meeting_date: new Date().toISOString().split('T')[0],
    meeting_type: 'weekly_review' as MeetingType,
    participants: '',
    summary: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const participants = form.participants
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)

      const { data, error } = await supabase.from('meetings').insert({
        title: form.title,
        meeting_date: form.meeting_date,
        meeting_type: form.meeting_type,
        participants,
        summary: form.summary || null,
        created_by: user?.id,
      }).select().single()

      if (error) throw error
      toast.success('Meeting created')
      setOpen(false)
      setForm({ title: '', meeting_date: new Date().toISOString().split('T')[0], meeting_type: 'weekly_review', participants: '', summary: '' })
      router.refresh()
      if (data) router.push(`/meetings/${data.id}`)
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create meeting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Meeting
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Record new meeting</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Meeting title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue"
                  placeholder="e.g. Weekly SCM Review"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.meeting_date}
                    onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Type *</label>
                  <select
                    value={form.meeting_type}
                    onChange={e => setForm(f => ({ ...f, meeting_type: e.target.value as MeetingType }))}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue"
                  >
                    {Object.entries(MEETING_TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Participants <span className="text-gray-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={form.participants}
                  onChange={e => setForm(f => ({ ...f, participants: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue"
                  placeholder="Rina Sari, Budi Arifin, Hendra W"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Summary</label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue resize-none"
                  placeholder="Brief summary of what was discussed..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-4 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-5 text-sm rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark disabled:opacity-60 font-medium"
                >
                  {loading ? 'Creating...' : 'Create meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

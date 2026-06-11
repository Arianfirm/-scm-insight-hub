'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X, ClipboardList } from 'lucide-react'
import { formatDate, meetingTypeColor, MEETING_TYPE_LABELS } from '@/utils'

interface Decision {
  id: string
  description: string
  decided_at: string
  created_at: string
  meetings: { id: string; title: string; meeting_date: string; meeting_type: string } | null
  profiles: { full_name: string } | null
}

interface Props {
  decisions: Decision[]
  meetings: { id: string; title: string }[]
  profiles: { id: string; full_name: string | null }[]
}

export function DecisionLogClient({ decisions, meetings, profiles }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    meeting_id: '',
    description: '',
    owner_id: '',
    decided_at: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('decisions').insert({
        meeting_id: form.meeting_id,
        description: form.description,
        owner_id: form.owner_id || null,
        decided_at: form.decided_at,
      })
      if (error) throw error
      toast.success('Decision logged')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = decisions.filter(d =>
    d.description.toLowerCase().includes(search.toLowerCase()) ||
    d.meetings?.title.toLowerCase().includes(search.toLowerCase())
  )

  // Group by month
  const grouped: Record<string, Decision[]> = {}
  filtered.forEach(d => {
    const month = d.decided_at.substring(0, 7)
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(d)
  })

  const field = 'w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue'

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search decisions..."
          className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue w-72"
        />
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark"
        >
          <Plus className="w-4 h-4" /> Log Decision
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="scm-card p-16 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No decisions found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, monthDecisions]) => {
              const [year, mo] = month.split('-')
              const monthLabel = new Date(+year, +mo - 1).toLocaleString('en', { month: 'long', year: 'numeric' })
              return (
                <div key={month}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{monthLabel}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">{monthDecisions.length} decisions</span>
                  </div>
                  <div className="space-y-2">
                    {monthDecisions.map((d, i) => {
                      const mtColor = d.meetings ? meetingTypeColor(d.meetings.meeting_type as any) : '#888'
                      return (
                        <div key={d.id} className="scm-card p-4 flex gap-4">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                            style={{ background: mtColor }}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-relaxed">{d.description}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                              <span>{formatDate(d.decided_at)}</span>
                              {d.meetings && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: mtColor }} />
                                  {d.meetings.title}
                                </span>
                              )}
                              {d.profiles?.full_name && (
                                <span>Owner: {d.profiles.full_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Log decision</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Meeting *</label>
                <select required value={form.meeting_id} onChange={e => setForm(f => ({ ...f, meeting_id: e.target.value }))} className={field}>
                  <option value="">— Select meeting —</option>
                  {meetings.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Decision *</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue resize-none" placeholder="What was decided? Be specific and actionable..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Date decided</label>
                  <input type="date" value={form.decided_at} onChange={e => setForm(f => ({ ...f, decided_at: e.target.value }))} className={field} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Owner</label>
                  <select value={form.owner_id} onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))} className={field}>
                    <option value="">— Unassigned —</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="h-9 px-5 text-sm rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark disabled:opacity-60 font-medium">
                  {loading ? 'Saving...' : 'Log decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { CATEGORY_LABELS, cn } from '@/utils'
import type { RcaMethodology } from '@/types'

interface RootCause {
  id: string
  issue_id: string
  methodology: RcaMethodology
  why_1: string | null
  why_2: string | null
  why_3: string | null
  why_4: string | null
  why_5: string | null
  root_cause_statement: string | null
  fishbone_man: string | null
  fishbone_method: string | null
  fishbone_machine: string | null
  fishbone_material: string | null
  fishbone_environment: string | null
  fishbone_measurement: string | null
  validated_by: string | null
  created_at: string
  issues: { id: string; title: string; category: string; status: string } | null
}

interface Props {
  rootCauses: RootCause[]
  issues: { id: string; title: string; category: string; status: string }[]
}

const FISHBONE_CATEGORIES = [
  { key: 'fishbone_man', label: 'Man (People)', icon: '👤' },
  { key: 'fishbone_method', label: 'Method (Process)', icon: '📋' },
  { key: 'fishbone_machine', label: 'Machine (Technology)', icon: '⚙️' },
  { key: 'fishbone_material', label: 'Material', icon: '📦' },
  { key: 'fishbone_environment', label: 'Environment', icon: '🌐' },
  { key: 'fishbone_measurement', label: 'Measurement', icon: '📊' },
]

export function RootCauseClient({ rootCauses, issues }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [methodology, setMethodology] = useState<RcaMethodology>('5_why')
  const [form, setForm] = useState({
    issue_id: '',
    validated_by: '',
    root_cause_statement: '',
    // 5 Why
    why_1: '', why_2: '', why_3: '', why_4: '', why_5: '',
    // Fishbone
    fishbone_man: '', fishbone_method: '', fishbone_machine: '',
    fishbone_material: '', fishbone_environment: '', fishbone_measurement: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: any = {
        issue_id: form.issue_id,
        methodology,
        validated_by: form.validated_by || null,
        root_cause_statement: form.root_cause_statement || null,
      }
      if (methodology === '5_why') {
        Object.assign(payload, {
          why_1: form.why_1 || null, why_2: form.why_2 || null,
          why_3: form.why_3 || null, why_4: form.why_4 || null,
          why_5: form.why_5 || null,
        })
      } else {
        FISHBONE_CATEGORIES.forEach(c => {
          payload[c.key] = (form as any)[c.key] || null
        })
      }

      const { error } = await supabase.from('root_causes').insert(payload)
      if (error) throw error
      toast.success('Root cause analysis saved')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue'
  const textarea = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue resize-none'

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark"
        >
          <Plus className="w-4 h-4" /> New RCA
        </button>
      </div>

      {rootCauses.length === 0 ? (
        <div className="scm-card p-16 text-center">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No root cause analyses yet</p>
          <p className="text-xs text-gray-400 mt-1">Use 5-Why or Fishbone to dig into issues.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rootCauses.map(rca => {
            const isExpanded = expandedId === rca.id
            return (
              <div key={rca.id} className="scm-card overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : rca.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        rca.methodology === '5_why' ? 'bg-scm-blue-light text-scm-blue' : 'bg-purple-50 text-purple-700'
                      )}>
                        {rca.methodology === '5_why' ? '5 Why' : 'Fishbone'}
                      </span>
                      {rca.issues && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {CATEGORY_LABELS[rca.issues.category as keyof typeof CATEGORY_LABELS] ?? rca.issues.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {rca.issues?.title ?? 'Unknown issue'}
                    </p>
                    {rca.root_cause_statement && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        Root cause: {rca.root_cause_statement}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {rca.validated_by && <span>Validated by {rca.validated_by}</span>}
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/30">
                    {/* 5 Why */}
                    {rca.methodology === '5_why' && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">5 Why Chain</p>
                        {[
                          { label: 'Why 1 — Problem statement', value: rca.why_1 },
                          { label: 'Why 2', value: rca.why_2 },
                          { label: 'Why 3', value: rca.why_3 },
                          { label: 'Why 4', value: rca.why_4 },
                          { label: 'Why 5 — Root cause', value: rca.why_5 },
                        ].map((w, i) => w.value && (
                          <div key={i} className="flex gap-3 items-start">
                            <div className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                              i === 4 ? 'bg-scm-blue text-white' : 'bg-white border border-gray-200 text-gray-500'
                            )}>
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-400">{w.label}</p>
                              <p className="text-sm text-gray-800 mt-0.5">{w.value}</p>
                            </div>
                          </div>
                        ))}
                        {rca.root_cause_statement && (
                          <div className="mt-4 p-3 bg-scm-blue-light rounded-lg border border-scm-blue/20">
                            <p className="text-xs font-semibold text-scm-blue mb-1">Root Cause Statement</p>
                            <p className="text-sm text-gray-800">{rca.root_cause_statement}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fishbone */}
                    {rca.methodology === 'fishbone' && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Fishbone Diagram</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {FISHBONE_CATEGORIES.map(cat => {
                            const val = (rca as any)[cat.key]
                            if (!val) return null
                            return (
                              <div key={cat.key} className="bg-white border border-gray-100 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                  {cat.icon} {cat.label}
                                </p>
                                <p className="text-sm text-gray-800">{val}</p>
                              </div>
                            )
                          })}
                        </div>
                        {rca.root_cause_statement && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200/50">
                            <p className="text-xs font-semibold text-purple-700 mb-1">Root Cause Statement</p>
                            <p className="text-sm text-gray-800">{rca.root_cause_statement}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold text-gray-900">New Root Cause Analysis</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
              {/* Issue + Methodology */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Issue *</label>
                  <select required value={form.issue_id} onChange={e => setForm(f => ({ ...f, issue_id: e.target.value }))} className={field}>
                    <option value="">— Select issue —</option>
                    {issues.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Methodology *</label>
                  <div className="flex gap-2">
                    {(['5_why', 'fishbone'] as RcaMethodology[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethodology(m)}
                        className={cn(
                          'flex-1 h-9 text-sm font-medium border rounded-lg transition-colors',
                          methodology === m
                            ? 'bg-scm-blue text-white border-scm-blue'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {m === '5_why' ? '5 Why' : 'Fishbone'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5-Why fields */}
              {methodology === '5_why' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">5 Why Chain</p>
                  {[
                    { key: 'why_1', label: 'Why 1 — What is the problem?', placeholder: 'State the problem as observed...' },
                    { key: 'why_2', label: 'Why 2 — Why did that happen?', placeholder: 'What caused Why 1?' },
                    { key: 'why_3', label: 'Why 3', placeholder: 'What caused Why 2?' },
                    { key: 'why_4', label: 'Why 4', placeholder: 'What caused Why 3?' },
                    { key: 'why_5', label: 'Why 5 — Root cause', placeholder: 'What is the fundamental cause?' },
                  ].map(w => (
                    <div key={w.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{w.label}</label>
                      <textarea rows={2} value={(form as any)[w.key]} onChange={e => setForm(f => ({ ...f, [w.key]: e.target.value }))} className={textarea} placeholder={w.placeholder} />
                    </div>
                  ))}
                </div>
              )}

              {/* Fishbone fields */}
              {methodology === 'fishbone' && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Fishbone Categories</p>
                  <div className="grid grid-cols-2 gap-3">
                    {FISHBONE_CATEGORIES.map(cat => (
                      <div key={cat.key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{cat.icon} {cat.label}</label>
                        <textarea rows={2} value={(form as any)[cat.key]} onChange={e => setForm(f => ({ ...f, [cat.key]: e.target.value }))} className={textarea} placeholder={`Contributing factors from ${cat.label.split(' ')[0].toLowerCase()}...`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Root Cause Statement */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Root Cause Statement</label>
                <textarea rows={3} value={form.root_cause_statement} onChange={e => setForm(f => ({ ...f, root_cause_statement: e.target.value }))} className={textarea} placeholder="Summarize the identified root cause in 1-2 clear sentences..." />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Validated by</label>
                <input type="text" value={form.validated_by} onChange={e => setForm(f => ({ ...f, validated_by: e.target.value }))} className={field} placeholder="e.g. Anton Kurniawan" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="h-9 px-5 text-sm rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark disabled:opacity-60 font-medium">
                  {loading ? 'Saving...' : 'Save RCA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

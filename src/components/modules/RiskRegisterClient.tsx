'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X, ShieldAlert } from 'lucide-react'
import { riskHeatmapColor, riskLevel } from '@/utils'
import { cn } from '@/utils'

interface Risk {
  id: string
  title: string
  description: string | null
  impact: number
  probability: number
  risk_score: number
  risk_level: string
  mitigation_plan: string | null
  status: string
  profiles: { full_name: string | null } | null
}

const IMPACT_LABELS = ['', 'Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic']
const PROB_LABELS = ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain']

export function RiskRegisterClient({
  risks, profiles, meetings
}: { risks: Risk[]; profiles: any[]; meetings: any[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    impact: 3,
    probability: 3,
    mitigation_plan: '',
    owner_id: '',
    meeting_id: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('risks').insert({
        title: form.title,
        description: form.description || null,
        impact: form.impact,
        probability: form.probability,
        mitigation_plan: form.mitigation_plan || null,
        owner_id: form.owner_id || null,
        meeting_id: form.meeting_id || null,
      })
      if (error) throw error
      toast.success('Risk added to register')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Build heatmap grid
  const heatmapRisks: Record<string, Risk[]> = {}
  risks.forEach(r => {
    const key = `${r.impact}-${r.probability}`
    if (!heatmapRisks[key]) heatmapRisks[key] = []
    heatmapRisks[key].push(r)
  })

  const field = 'w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue'

  const levelColors: Record<string, string> = {
    low: 'bg-green-50 text-green-700',
    medium: 'bg-amber-50 text-amber-700',
    high: 'bg-orange-50 text-orange-700',
    critical: 'bg-red-50 text-red-700',
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark">
          <Plus className="w-4 h-4" /> Add Risk
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Heatmap */}
        <div className="scm-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Risk heatmap</h3>
          <p className="text-xs text-gray-400 mb-5">Impact vs probability matrix</p>

          <div className="overflow-auto">
            <table className="w-full border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-xs text-gray-400 font-medium text-right pr-2 pb-1 w-20">Impact ↓ / Prob →</th>
                  {[1, 2, 3, 4, 5].map(p => (
                    <th key={p} className="text-xs text-gray-400 font-medium text-center pb-1">
                      <span title={PROB_LABELS[p]}>{p}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map(impact => (
                  <tr key={impact}>
                    <td className="text-xs text-gray-400 text-right pr-2 py-0.5">
                      <span title={IMPACT_LABELS[impact]}>{impact}</span>
                    </td>
                    {[1, 2, 3, 4, 5].map(prob => {
                      const cellRisks = heatmapRisks[`${impact}-${prob}`] ?? []
                      const color = riskHeatmapColor(impact, prob)
                      return (
                        <td key={prob} className="text-center">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold mx-auto"
                            style={{ background: color }}
                            title={cellRisks.map(r => r.title).join(', ')}
                          >
                            {cellRisks.length > 0 && (
                              <span className="text-gray-700">{cellRisks.length > 1 ? cellRisks.length : '●'}</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
            {[
              { label: 'Low', color: '#C0DD97' },
              { label: 'Medium', color: '#FAC775' },
              { label: 'High', color: '#F09595' },
              { label: 'Critical', color: '#E24B4A' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Risk List */}
        <div className="scm-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Active risks ({risks.length})</h3>
          {risks.length > 0 ? (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {risks.map(risk => {
                const color = riskHeatmapColor(risk.impact, risk.probability)
                return (
                  <div key={risk.id} className="flex gap-3 p-3 border border-gray-100 rounded-lg">
                    <div className="w-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800">{risk.title}</p>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', levelColors[risk.risk_level] ?? '')}>
                          {risk.risk_level?.toUpperCase()}
                        </span>
                      </div>
                      {risk.description && <p className="text-xs text-gray-500 mt-1">{risk.description}</p>}
                      {risk.mitigation_plan && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          <span className="font-medium">Mitigation:</span> {risk.mitigation_plan}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>Impact {risk.impact}/5</span>
                        <span>Probability {risk.probability}/5</span>
                        <span>Score: {risk.risk_score}</span>
                        {risk.profiles?.full_name && <span>· {risk.profiles.full_name}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No risks registered</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-gray-900">Register risk</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Risk title *</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={field} placeholder="e.g. Supplier concentration risk" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Impact (1-5)</label>
                  <input type="range" min="1" max="5" value={form.impact} onChange={e => setForm(f => ({ ...f, impact: +e.target.value }))} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Negligible</span>
                    <span className="font-medium text-gray-700">{form.impact}</span>
                    <span>Catastrophic</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Probability (1-5)</label>
                  <input type="range" min="1" max="5" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: +e.target.value }))} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Rare</span>
                    <span className="font-medium text-gray-700">{form.probability}</span>
                    <span>Certain</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: riskHeatmapColor(form.impact, form.probability) + '33' }}>
                <p className="text-xs font-medium text-gray-700">
                  Risk Level: <span className="font-bold uppercase">{riskLevel(form.impact, form.probability)}</span>
                  {' '}· Score: {form.impact * form.probability}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Mitigation plan</label>
                <textarea rows={2} value={form.mitigation_plan} onChange={e => setForm(f => ({ ...f, mitigation_plan: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none resize-none" placeholder="How will this risk be mitigated?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Owner</label>
                  <select value={form.owner_id} onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))} className={field}>
                    <option value="">— Unassigned —</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
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
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="h-9 px-5 text-sm rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark disabled:opacity-60 font-medium">
                  {loading ? 'Saving...' : 'Add risk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

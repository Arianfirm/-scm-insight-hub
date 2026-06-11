'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface KpiRecord {
  id: string
  metric_name: string
  metric_unit: string | null
  value_before: number | null
  value_after: number | null
  improvement_pct: number | null
  notes: string | null
  issues: { title: string; category: string } | null
  actions: { title: string } | null
}

interface Props {
  kpis: KpiRecord[]
  issues: { id: string; title: string }[]
  actions: { id: string; title: string }[]
}

export function KpiImpactClient({ kpis, issues, actions }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    issue_id: '',
    action_id: '',
    metric_name: '',
    metric_unit: '%',
    value_before: '',
    value_after: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('kpi_records').insert({
        issue_id: form.issue_id || null,
        action_id: form.action_id || null,
        metric_name: form.metric_name,
        metric_unit: form.metric_unit || null,
        value_before: Number(form.value_before),
        value_after: Number(form.value_after),
        notes: form.notes || null,
        measured_at: new Date().toISOString().split('T')[0],
      })
      if (error) throw error
      toast.success('KPI record added')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const chartData = kpis
    .filter(k => k.value_before !== null && k.value_after !== null)
    .slice(0, 8)
    .map(k => ({
      name: k.metric_name,
      Before: k.value_before,
      After: k.value_after,
      unit: k.metric_unit ?? '',
    }))

  const field = 'w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue'

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark"
        >
          <Plus className="w-4 h-4" /> Log KPI
        </button>
      </div>

      {/* KPI Cards */}
      {kpis.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {kpis.map(kpi => {
              const improvement = kpi.improvement_pct ?? 0
              const isPositive = improvement > 0
              const absImp = Math.abs(improvement)
              return (
                <div key={kpi.id} className="scm-card p-5">
                  <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">{kpi.metric_name}</p>
                  {kpi.issues && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-1">{kpi.issues.title}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Before</p>
                      <p className="text-xl font-semibold text-gray-500">
                        {kpi.value_before}{kpi.metric_unit}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <div className="text-center">
                      <p className="text-xs text-gray-400">After</p>
                      <p className="text-xl font-semibold text-green-600">
                        {kpi.value_after}{kpi.metric_unit}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-semibold ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isPositive ? '+' : ''}{improvement.toFixed(1)}% improvement
                  </div>
                  {kpi.notes && <p className="text-xs text-gray-400 mt-2 text-center">{kpi.notes}</p>}
                </div>
              )
            })}
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="scm-card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">KPI improvement overview</h3>
              <p className="text-xs text-gray-400 mb-4">Before vs after intervention across key metrics</p>
              <div className="flex gap-4 mb-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" />Before
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-scm-green inline-block" />After
                </span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="Before" fill="#B5D4F4" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="After" fill="#1D9E75" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <div className="scm-card p-16 text-center">
          <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No KPI records yet</p>
          <p className="text-xs text-gray-400 mt-1">Log before/after measurements to track business impact.</p>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-gray-900">Log KPI impact</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Metric name *</label>
                <input type="text" required value={form.metric_name} onChange={e => setForm(f => ({ ...f, metric_name: e.target.value }))} className={field} placeholder="e.g. OTIF, Fill Rate, Lead Time" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Unit</label>
                  <input type="text" value={form.metric_unit} onChange={e => setForm(f => ({ ...f, metric_unit: e.target.value }))} className={field} placeholder="% / days / orders" />
                </div>
                <div />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Value before *</label>
                  <input type="number" step="0.1" required value={form.value_before} onChange={e => setForm(f => ({ ...f, value_before: e.target.value }))} className={field} placeholder="82" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Value after *</label>
                  <input type="number" step="0.1" required value={form.value_after} onChange={e => setForm(f => ({ ...f, value_after: e.target.value }))} className={field} placeholder="95" />
                </div>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Related action</label>
                  <select value={form.action_id} onChange={e => setForm(f => ({ ...f, action_id: e.target.value }))} className={field}>
                    <option value="">— None —</option>
                    {actions.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none resize-none" placeholder="Context or measurement conditions..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="h-9 px-5 text-sm rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark disabled:opacity-60 font-medium">
                  {loading ? 'Saving...' : 'Save KPI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

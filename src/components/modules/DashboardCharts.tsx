'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CATEGORY_COLORS: Record<string, string> = {
  warehouse: '#185FA5',
  fulfillment: '#1D9E75',
  intercompany: '#7F77DD',
  inventory: '#EF9F27',
  transportation: '#D4537E',
  marketplace: '#E24B4A',
  planning: '#0F6E56',
  procurement: '#854F0B',
}
const STATUS_COLORS = ['#185FA5', '#EF9F27', '#B5D4F4', '#E24B4A']

export function DashboardCharts() {
  const supabase = createClient()
  const [trendData, setTrendData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [closureData, setClosureData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: actions }, { data: issues }] = await Promise.all([
        supabase.from('actions').select('status, due_date, created_at, updated_at'),
        supabase.from('issues').select('category, status'),
      ])

      // Action trend by month (last 6 months)
      const now = new Date()
      const trend = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const completed = actions?.filter(a => a.status === 'completed' && a.updated_at?.startsWith(monthStr)).length ?? 0
        const opened = actions?.filter(a => a.created_at?.startsWith(monthStr)).length ?? 0
        const total = actions?.filter(a => a.created_at <= `${monthStr}-31`).length ?? 1
        trend.push({
          month: MONTHS[d.getMonth()],
          completed,
          opened,
          closure_rate: Math.round((completed / Math.max(total, 1)) * 100),
        })
      }
      setTrendData(trend)
      setClosureData(trend)

      // Status distribution
      const statusMap: Record<string, number> = { completed: 0, in_progress: 0, open: 0, cancelled: 0 }
      actions?.forEach(a => { statusMap[a.status] = (statusMap[a.status] ?? 0) + 1 })
      setStatusData([
        { name: 'Completed', value: statusMap.completed, color: '#185FA5' },
        { name: 'In Progress', value: statusMap.in_progress, color: '#EF9F27' },
        { name: 'Open', value: statusMap.open, color: '#B5D4F4' },
        { name: 'Cancelled', value: statusMap.cancelled, color: '#D1D5DB' },
      ])

      // Issues by category
      const catMap: Record<string, number> = {}
      issues?.forEach(i => { catMap[i.category] = (catMap[i.category] ?? 0) + 1 })
      setCategoryData(
        Object.entries(catMap)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            count,
            color: CATEGORY_COLORS[category] ?? '#888',
          }))
      )

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="scm-card p-5 h-[280px] animate-pulse bg-gray-50" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Action Completion Trend */}
      <div className="scm-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Action completion trend</h3>
        <p className="text-xs text-gray-400 mb-4">Monthly closed vs opened — last 6 months</p>
        <div className="flex gap-4 mb-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-scm-blue inline-block" />Completed
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" />Opened
          </span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <Line type="monotone" dataKey="completed" stroke="#185FA5" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
            <Line type="monotone" dataKey="opened" stroke="#B5D4F4" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3 }} name="Opened" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Open vs Closed */}
      <div className="scm-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Action status distribution</h3>
        <p className="text-xs text-gray-400 mb-4">Current breakdown by status</p>
        <div className="flex flex-wrap gap-3 mb-2">
          {statusData.map(s => (
            <span key={s.name} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: s.color }} />
              {s.name} ({s.value})
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
              {statusData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Issues by Category */}
      <div className="scm-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Issues by category</h3>
        <p className="text-xs text-gray-400 mb-4">Total issues per supply chain function</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={90} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <Bar dataKey="count" radius={[0, 3, 3, 0]} name="Issues">
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Closure Rate Trend */}
      <div className="scm-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Closure rate trend</h3>
        <p className="text-xs text-gray-400 mb-4">% of actions completed each month</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={closureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v: any) => [`${v}%`, 'Closure Rate']}
            />
            <Line type="monotone" dataKey="closure_rate" stroke="#1D9E75" strokeWidth={2.5} dot={{ r: 3, fill: '#1D9E75' }} name="Closure Rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

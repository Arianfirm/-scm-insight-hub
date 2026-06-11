'use client'

import { useState } from 'react'
import { TabBar, PriorityBadge, IssueStatusBadge, ActionStatusBadge, EmptyState, Avatar } from '@/components/ui'
import { formatDate, isOverdue, CATEGORY_LABELS, riskLevel, riskHeatmapColor } from '@/utils'
import { cn } from '@/utils'
import type { Issue, Action, Decision, Risk } from '@/types'
import { ClipboardList, AlertTriangle, CheckSquare, ShieldAlert } from 'lucide-react'

interface Props {
  meeting: any
  issues: any[]
  actions: any[]
  decisions: any[]
  risks: any[]
}

export function MeetingDetailTabs({ meeting, issues, actions, decisions, risks }: Props) {
  const [activeTab, setActiveTab] = useState('issues')

  const tabs = [
    { label: 'Issues', value: 'issues', count: issues.length },
    { label: 'Actions', value: 'actions', count: actions.length },
    { label: 'Decisions', value: 'decisions', count: decisions.length },
    { label: 'Risks', value: 'risks', count: risks.length },
  ]

  return (
    <div className="scm-card p-5">
      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div>
          {issues.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Issue</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Category</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Priority</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Status</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {issues.map((issue: any) => (
                  <tr key={issue.id} className="hover:bg-gray-50/50">
                    <td className="py-3 pr-4">
                      <p className="text-sm text-gray-800">{issue.title}</p>
                      {issue.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{issue.description}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[issue.category as keyof typeof CATEGORY_LABELS] ?? issue.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4"><PriorityBadge priority={issue.priority} /></td>
                    <td className="py-3 pr-4"><IssueStatusBadge status={issue.status} /></td>
                    <td className="py-3 text-sm text-gray-500">{issue.profiles?.full_name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState icon={AlertTriangle} title="No issues recorded" description="Issues from this meeting will appear here." />
          )}
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div>
          {actions.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Action</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">PIC</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Due Date</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Priority</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {actions.map((action: any) => {
                  const overdue = isOverdue(action.due_date, action.status)
                  return (
                    <tr key={action.id} className={cn('hover:bg-gray-50/50', overdue && 'bg-red-50/30')}>
                      <td className="py-3 pr-4">
                        <p className="text-sm text-gray-800">{action.title}</p>
                        {overdue && <p className="text-xs text-red-500 mt-0.5">⚠ Overdue</p>}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-500">{action.profiles?.full_name ?? '—'}</td>
                      <td className="py-3 pr-4 text-sm text-gray-500">
                        {action.due_date ? formatDate(action.due_date) : '—'}
                      </td>
                      <td className="py-3 pr-4"><PriorityBadge priority={action.priority} /></td>
                      <td className="py-3"><ActionStatusBadge status={action.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <EmptyState icon={CheckSquare} title="No actions recorded" description="Actions assigned during this meeting will appear here." />
          )}
        </div>
      )}

      {/* Decisions Tab */}
      {activeTab === 'decisions' && (
        <div>
          {decisions.length > 0 ? (
            <div className="space-y-3">
              {decisions.map((d: any, i: number) => (
                <div key={d.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-scm-blue flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 leading-relaxed">{d.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{formatDate(d.decided_at)}</span>
                      {d.profiles?.full_name && <span>Owner: {d.profiles.full_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={ClipboardList} title="No decisions recorded" description="Decisions made during this meeting will appear here." />
          )}
        </div>
      )}

      {/* Risks Tab */}
      {activeTab === 'risks' && (
        <div>
          {risks.length > 0 ? (
            <div className="space-y-3">
              {risks.map((risk: any) => {
                const level = riskLevel(risk.impact, risk.probability)
                const color = riskHeatmapColor(risk.impact, risk.probability)
                return (
                  <div key={risk.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                    <div className="w-3 rounded-sm flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-800">{risk.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-3"
                          style={{ background: color + '33', color: '#444' }}>
                          {level.toUpperCase()}
                        </span>
                      </div>
                      {risk.description && <p className="text-xs text-gray-500 mt-1">{risk.description}</p>}
                      {risk.mitigation_plan && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          <span className="font-medium">Mitigation:</span> {risk.mitigation_plan}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>Impact: {risk.impact}/5</span>
                        <span>Probability: {risk.probability}/5</span>
                        <span>Score: {risk.risk_score}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={ShieldAlert} title="No risks recorded" description="Risks identified during this meeting will appear here." />
          )}
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { PageHeader, PriorityBadge, IssueStatusBadge } from '@/components/ui'
import { IssueActions } from '@/components/modules/IssueActions'
import { formatDate, CATEGORY_LABELS } from '@/utils'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; priority?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('issues')
    .select(`
      *,
      profiles!issues_owner_id_fkey(full_name),
      meetings!issues_meeting_id_fkey(title, meeting_date)
    `)
    .order('created_at', { ascending: false })

  if (params.category) query = query.eq('category', params.category)
  if (params.status) query = query.eq('status', params.status)
  if (params.priority) query = query.eq('priority', params.priority)

  const { data: issues } = await query

  // Count by status
  const { data: allIssues } = await supabase.from('issues').select('status')
  const counts = {
    all: allIssues?.length ?? 0,
    open: allIssues?.filter(i => i.status === 'open').length ?? 0,
    in_progress: allIssues?.filter(i => i.status === 'in_progress').length ?? 0,
    resolved: allIssues?.filter(i => i.status === 'resolved').length ?? 0,
  }

  return (
    <div>
      <PageHeader
        title="Issue Tracker"
        subtitle={`${counts.all} total issues across all categories`}
        actions={<IssueActions />}
      />

      <div className="scm-card overflow-hidden">
        {/* Status tabs */}
        <div className="flex items-center gap-0 border-b border-gray-100 px-5">
          {[
            { label: 'All', value: '', count: counts.all },
            { label: 'Open', value: 'open', count: counts.open },
            { label: 'In Progress', value: 'in_progress', count: counts.in_progress },
            { label: 'Resolved', value: 'resolved', count: counts.resolved },
          ].map(tab => (
            <Link key={tab.value} href={tab.value ? `/issues?status=${tab.value}` : '/issues'}>
              <button className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                (searchParams.status ?? '') === tab.value
                  ? 'border-scm-blue text-scm-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
                {tab.label}
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{tab.count}</span>
              </button>
            </Link>
          ))}
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Issue</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Impact</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Priority</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Owner</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Meeting</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {issues && issues.length > 0 ? issues.map((issue: any) => (
              <tr key={issue.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-800">{issue.title}</p>
                  {issue.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{issue.description}</p>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[issue.category as keyof typeof CATEGORY_LABELS] ?? issue.category}
                  </span>
                </td>
                <td className="px-3 py-3"><PriorityBadge priority={issue.impact_level} /></td>
                <td className="px-3 py-3"><PriorityBadge priority={issue.priority} /></td>
                <td className="px-3 py-3"><IssueStatusBadge status={issue.status} /></td>
                <td className="px-3 py-3 text-sm text-gray-500">{(issue as any).profiles?.full_name ?? '—'}</td>
                <td className="px-3 py-3 text-xs text-gray-400">
                  {(issue as any).meetings?.title
                    ? <span className="line-clamp-1 max-w-[120px] block">{(issue as any).meetings.title}</span>
                    : '—'}
                </td>
                <td className="px-3 py-3 text-xs text-gray-400">{formatDate(issue.created_at)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No issues found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { formatDate, meetingTypeColor, MEETING_TYPE_LABELS } from '@/utils'
import { PageHeader } from '@/components/ui'
import { MeetingActions } from '@/components/modules/MeetingActions'
import { CalendarDays, Users, AlertTriangle, CheckSquare } from 'lucide-react'
import Link from 'next/link'

export default async function MeetingsPage() {
  const supabase = await createClient()

  const { data: meetings } = await supabase
    .from('meetings')
    .select(`
      id, title, meeting_date, meeting_type, participants, summary, created_at,
      issues(count),
      actions(count)
    `)
    .order('meeting_date', { ascending: false })

  return (
    <div>
      <PageHeader
        title="Meetings"
        subtitle={`${meetings?.length ?? 0} meetings recorded`}
        actions={<MeetingActions />}
      />

      {meetings && meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {meetings.map((meeting: any) => {
            const color = meetingTypeColor(meeting.meeting_type)
            const typeLabel = MEETING_TYPE_LABELS[meeting.meeting_type as keyof typeof MEETING_TYPE_LABELS] ?? meeting.meeting_type
            const issueCount = meeting.issues?.[0]?.count ?? 0
            const actionCount = meeting.actions?.[0]?.count ?? 0

            return (
              <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                <div className="scm-card p-5 hover:shadow-md transition-shadow cursor-pointer group"
                  style={{ borderTop: `3px solid ${color}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-scm-blue transition-colors truncate">
                        {meeting.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(meeting.meeting_date)} · {typeLabel}
                      </p>
                    </div>
                  </div>

                  {meeting.summary && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                      {meeting.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-50">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {meeting.participants?.length ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {issueCount} issues
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" />
                      {actionCount} actions
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="scm-card p-16 text-center">
          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No meetings yet</p>
          <p className="text-xs text-gray-400 mt-1">Record your first meeting to start tracking issues and actions.</p>
        </div>
      )}
    </div>
  )
}

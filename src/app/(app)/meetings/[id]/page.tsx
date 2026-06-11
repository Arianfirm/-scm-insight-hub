import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, meetingTypeColor, MEETING_TYPE_LABELS } from '@/utils'
import { PriorityBadge, IssueStatusBadge, ActionStatusBadge } from '@/components/ui'
import { MeetingDetailTabs } from '@/components/modules/MeetingDetailTabs'
import { ArrowLeft, Users, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'

export default async function MeetingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [
    { data: meeting },
    { data: issues },
    { data: actions },
    { data: decisions },
    { data: risks },
  ] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', params.id).single(),
    supabase.from('issues').select('*, profiles!issues_owner_id_fkey(full_name)').eq('meeting_id', params.id),
    supabase.from('actions').select('*, profiles!actions_pic_id_fkey(full_name)').eq('meeting_id', params.id),
    supabase.from('decisions').select('*, profiles!decisions_owner_id_fkey(full_name)').eq('meeting_id', params.id),
    supabase.from('risks').select('*, profiles!risks_owner_id_fkey(full_name)').eq('meeting_id', params.id),
  ])

  if (!meeting) notFound()

  const color = meetingTypeColor(meeting.meeting_type)
  const typeLabel = MEETING_TYPE_LABELS[meeting.meeting_type as keyof typeof MEETING_TYPE_LABELS] ?? meeting.meeting_type

  return (
    <div>
      {/* Back */}
      <Link href="/meetings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to meetings
      </Link>

      {/* Meeting Header */}
      <div className="scm-card p-6 mb-6" style={{ borderTop: `4px solid ${color}` }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
                {typeLabel}
              </span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-3">{meeting.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(meeting.meeting_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {meeting.participants?.length ?? 0} participants
              </span>
            </div>

            {meeting.participants && meeting.participants.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {meeting.participants.map((p: string) => (
                  <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-center flex-shrink-0">
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-lg font-semibold text-gray-900">{issues?.length ?? 0}</p>
              <p className="text-xs text-gray-400">Issues</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-lg font-semibold text-gray-900">{actions?.length ?? 0}</p>
              <p className="text-xs text-gray-400">Actions</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-lg font-semibold text-gray-900">{decisions?.length ?? 0}</p>
              <p className="text-xs text-gray-400">Decisions</p>
            </div>
          </div>
        </div>

        {meeting.summary && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Meeting Summary</p>
            <p className="text-sm text-gray-700 leading-relaxed">{meeting.summary}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <MeetingDetailTabs
        meeting={meeting}
        issues={issues ?? []}
        actions={actions ?? []}
        decisions={decisions ?? []}
        risks={risks ?? []}
      />
    </div>
  )
}

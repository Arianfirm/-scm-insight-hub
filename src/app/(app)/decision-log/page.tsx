import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { DecisionLogClient } from '@/components/modules/DecisionLogClient'

export default async function DecisionLogPage() {
  const supabase = await createClient()

  const [{ data: decisions }, { data: meetings }, { data: profiles }] = await Promise.all([
    supabase
      .from('decisions')
      .select('*, meetings!decisions_meeting_id_fkey(id, title, meeting_date, meeting_type), profiles!decisions_owner_id_fkey(full_name)')
      .order('decided_at', { ascending: false }),
    supabase.from('meetings').select('id, title').order('meeting_date', { ascending: false }).limit(20),
    supabase.from('profiles').select('id, full_name').order('full_name'),
  ])

  return (
    <div>
      <PageHeader
        title="Decision Log"
        subtitle={`${decisions?.length ?? 0} decisions recorded across all meetings`}
      />
      <DecisionLogClient decisions={decisions ?? []} meetings={meetings ?? []} profiles={profiles ?? []} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { RiskRegisterClient } from '@/components/modules/RiskRegisterClient'

export default async function RiskRegisterPage() {
  const supabase = await createClient()

  const [{ data: risks }, { data: profiles }, { data: meetings }] = await Promise.all([
    supabase.from('risks').select('*, profiles!risks_owner_id_fkey(full_name)').order('risk_score', { ascending: false }),
    supabase.from('profiles').select('id, full_name').order('full_name'),
    supabase.from('meetings').select('id, title').order('meeting_date', { ascending: false }).limit(20),
  ])

  return (
    <div>
      <PageHeader
        title="Risk Register"
        subtitle="Supply chain risk identification and mitigation tracking"
      />
      <RiskRegisterClient risks={risks ?? []} profiles={profiles ?? []} meetings={meetings ?? []} />
    </div>
  )
}

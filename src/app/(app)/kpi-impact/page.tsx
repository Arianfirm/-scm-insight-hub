import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { KpiImpactClient } from '@/components/modules/KpiImpactClient'

export default async function KpiImpactPage() {
  const supabase = await createClient()

  const [{ data: kpis }, { data: issues }, { data: actions }] = await Promise.all([
    supabase.from('kpi_records').select('*, issues!kpi_records_issue_id_fkey(title, category), actions!kpi_records_action_id_fkey(title)').order('created_at', { ascending: false }),
    supabase.from('issues').select('id, title').order('title'),
    supabase.from('actions').select('id, title').order('title'),
  ])

  return (
    <div>
      <PageHeader
        title="KPI Impact"
        subtitle="Measurable business improvement from actions taken"
      />
      <KpiImpactClient kpis={kpis ?? []} issues={issues ?? []} actions={actions ?? []} />
    </div>
  )
}

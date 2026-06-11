import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { RootCauseClient } from '@/components/modules/RootCauseClient'

export default async function RootCausePage() {
  const supabase = await createClient()

  const [{ data: rootCauses }, { data: issues }] = await Promise.all([
    supabase
      .from('root_causes')
      .select('*, issues!root_causes_issue_id_fkey(id, title, category, status)')
      .order('created_at', { ascending: false }),
    supabase
      .from('issues')
      .select('id, title, category, status')
      .order('title'),
  ])

  return (
    <div>
      <PageHeader
        title="Root Cause Analysis"
        subtitle={`${rootCauses?.length ?? 0} analyses — 5 Why & Fishbone`}
      />
      <RootCauseClient rootCauses={rootCauses ?? []} issues={issues ?? []} />
    </div>
  )
}

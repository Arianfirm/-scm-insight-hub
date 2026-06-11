import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { SettingsClient } from '@/components/modules/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: profile }, { data: allProfiles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('profiles').select('*').order('full_name'),
  ])

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile and team" />
      <SettingsClient profile={profile} allProfiles={allProfiles ?? []} />
    </div>
  )
}

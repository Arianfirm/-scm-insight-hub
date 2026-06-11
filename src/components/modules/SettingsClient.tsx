'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui'
import { Save, Users } from 'lucide-react'
import type { Profile } from '@/types'

interface Props {
  profile: Profile | null
  allProfiles: Profile[]
}

export function SettingsClient({ profile, allProfiles }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    role: profile?.role ?? '',
    department: profile?.department ?? '',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: form.full_name,
        role: form.role,
        department: form.department,
        updated_at: new Date().toISOString(),
      }).eq('id', profile!.id)
      if (error) throw error
      toast.success('Profile updated')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Profile */}
      <div className="scm-card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-5">Your profile</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-5">
            <Avatar name={form.full_name} size="lg" />
            <div>
              <p className="text-sm font-medium text-gray-800">{profile?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Account email — cannot be changed</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Full name</label>
            <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className={field} placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Role / title</label>
            <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={field} placeholder="e.g. SCM Manager" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Department</label>
            <input type="text" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className={field} placeholder="e.g. Supply Chain" />
          </div>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark disabled:opacity-60">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Team */}
      <div className="scm-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Team members</h3>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{allProfiles.length}</span>
        </div>
        <div className="space-y-3">
          {allProfiles.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <Avatar name={p.full_name} size="md" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{p.full_name ?? 'Unnamed'}</p>
                <p className="text-xs text-gray-400">{p.department ?? ''}{p.department && p.role ? ' · ' : ''}{p.role ?? ''}</p>
              </div>
              {p.id === profile?.id && (
                <span className="text-xs bg-scm-blue-light text-scm-blue px-2 py-0.5 rounded-full font-medium">You</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Team members are added automatically when they sign up with their work email.</p>
        </div>
      </div>
    </div>
  )
}

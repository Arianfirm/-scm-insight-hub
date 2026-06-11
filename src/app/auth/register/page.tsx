'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName } },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Account created! Check your email to confirm.')
      router.push('/auth/login')
    }
  }

  const inputCls = 'w-full h-10 px-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scm-blue/20 focus:border-scm-blue'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-scm-blue flex items-center justify-center mx-auto mb-4 shadow-md">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">SCM Insight Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Join your supply chain team.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Create account</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full name</label>
              <input type="text" required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className={inputCls} placeholder="Rina Sari" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Work email</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputCls + ' pr-10'} placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full h-10 text-sm font-medium rounded-lg bg-scm-blue text-white hover:bg-scm-blue-dark disabled:opacity-60">
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-scm-blue hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Sparkles, Loader2, Mail, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()
  const { isAdmin, loading: authLoading } = useAuth()

  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!authLoading && isAdmin) router.replace('/')
  }, [authLoading, isAdmin, router])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/auth/callback' },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Sparkles size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              FlavorForge
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Admin access required</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl shadow-zinc-900/5">
          {sent ? (
            <div className="flex flex-col items-center gap-3 text-center py-4">
              <CheckCircle2 size={40} className="text-emerald-500" />
              <p className="font-semibold text-zinc-900 dark:text-white">Check your email!</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <button onClick={() => setSent(false)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-2">
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="af3446@barnard.edu"
                  className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-zinc-400"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-lg shadow-brand-600/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {loading ? 'Sending…' : 'Send magic link'}
              </button>

              <p className="text-xs text-center text-zinc-400 dark:text-zinc-500">
                We&apos;ll email you a link to sign in instantly. No password needed.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { ThemeToggle } from './ThemeToggle'
import { Sparkles, LogOut } from 'lucide-react'

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-lg">
          <Sparkles size={18} className="text-brand-500" />
          <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
            FlavorForge
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && isAdmin && (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
                {profile?.first_name
                  ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
                  : (profile?.email ?? user.email)}
                <span className="px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-200 text-[10px]">
                  {profile?.is_superadmin ? 'superadmin' : 'matrix admin'}
                </span>
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { ThemeToggle } from './ThemeToggle'
import { LogOut, Sparkles } from 'lucide-react'

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  return (
    <nav className="sticky top-0 z-40 border-b border-[#f2a7b8]/30 dark:border-[#3d2f38] bg-[#fdf6f0]/80 dark:bg-[#1a1015]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles size={18} className="text-[#f2a7b8] group-hover:text-[#c2185b] transition-colors" />
          <span className="text-xl font-display italic text-[#1a1015] dark:text-[#f7e7ce] group-hover:text-[#c2185b] dark:group-hover:text-[#f2a7b8] transition-colors tracking-wide">
            FlavorForge
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && isAdmin && (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[#f2a7b8]/40 dark:border-[#3d2f38] bg-[#fce4ec]/50 dark:bg-[#2d1f28]/50 text-[#c2185b] dark:text-[#f2a7b8] font-body">
                {profile?.first_name ?? profile?.email ?? user.email}
                <span className="px-1.5 py-0.5 rounded-full bg-[#f2a7b8]/30 text-[#c2185b] dark:text-[#f2a7b8] text-[10px] font-medium">
                  {profile?.is_superadmin ? 'superadmin' : 'admin'}
                </span>
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#c8a97e] dark:text-[#6a4a5a] hover:text-[#c2185b] dark:hover:text-[#f2a7b8] hover:bg-[#fce4ec]/50 dark:hover:bg-[#2d1f28] transition-colors"
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
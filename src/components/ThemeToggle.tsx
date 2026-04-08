'use client'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

const opts = [
  { v: 'light'  as const, icon: <Sun     size={12} />, label: 'Light'  },
  { v: 'dark'   as const, icon: <Moon    size={12} />, label: 'Dark'   },
  { v: 'system' as const, icon: <Monitor size={12} />, label: 'System' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex items-center gap-0.5 bg-[#f7e7ce]/60 dark:bg-[#2d1f28]/60 rounded-full border border-[#f2a7b8]/40 dark:border-[#3d2f38] p-1">
      {opts.map(o => (
        <button
          key={o.v}
          onClick={() => setTheme(o.v)}
          title={o.label}
          className={[
            'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body transition-all',
            theme === o.v
              ? 'bg-white dark:bg-[#3d2f38] text-[#c2185b] dark:text-[#f2a7b8] shadow-sm'
              : 'text-[#c8a97e] dark:text-[#6a4a5a] hover:text-[#c2185b] dark:hover:text-[#f2a7b8]',
          ].join(' ')}
        >
          {o.icon}
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  )
}
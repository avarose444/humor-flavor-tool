'use client'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

const opts = [
  { v: 'light'  as const, icon: <Sun     size={13} />, label: 'Light'  },
  { v: 'dark'   as const, icon: <Moon    size={13} />, label: 'Dark'   },
  { v: 'system' as const, icon: <Monitor size={13} />, label: 'System' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
      {opts.map(o => (
        <button
          key={o.v}
          onClick={() => setTheme(o.v)}
          title={o.label}
          className={[
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
            theme === o.v
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
          ].join(' ')}
        >
          {o.icon}
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

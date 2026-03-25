'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'
interface ThemeCtx { theme: Theme; setTheme: (t: Theme) => void; resolved: 'dark' | 'light' }

const Ctx = createContext<ThemeCtx>({ theme: 'system', setTheme: () => {}, resolved: 'dark' })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme,    setThemeState] = useState<Theme>('system')
  const [resolved, setResolved]   = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme) ?? 'system'
    setThemeState(stored)
  }, [])

  useEffect(() => {
    const apply = (t: Theme) => {
      const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', dark)
      setResolved(dark ? 'dark' : 'light')
    }
    apply(theme)
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', () => apply('system'))
      return () => mq.removeEventListener('change', () => apply('system'))
    }
  }, [theme])

  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem('theme', t) }

  return <Ctx.Provider value={{ theme, setTheme, resolved }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)

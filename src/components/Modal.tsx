'use client'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white dark:bg-[#2d1f28] rounded-2xl shadow-2xl border border-[#f2a7b8]/30 dark:border-[#3d2f38] animate-slide-up overflow-hidden`}>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#f2a7b8] via-[#c9a84c] to-[#f2a7b8]" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f2a7b8]/20 dark:border-[#3d2f38]">
          <h2 className="text-lg font-display italic text-[#1a1015] dark:text-[#f7e7ce] tracking-wide">
            {title}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#fce4ec] dark:hover:bg-[#3d2f38] text-[#c8a97e] dark:text-[#6a4a5a] hover:text-[#c2185b] dark:hover:text-[#f2a7b8] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
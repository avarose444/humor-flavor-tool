'use client'
import { Modal } from './Modal'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#fce4ec] dark:bg-[#3d2f38] flex items-center justify-center">
            <AlertTriangle size={18} className="text-[#c2185b]" />
          </div>
          <p className="text-sm text-[#3d2f38] dark:text-[#c8a97e] pt-2 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-full border border-[#f2a7b8]/40 dark:border-[#3d2f38] hover:bg-[#fce4ec] dark:hover:bg-[#3d2f38] text-[#c8a97e] dark:text-[#6a4a5a] hover:text-[#c2185b] dark:hover:text-[#f2a7b8] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm rounded-full bg-[#c2185b] hover:bg-[#ad1457] disabled:opacity-60 text-white font-medium transition-colors">
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
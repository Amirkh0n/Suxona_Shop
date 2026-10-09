/**
 * Toast component
 *
 * Displays a toast notification.
 */

import { X } from 'lucide-react'

export interface ToastProps {
  toast: {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }
  onClose: () => void
}

const toastConfig = {
  success: {
    icon: '✓',
    color: 'bg-green-500',
    textColor: 'text-white',
  },
  error: {
    icon: '✕',
    color: 'bg-red-500',
    textColor: 'text-white',
  },
  warning: {
    icon: '⚠',
    color: 'bg-yellow-500',
    textColor: 'text-white',
  },
  info: {
    icon: 'ℹ',
    color: 'bg-blue-500',
    textColor: 'text-white',
  },
}

export function Toast({ toast, onClose }: ToastProps) {
  const config = toastConfig[toast.type] || toastConfig.info

  return (
    <div className={`fixed top-4 right-4 z-50 ${config.color} ${config.textColor} shadow-lg rounded-lg px-6 py-4 flex items-center gap-3 animate-in slide-in-from-right duration-300`}>
      <span className="text-2xl font-bold">{config.icon}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export default Toast

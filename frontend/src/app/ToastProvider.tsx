/**
 * ToastProvider component
 *
 * Manages toast notifications across the application.
 */

import { useAppStore } from '@/stores/appStore'
import { Toast } from '@/components/Toast'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toast, toasts, removeToast } = useAppStore.getState()

  // Render toast notifications
  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      )}
      {toasts.map((toast) => (
        <div key={toast.id} className="fixed top-4 right-4 z-50">
          <Toast toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
      {children}
    </>
  )
}

export default ToastProvider

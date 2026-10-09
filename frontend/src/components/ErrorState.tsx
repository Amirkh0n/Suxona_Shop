/**
 * Error State component
 *
 * Displays error states with friendly messages and retry options.
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ErrorStateProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'as'> {
  /** Error title */
  title?: string
  /** Error description */
  description?: string
  /** Icon to display */
  icon?: ReactNode
  /** Whether to show a retry button */
  showRetry?: boolean
  /** Retry button text */
  retryText?: string
  /** Callback when retry is clicked */
  onRetry?: () => void
  /** Whether to show the original error message */
  showOriginalError?: boolean
  /** Custom error message to display */
  customError?: string
  /** Additional CSS classes */
  className?: string
}

export function ErrorState({
  title = 'Xatolik yuz berdi',
  description = 'Iltimos, keyinroq qayta urinib ko‘ring yoki yordam qidiring.',
  icon = <AlertCircle className="h-8 w-8" />,
  showRetry = true,
  retryText = 'Qayta urinib ko‘rish',
  onRetry,
  showOriginalError = false,
  customError,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="mb-4 rounded-full bg-danger bg-opacity-10 p-4">
        {icon}
      </div>

      {title && <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>}

      {description && <p className="text-sm text-text-muted max-w-sm mb-4">{description}</p>}

      {showRetry && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          {...props}
        >
          {retryText}
        </button>
      )}

      {showOriginalError && customError && (
        <p className="text-sm text-danger mt-4 max-w-sm">{customError}</p>
      )}
    </div>
  )
}

/**
 * NetworkError component
 */
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Internet tarmog‘i bilan bog‘lanish yo‘q"
      description="Internetni tekshirib, qayta urinib ko‘ring."
      icon={<AlertCircle className="h-8 w-8 text-danger" />}
      retryText="Qayta urinib ko‘rish"
      onRetry={onRetry}
    />
  )
}

/**
 * APIError component
 */
export function APIError({ error, onRetry }: { error?: Error; onRetry: () => void }) {
  const message = error?.message || 'Noma\'lum xatolik'
  return (
    <ErrorState
      title="API xatoligi"
      description="Serverdan so‘ralgan ma’lumotni olishda xatolik yuz berdi."
      icon={<AlertCircle className="h-8 w-8 text-danger" />}
      customError={message}
      showOriginalError={true}
      retryText="Qayta urinib ko‘rish"
      onRetry={onRetry}
    />
  )
}

/**
 * ValidationError component
 */
export function ValidationError({ errors, onRetry }: { errors?: Error; onRetry?: () => void }) {
  const errorMessage = errors?.message || 'Tasdiqlash ma’lumotlari noto‘g‘ri'
  return (
    <ErrorState
      title="Tasdiqlash xatoligi"
      description="Tasdiqlash ma’lumotlari noto‘g‘ri yoki to‘liq emas."
      icon={<AlertCircle className="h-8 w-8 text-danger" />}
      customError={errorMessage}
      showOriginalError={true}
      retryText="Qayta urinib ko‘rish"
      onRetry={onRetry}
    />
  )
}

/**
 * NotFoundError component
 */
export function NotFoundError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Topilmadi"
      description="So‘ralgan ma’lumot yoki sahifa topilmadi."
      icon={<AlertCircle className="h-8 w-8 text-warning" />}
      retryText="Orqaga qaytish"
      onRetry={onRetry}
    />
  )
}

/**
 * UnauthorizedError component
 */
export function UnauthorizedError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Ruxsat berilmadi"
      description="Sizga bu sahifani ko‘rish uchun ruxsat yo‘q."
      icon={<AlertCircle className="h-8 w-8 text-danger" />}
      retryText="Bosh sahifaga qaytish"
      onRetry={onRetry}
    />
  )
}

/**
 * ForbiddenError component
 */
export function ForbiddenError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Ruxsat berilmagan"
      description="Bu amalni bajarish uchun ruxsat yo‘q."
      icon={<AlertCircle className="h-8 w-8 text-danger" />}
      retryText="Orqaga qaytish"
      onRetry={onRetry}
    />
  )
}

/**
 * TimeoutError component
 */
export function TimeoutError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="Vaqt tugadi"
      description="So‘ralgan ma’lumotlarni olish vaqtida vaqt tugadi. Iltimos, internetni tekshirib, qayta urinib ko‘ring."
      icon={<AlertCircle className="h-8 w-8 text-warning" />}
      retryText="Qayta urinib ko‘rish"
      onRetry={onRetry}
    />
  )
}

export default ErrorState

/**
 * Input component
 *
 * A versatile input component with validation and accessibility support.
 */

import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outlined'
  fullWidth?: boolean
  prefix?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = 'default',
      fullWidth = true,
      prefix,
      suffix,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputStyles = cn(
      'block w-full px-4 py-3',
      'rounded-lg border',
      'text-sm font-medium',
      'text-text',
      'bg-surface',
      'border-border',
      'placeholder:text-text-muted',
      'focus:outline-none focus:ring-2',
      'focus:ring-primary focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors'
    )

    return (
      <div className={cn(fullWidth && 'w-full', className)}>
        {label && (
          <label className="block text-sm font-medium text-text mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              inputStyles,
              variant === 'filled' && 'bg-surface border-transparent',
              variant === 'outlined' && 'border-2',
              error && 'border-danger focus:ring-danger focus:border-danger',
              !error && variant === 'outlined' && 'focus:ring-primary focus:border-primary'
            )}
            disabled={disabled}
            {...props}
          />

          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {suffix}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-danger">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

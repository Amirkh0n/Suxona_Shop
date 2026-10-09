/**
 * FilterChip — reusable filter chip component.
 *
 * Used on: Product List, Search pages.
 *
 * Requirements:
 * - Display filter label
 * - Show active state
 * - Optional remove button (X icon)
 * - Keyboard accessible
 * - 44x44 touch target
 */
import { X } from 'lucide-react'

export interface FilterChipProps {
  label: string
  active?: boolean
  onRemove?: () => void
  onClick?: () => void
  onCategoryChange?: (categoryId: number) => void
}

export function FilterChip({
  label,
  active = false,
  onRemove,
  onClick,
  onCategoryChange,
}: FilterChipProps) {
  const handleClick = (_e: React.MouseEvent) => {
    if (!onRemove) {
      if (onCategoryChange) {
        onCategoryChange(0)
      } else {
        onClick?.()
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-white text-text hover:border-primary hover:text-primary'
      }`}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          aria-label={`Remove ${label} filter`}
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </button>
  )
}

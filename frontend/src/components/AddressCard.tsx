/**
 * AddressCard — Reusable address display/selection card
 *
 * Displays:
 * - Full name
 * - Phone number
 * - Address details (village, street, house)
 * - Optional selected state
 * - Optional edit/delete actions
 *
 * Reusable in: Checkout, Address Management, Order Details, Profile
 *
 * Phase 3A: UI only
 */
import { MapPin, Edit2, Trash2, Check } from 'lucide-react'

interface AddressCardProps {
  id: number
  fullName: string
  phone: string
  village: string
  street?: string
  house?: string
  isSelected?: boolean
  showActions?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function AddressCard({
  fullName,
  phone,
  village,
  street,
  house,
  isSelected = false,
  showActions = false,
  onSelect,
  onEdit,
  onDelete,
}: AddressCardProps) {
  const addressParts = [street, house].filter(Boolean).join(', ')

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-white hover:border-primary/50'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MapPin
              className={`h-5 w-5 flex-shrink-0 ${
                isSelected ? 'text-primary' : 'text-text-muted'
              }`}
            />
            <div>
              <p className="font-semibold text-text">{fullName}</p>
              <p className="text-sm text-text-muted">{phone}</p>
            </div>
          </div>

          <div className="mt-3 text-sm text-text">
            <p className="font-medium">{village}</p>
            {addressParts && <p className="mt-1 text-text-muted">{addressParts}</p>}
          </div>
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-3 flex gap-2 border-t border-border pt-3">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-white text-sm font-medium text-text transition-colors hover:bg-surface"
            >
              <Edit2 className="h-4 w-4" />
              Изменить
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-error bg-white text-sm font-medium text-error transition-colors hover:bg-error/10"
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </button>
          )}
        </div>
      )}
    </div>
  )
}

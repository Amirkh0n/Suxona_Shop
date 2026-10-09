/**
 * Checkbox component
 *
 * Custom checkbox component with styled variants.
 */

import { cn } from '@/utils/cn'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Checkbox({ label, className, checked, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        className={cn(
          'w-4 h-4 rounded border-2 border-border cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-all',
          'checked:bg-primary checked:border-primary',
          'hover:border-border-hover',
          className
        )}
        {...props}
      />
      {label && <span className="text-sm text-text">{label}</span>}
    </div>
  )
}

export default Checkbox

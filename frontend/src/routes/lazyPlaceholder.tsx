/**
 * lazyPlaceholder — utility for creating lazy placeholder components.
 *
 * Creates a lazy component that renders a named Placeholder page.
 * Used in routes.tsx for pages not yet implemented.
 */
import { lazy } from 'react'
import { Placeholder } from '@/pages/Placeholder'

export function lazyPlaceholder(name: string): React.LazyExoticComponent<() => React.ReactElement> {
  return lazy(
    (): Promise<{ default: () => React.ReactElement }> =>
      Promise.resolve({ default: () => <Placeholder name={name} /> }),
  )
}

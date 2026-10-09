/**
 * Utility for conditionally joining classNames
 *
 * Alternative to clsx/join from external dependencies
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

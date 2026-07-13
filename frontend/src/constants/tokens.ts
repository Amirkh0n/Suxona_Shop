/**
 * Design tokens mirrored from the design system (docs/frontend/06-design-system.md)
 * and the Tailwind theme (src/index.css) for programmatic, non-class usage
 * (e.g. inline canvas colors, chart libraries, Telegram theme mapping).
 *
 * Tailwind classes remain the primary styling mechanism; use these only where
 * a raw value is genuinely required. Keep in sync with the `@theme` block.
 */

export const COLORS = {
  primary: '#22C55E',
  primaryHover: '#16A34A',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
} as const

export const RADII = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
} as const

/** Allowed spacing values (px). Avoid arbitrary spacing outside this scale. */
export const SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const

/** Responsive breakpoints (px), mobile-first. */
export const BREAKPOINTS = {
  xs: 320,
  sm: 375,
  md: 768,
  lg: 1280,
} as const

export const FONT_FAMILY = "'Inter', sans-serif" as const

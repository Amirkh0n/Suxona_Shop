/**
 * Placeholder page — used by all routes until real pages are implemented.
 *
 * Renders the route name so routing/layout/guard behaviour is visible and
 * testable during Phase 2. Every placeholder is removed when the real page
 * is built in later phases.
 */
interface Props {
  name: string
}

export function Placeholder({ name }: Props) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm font-medium text-text-muted uppercase tracking-wider">
        Page placeholder
      </p>
      <h1 className="text-xl font-bold text-text">{name}</h1>
    </main>
  )
}

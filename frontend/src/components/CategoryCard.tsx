/**
 * CategoryCard — reusable category card component.
 *
 * Used on: Home Page (Categories Section).
 *
 * Requirements (UI/UX Spec):
 * - Category icon
 * - Category name
 * - Simple and easy to scan
 * - Grid layout
 *
 * Phase 3A: UI only, no API calls. Mock data.
 */
import { Link } from 'react-router-dom'
import { buildPath } from '@/routes/paths'
import type { LucideIcon } from 'lucide-react'

export interface CategoryCardProps {
  name: string
  icon: LucideIcon
  slug: string
}

export function CategoryCard({ name, icon: Icon, slug }: CategoryCardProps) {
  return (
    <Link
      to={buildPath.category(slug)}
      className="group flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:scale-105"
    >
      {/* Icon Container */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon size={24} aria-hidden="true" />
      </div>

      {/* Category Name */}
      <span className="text-xs font-medium text-text text-center line-clamp-2">
        {name}
      </span>
    </Link>
  )
}

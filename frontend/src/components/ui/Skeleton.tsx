/**
 * Skeleton component for loading states
 *
 * Provides a consistent loading placeholder across the application.
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton */
  width?: string
  /** Height of the skeleton */
  height?: string
  /** Animation type */
  animation?: 'pulse' | 'shimmer' | 'none'
  /** Custom border radius */
  borderRadius?: string
  /** Additional className */
  className?: string
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  animation = 'pulse',
  borderRadius = '0.375rem',
  className = '',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${animation !== 'none' ? 'animate-pulse' : ''} ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
      {...props}
    />
  )
}

/**
 * Circle skeleton for avatar loading state
 */
export function SkeletonCircle({
  size = '2rem',
  ...props
}: SkeletonProps & { size?: string }) {
  return <Skeleton width={size} height={size} borderRadius="50%" {...props} />
}

/**
 * Text skeleton for paragraphs
 */
export function SkeletonText({
  width = '100%',
  lines = 1,
  spacing = '0.5rem',
  ...props
}: SkeletonProps & { width?: string; lines?: number; spacing?: string }) {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} width={width} height="1rem" style={{ marginBottom: index < lines - 1 ? spacing : undefined }} {...props} />
      ))}
    </div>
  )
}

/**
 * Rectangular skeleton for cards
 */
export function SkeletonCard({
  imageHeight = '200px',
  ...props
}: SkeletonProps & { imageHeight?: string }) {
  return (
    <div className={`skeleton-card ${props.className}`} {...props}>
      <Skeleton width="100%" height={imageHeight} className="skeleton-image" />
      <div className="skeleton-content">
        <Skeleton width="70%" height="1.5rem" className="skeleton-title" />
        <Skeleton width="50%" height="1rem" className="skeleton-text" />
        <Skeleton width="60%" height="1rem" className="skeleton-text" />
        <div className="skeleton-footer">
          <Skeleton width="40%" height="2rem" />
        </div>
      </div>
    </div>
  )
}

/**
 * Linear skeleton for rows (e.g., order items, cart items)
 */
export function SkeletonRow({
  ...props
}: SkeletonProps & { width?: string }) {
  return (
    <div className={`skeleton-row ${props.className}`} {...props}>
      <Skeleton width="40%" height="1.5rem" />
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
        <Skeleton width="80px" height="2rem" />
      </div>
    </div>
  )
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({
  size = '2rem',
  ...props
}: SkeletonProps & { size?: string }) {
  return (
    <div className="skeleton-avatar" style={{ width: size, height: size, borderRadius: '50%' }} {...props}>
      <SkeletonCircle size={size} />
    </div>
  )
}

/**
 * Button skeleton
 */
export function SkeletonButton({
  width = '100px',
  ...props
}: SkeletonProps & { width?: string }) {
  return (
    <div
      className={`skeleton-button ${props.className}`}
      style={{ width, height: '2.5rem', borderRadius: '0.5rem' }}
      {...props}
    />
  )
}

/**
 * Input skeleton
 */
export function SkeletonInput({
  width = '100%',
  ...props
}: SkeletonProps & { width?: string }) {
  return (
    <div
      className={`skeleton-input ${props.className}`}
      style={{ width, height: '3rem', borderRadius: '0.5rem' }}
      {...props}
    />
  )
}

/**
 * Table row skeleton
 */
export function SkeletonTableRow({
  ...props
}: SkeletonProps) {
  return (
    <div className={`skeleton-table-row ${props.className}`} {...props}>
      <Skeleton width="20%" height="1.5rem" />
      <Skeleton width="20%" height="1.5rem" />
      <Skeleton width="15%" height="1.5rem" />
      <Skeleton width="10%" height="1.5rem" />
    </div>
  )
}

/**
 * Navbar skeleton
 */
export function SkeletonNavbar({
  ...props
}: SkeletonProps) {
  return (
    <div className={`skeleton-navbar ${props.className}`} {...props}>
      <Skeleton width="150px" height="2.5rem" />
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
        <Skeleton width="3rem" height="3rem" borderRadius="50%" />
      </div>
    </div>
  )
}

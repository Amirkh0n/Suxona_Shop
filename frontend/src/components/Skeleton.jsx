// Content-shaped loading placeholders. A spinner tells the shopper "wait";
// a skeleton that already has the grid's shape tells them "this is what's
// coming", which reads as faster even when the actual load time is the same.

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-products">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-product-card">
          <div className="skeleton skeleton-product-media" />
          <div className="skeleton-product-body">
            <div className="skeleton skeleton-line w-70" />
            <div className="skeleton skeleton-line w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RowSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton-row" style={{ marginBottom: 'var(--sp-2)' }}>
          <div className="skeleton skeleton-avatar" />
          <div className="skeleton-row-body">
            <div className="skeleton skeleton-line w-70" />
            <div className="skeleton skeleton-line w-40" />
          </div>
        </div>
      ))}
    </>
  );
}

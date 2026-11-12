/** Blocuri de încărcare cu aceeași formă ca și conținutul final. */

export function SkeletonCards({ count = 8 }: { count?: number }) {
  return (
    <div className="products-grid" aria-busy="true" aria-label="Se încarcă">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-media" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-rows" aria-busy="true" aria-label="Se încarcă">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line--short" />
          <div className="skeleton skeleton-line skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="skeleton-detail" aria-busy="true" aria-label="Se încarcă">
      <div className="skeleton skeleton-media" />
      <div className="skeleton-stack">
        <div className="skeleton skeleton-line skeleton-line--short" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line--short" />
      </div>
    </div>
  );
}

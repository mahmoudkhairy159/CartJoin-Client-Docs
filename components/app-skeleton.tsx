import type { CSSProperties } from 'react';

export type SkeletonKind = 'text' | 'avatar' | 'card' | 'table-row' | 'chart' | 'form';

export function AppSkeleton({
  kind, label, repeat = 1, columns = 4, className = '',
}: {
  kind: SkeletonKind;
  label?: string;
  repeat?: number;
  columns?: number;
  className?: string;
}) {
  const cells = kind === 'table-row' || kind === 'form' ? columns : 1;
  return (
    <div className={`app-skeleton app-skeleton--${kind} ${className}`}
      role={label ? 'status' : undefined} aria-hidden={label ? undefined : true}>
      {label && <span className="sr-only">{label}</span>}
      {Array.from({ length: repeat }, (_, row) => (
        <div className="app-skeleton-grid" key={row}
          style={{ '--skeleton-columns': cells } as CSSProperties} aria-hidden="true">
          {Array.from({ length: cells }, (_, column) => <span key={column} />)}
        </div>
      ))}
    </div>
  );
}

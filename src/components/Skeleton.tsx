/* Khối xám nhấp nháy khi đang tải. aria-hidden vì chỉ là chỗ giữ. */
export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`sk ${className}`} style={style} aria-hidden />;
}

export function PosterRowSkeleton({ n = 6 }: { n?: number }) {
  return (
    <div className="sk-row" aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="sk sk-poster" />
      ))}
    </div>
  );
}

export function TicketGridSkeleton({ n = 6 }: { n?: number }) {
  return (
    <div className="sk-grid" aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="sk sk-card" />
      ))}
    </div>
  );
}

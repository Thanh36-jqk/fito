"use client";

// Khối "So điểm hai đứa" ở trang chi tiết: điểm + ghi chú của cả hai. Thuần hiển thị.
import type { FilmScorePair, PersonScore } from "@/lib/journal";

function Cell({ p, label }: { p: PersonScore | null; label: string }) {
  return (
    <div className="cmp-cell">
      <span className="cmp-who">{p?.label ?? label}</span>
      {!p ? (
        <span className="cmp-empty">{label} chưa chấm phim này</span>
      ) : p.score != null ? (
        <span className="cmp-num tabular-nums">
          {p.score}
          <span className="cmp-den">/10</span>
        </span>
      ) : (
        <span className="cmp-seen">đã xem</span>
      )}
      {p?.note ? <p className="cmp-note">{p.note}</p> : null}
    </div>
  );
}

export function FilmScores({ pair }: { pair: FilmScorePair }) {
  if (!pair.signedIn || (!pair.me && !pair.them)) return null;
  return (
    <section className="cmp">
      <h3 className="cmp-h">So điểm hai đứa</h3>
      <div className="cmp-grid">
        <Cell p={pair.me} label="Tớ" />
        <Cell p={pair.them} label="Cậu" />
      </div>
    </section>
  );
}

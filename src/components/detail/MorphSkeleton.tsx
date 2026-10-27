"use client";

// Fallback của sheet khi đang tải: nếu đã nhớ thẻ vừa bấm thì render poster thật (cùng layoutId với hero)
// để morph bắt đầu ngay lúc bấm; phần còn lại là khung xương. Không nhớ được thì về DetailSkeleton thường.
import { usePathname } from "next/navigation";
import { displaySubtitle, parseMovieId } from "@/lib/movie";
import { getOpenedCard } from "@/lib/openedCards";
import { Poster } from "../film/Poster";
import { DetailSkeleton } from "./DetailSkeleton";

export function MorphSkeleton() {
  const path = usePathname();
  const m = /\/phim\/(-?\d+)/.exec(path ?? "");
  const id = m ? parseMovieId(m[1]) : null;
  const card = id == null ? null : getOpenedCard(id);
  if (!card) return <DetailSkeleton />;

  const block = "animate-pulse rounded-2xl bg-surface";
  const sub = displaySubtitle(card);
  return (
    <div className="sheet-scroll" aria-busy="true" aria-label="Đang tải phim">
      <div
        className={`d-hero ${card.backdropPath ? "has-bd" : ""}`}
        style={{ "--c1": "var(--surface-2)", "--c2": "var(--accent-2)" } as React.CSSProperties}
      >
        <Poster film={card} size="w780" sizes="(min-width: 768px) 170px, 118px" preload layoutId={`p-${card.id}`} />
        <div className="min-w-0">
          <h2 id="dTitle">{card.title}</h2>
          <div className="en">
            {sub.length > 0 && `${sub.join(" · ")} · `}
            <span className="num">{card.year ?? "—"}</span>
          </div>
          <div className="tags">
            {card.genres.map((g) => (
              <span key={g} className="tag">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className={`${block} mt-4 h-24`} />
      <div className="mt-4 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`${block} mx-auto size-14 rounded-full`} />
        ))}
      </div>
      <div className={`${block} mt-6 aspect-video`} />
    </div>
  );
}

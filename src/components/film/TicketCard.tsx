"use client";

import Link from "next/link";
import { sampleCard, type Film } from "@/lib/films";
import { DASH, isSampleFilm, type MovieCard } from "@/lib/movie";
import { rememberCard } from "@/lib/openedCards";
import { Poster } from "./Poster";
import { ScorePill } from "./ScorePill";

/* Nghiêng 3D + vệt sáng theo con trỏ (chỉ máy có chuột, tôn trọng giảm chuyển động). Giống PosterStrip. */
function tilt(e: React.PointerEvent<HTMLElement>) {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const p = e.currentTarget.querySelector<HTMLElement>(".poster");
  if (!p) return;
  const r = p.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  p.style.transform = `rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 12}deg)`;
  p.style.setProperty("--gx", `${x * 100}%`);
  p.style.setProperty("--gy", `${y * 100}%`);
}
function untilt(e: React.PointerEvent<HTMLElement>) {
  const p = e.currentTarget.querySelector<HTMLElement>(".poster");
  if (p) p.style.transform = "";
}

/* Cuống vé trong lưới: Sắp chiếu (sticker ngày) và Ở nhà (sticker nền tảng). */
export function TicketCard({
  film,
  sticker,
  showScore,
  eager,
  flat,
}: {
  film: Film | MovieCard;
  sticker?: string | null;
  showScore?: boolean;
  eager?: boolean;
  flat?: boolean; // tắt morph layoutId (dùng cho rail trong sheet, tránh trùng id với lưới)
}) {
  const sample = isSampleFilm(film);
  const card = sample ? sampleCard(film) : film;
  const tag = sticker !== undefined ? sticker : sample ? (film.when === "home" ? film.providers![0] : film.date) : null;
  const score = showScore ?? (sample ? film.when === "home" : false);
  const sub = [card.genres.slice(0, 2).join(" · ") || DASH, card.runtime ? `${card.runtime} phút` : null]
    .filter((x) => x != null)
    .join(" · ");
  return (
    <Link
      href={`/phim/${card.id}`}
      scroll={false}
      className="ticket soon"
      onPointerMove={tilt}
      onPointerLeave={untilt}
      onClick={() => rememberCard(card)}
    >
      <Poster film={film} eager={eager} layoutId={flat ? undefined : `p-${card.id}`} />
      {tag && <span className="sticker date num">{tag}</span>}
      <div className="perf" />
      <b>{card.title}</b>
      <span>{sub}</span>
      {score && (
        <div className="mt-1.5">
          <ScorePill film={card} />
        </div>
      )}
    </Link>
  );
}

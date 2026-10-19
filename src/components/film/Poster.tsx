import Image from "next/image";
import type { Film, Motif } from "@/lib/films";
import { isSampleFilm, tmdbImg, type MovieCard } from "@/lib/movie";

type Art = { c1: string; c2: string; motif: Motif; title: string; meta: string };

// Số poster đầu mỗi danh sách tải eager: phủ hàng đầu (~6 cột ở 1366px), vì poster nào cùng hàng cũng có thể là LCP
export const EAGER_N = 6;

const metaOf = (c: MovieCard) => [c.year, c.runtime ? `${c.runtime}P` : null].filter((x) => x != null).join(" · ");

/*
  Poster: phim mẫu vẽ bằng CSS như bản mẫu; phim TMDB có ảnh thì giữ khung + halftone, nền là ảnh thật;
  phim TMDB chưa có poster thì vẽ motif "grid" bằng màu token kèm tên phim.
*/
export function Poster({
  film,
  bare = false,
  className = "",
  style,
  children,
  size = "w500",
  sizes = "(min-width: 1024px) 210px, (min-width: 768px) 180px, 45vw",
  preload = false,
  eager = false,
}: {
  film: Film | MovieCard;
  bare?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  size?: "w500" | "w780";
  sizes?: string;
  preload?: boolean;
  eager?: boolean; // poster đầu danh sách: tải ngay, ưu tiên cao (Next 16 khuyên dùng thay preload)
}) {
  let art: Art;
  if (isSampleFilm(film)) {
    art = { c1: film.c1, c2: film.c2, motif: film.motif, title: film.vi, meta: `${film.year} · ${film.min}P` };
  } else if (film.sample) {
    art = { ...film.sample, title: film.title, meta: metaOf(film) };
  } else if (film.posterPath) {
    return (
      <div className={`poster has-img ${bare ? "bare" : ""} ${className}`} style={style}>
        <Image
          className="pimg"
          src={tmdbImg(film.posterPath, size)}
          alt=""
          fill
          sizes={sizes}
          preload={preload}
          loading={eager && !preload ? "eager" : undefined}
          fetchPriority={eager && !preload ? "high" : undefined}
        />
        <div className="halftone" />
        <div className="glare" />
        {children}
      </div>
    );
  } else {
    art = { c1: "var(--surface-2)", c2: "var(--accent-2)", motif: "grid", title: film.title, meta: metaOf(film) };
  }

  return (
    <div
      className={`poster m-${art.motif} ${bare ? "bare" : ""} ${className}`}
      style={{ "--c1": art.c1, "--c2": art.c2, ...style } as React.CSSProperties}
    >
      <div className="motif" />
      <div className="halftone" />
      <div className="ptitle">{art.title}</div>
      {art.meta && <div className="pmeta num">{art.meta}</div>}
      <div className="glare" />
      {children}
    </div>
  );
}

import type { Film } from "@/lib/films";

/* Poster vẽ bằng CSS cho dữ liệu mẫu. Pha 2 đổi sang ảnh TMDB nhưng giữ khung và halftone. */
export function Poster({
  film,
  bare = false,
  className = "",
  style,
  children,
}: {
  film: Film;
  bare?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`poster m-${film.motif} ${bare ? "bare" : ""} ${className}`}
      style={{ "--c1": film.c1, "--c2": film.c2, ...style } as React.CSSProperties}
    >
      <div className="motif" />
      <div className="halftone" />
      <div className="ptitle">{film.vi}</div>
      <div className="pmeta num">
        {film.year} · {film.min}P
      </div>
      <div className="glare" />
      {children}
    </div>
  );
}

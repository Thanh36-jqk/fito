"use client";

import { useState } from "react";
import { fmtDayMonth, type MovieCard } from "@/lib/movie";
import { totalScore } from "@/lib/score";
import { EmptyState } from "../EmptyState";
import { PosterStrip } from "./PosterStrip";
import { TicketCard } from "./TicketCard";

const GENRES = ["Tất cả", "Hành động", "Kinh dị", "Hài", "Tình cảm", "Hoạt hình", "Điểm ≥ 7,5"];
const ROT = [-2, 1.5, -1, 2, -1.5, 1, -2];

export function RapView({
  now: nowAll,
  soon: soonAll,
  nowError,
  soonError,
}: {
  now: MovieCard[];
  soon: MovieCard[];
  nowError: boolean;
  soonError: boolean;
}) {
  const [genre, setGenre] = useState("Tất cả");
  const pass = (f: MovieCard) =>
    genre === "Tất cả" || (genre === "Điểm ≥ 7,5" ? (totalScore(f.sc) ?? 0) >= 7.5 : f.genres.includes(genre));
  const now = nowAll.filter(pass);
  const soon = soonAll.filter(pass);

  return (
    <>
      <div className="chips" role="group" aria-label="Lọc thể loại">
        {GENRES.map((g, i) => (
          <button
            key={g}
            type="button"
            className="chip"
            style={{ "--rot": `${ROT[i % ROT.length]}deg` } as React.CSSProperties}
            aria-pressed={g === genre}
            onClick={() => setGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="sec-h">
        <h2>Đang chiếu</h2>
        <span className="note">
          quẹt ngang nè
          <svg viewBox="0 0 40 22" aria-hidden>
            <path d="M2 14 C 12 4, 24 20, 36 8" />
            <path d="M30 6 L37 7 L35 14" />
          </svg>
        </span>
      </div>
      {nowError ? (
        <EmptyState mood="sad" title="TMDB đang trục trặc">
          Chưa lấy được phim đang chiếu. Thử tải lại sau nha.
        </EmptyState>
      ) : now.length ? (
        <PosterStrip films={now} />
      ) : (
        <EmptyState mood="sad" title="Không có phim hợp chip này">
          Thử chip khác nha.
        </EmptyState>
      )}

      <div className="sec-h">
        <h2>Sắp chiếu</h2>
        <small>theo TMDB</small>
      </div>
      {soonError ? (
        <p className="text-muted">Chưa lấy được phim sắp chiếu từ TMDB.</p>
      ) : soon.length ? (
        <div className="grid-tickets">
          {soon.map((f, i) => (
            <TicketCard key={f.id} film={f} sticker={fmtDayMonth(f.releaseDate)} eager={i === 0} />
          ))}
        </div>
      ) : (
        <p className="text-muted">Chưa có phim sắp chiếu hợp bộ lọc.</p>
      )}
      <p className="foot">
        Phim và lịch theo TMDB, có thể lệch với rạp thật. Sản phẩm dùng API của TMDB nhưng không được TMDB xác nhận
        hay chứng nhận.
      </p>
    </>
  );
}

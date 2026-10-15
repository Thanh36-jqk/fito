"use client";

import { useState } from "react";
import { FILMS, total } from "@/lib/films";
import { EmptyState } from "../EmptyState";
import { PosterStrip } from "./PosterStrip";
import { TicketCard } from "./TicketCard";

const GENRES = ["Tất cả", "Hành động", "Kinh dị", "Hài", "Tình cảm", "Hoạt hình", "Điểm ≥ 7,5"];
const ROT = [-2, 1.5, -1, 2, -1.5, 1, -2];

export function RapView() {
  const [genre, setGenre] = useState("Tất cả");
  const pass = (f: (typeof FILMS)[number]) =>
    genre === "Tất cả" || (genre === "Điểm ≥ 7,5" ? (total(f) ?? 0) >= 7.5 : f.genres.includes(genre));
  const now = FILMS.filter((f) => f.when === "now" && pass(f));
  const soon = FILMS.filter((f) => f.when === "soon" && pass(f));

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
      {now.length ? (
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
      {soon.length ? (
        <div className="grid-tickets">
          {soon.map((f) => (
            <TicketCard key={f.id} film={f} />
          ))}
        </div>
      ) : (
        <p className="text-muted">Chưa có phim sắp chiếu hợp bộ lọc.</p>
      )}
      <p className="foot">Dữ liệu mẫu, phim và điểm là giả. App thật lấy từ TMDB, OMDb, Trakt.</p>
    </>
  );
}

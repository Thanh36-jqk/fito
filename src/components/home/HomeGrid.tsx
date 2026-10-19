"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { EAGER_N } from "@/components/film/Poster";
import { TicketCard } from "@/components/film/TicketCard";
import { fetchMovies, type Filters } from "@/lib/discover";
import type { MovieCard, MoviePage } from "@/lib/movie";

/* Lưới Ở nhà: trang 1 từ server, "Xem thêm" gọi /api/discover rồi nối vào cuối (bỏ phim trùng). */
export function HomeGrid({ filters, first }: { filters: Filters; first: MoviePage }) {
  const [list, setList] = useState<MovieCard[]>(first.results);
  const [page, setPage] = useState(first.page);
  const [totalPages, setTotalPages] = useState(first.totalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function more() {
    setLoading(true);
    setError(false);
    try {
      const next = await fetchMovies(filters, page + 1);
      setList((cur) => {
        const seen = new Set(cur.map((m) => m.id));
        return [...cur, ...next.results.filter((m) => !seen.has(m.id))];
      });
      setPage(next.page);
      setTotalPages(next.totalPages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid-tickets">
        {list.map((f, i) => (
          <TicketCard key={f.id} film={f} sticker={f.year ? String(f.year) : null} showScore eager={i < EAGER_N} />
        ))}
      </div>
      {page < totalPages ? (
        <div className="home-more">
          {error && <p className="text-muted">Chưa tải thêm được, bấm thử lại nha.</p>}
          <button type="button" className="btn btn-ghost" disabled={loading} onClick={more}>
            {loading ? (
              <>
                <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
                Đang tải…
              </>
            ) : error ? (
              "Thử lại"
            ) : (
              "Xem thêm"
            )}
          </button>
        </div>
      ) : (
        <p className="hint">Hết phim hợp bộ lọc rồi</p>
      )}
    </>
  );
}

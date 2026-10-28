import type { Metadata } from "next";
import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Hello } from "@/components/Hello";
import { EAGER_N } from "@/components/film/Poster";
import { TicketCard } from "@/components/film/TicketCard";
import { ResultsSkeleton, SearchBox, SearchBoxShell } from "@/components/search/SearchBox";
import { tmdbImg, type PersonHit } from "@/lib/movie";
import { searchMovies, settle } from "@/lib/tmdb/api";

export const metadata: Metadata = { title: "Tìm phim" };

export default function TimPage({ searchParams }: PageProps<"/tim">) {
  return (
    <section>
      <Hello lead="Tìm phim" highlight="gì nè?" />
      <Suspense fallback={<SearchBoxShell />}>
        <SearchBox />
      </Suspense>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
      <p className="foot">
        Kết quả từ TMDB. Sản phẩm dùng API của TMDB nhưng không được TMDB xác nhận hay chứng nhận.
      </p>
    </section>
  );
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function pageHref(q: string, n: number) {
  return `/tim?q=${encodeURIComponent(q)}&trang=${n}`;
}

/* Diễn viên/đạo diễn khớp tên: bấm sang trang người. */
function PeopleHits({ people }: { people: PersonHit[] }) {
  return (
    <div className="block">
      <div className="sec-h">
        <h2>Người</h2>
        <small>diễn viên · đạo diễn</small>
      </div>
      <div className="people-hits">
        {people.map((p) => (
          <Link key={p.id} href={`/nguoi/${p.id}`} scroll={false} className="phit">
            <span className="ph">
              {p.profilePath ? (
                <Image src={tmdbImg(p.profilePath, "w185")} alt="" width={76} height={76} />
              ) : (
                <UserRound className="size-8" aria-hidden />
              )}
            </span>
            <b>{p.name}</b>
            {p.role && <span>{p.role}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/tim">, "searchParams">) {
  await connection(); // đọc TMDB ở request-time, không prefill lúc build
  const sp = await searchParams;
  const q = (first(sp.q) ?? "").trim();
  const page = Number(first(sp.trang)) || 1;

  if (!q) {
    return (
      <EmptyState mood="happy" title="Muốn tìm phim gì nè?" hand="thử: snakes and earrings">
        Tìm cả phim hiếm, không chiếu ở VN. Gõ tên Việt, tên Anh hay tên gốc đều ra.
      </EmptyState>
    );
  }

  const r = await settle(searchMovies(q, page));
  if (!r.ok) {
    return (
      <EmptyState mood="sad" title="TMDB đang trục trặc">
        Chưa tìm được, thử lại sau nha.
      </EmptyState>
    );
  }

  const { results, people, total, totalPages, page: cur, query } = r.data;
  if (results.length === 0 && people.length === 0) {
    return (
      <EmptyState mood="sad" title={`Không thấy gì tên “${q}”`}>
        Thử tên tiếng Anh, tên gốc, hay tên diễn viên/đạo diễn xem sao.
      </EmptyState>
    );
  }

  return (
    <>
      {people.length > 0 && <PeopleHits people={people} />}
      {results.length > 0 && (
        <>
          <div className="sec-h">
            <h2>Phim</h2>
            <small>{`${total.toLocaleString("vi-VN")} phim · theo TMDB`}</small>
          </div>
          <div className="grid-tickets">
            {results.map((f, i) => (
              <TicketCard key={f.id} film={f} sticker={f.year ? String(f.year) : null} showScore eager={i < EAGER_N} />
            ))}
          </div>
        </>
      )}
      {totalPages > 1 && (
        <nav className="pager" aria-label="Phân trang">
          {cur > 1 && (
            <Link href={pageHref(query, cur - 1)} className="btn btn-ghost">
              <ChevronLeft className="size-5" aria-hidden />
              Trang trước
            </Link>
          )}
          <span className="num">
            Trang {cur}/{totalPages}
          </span>
          {cur < totalPages && (
            <Link href={pageHref(query, cur + 1)} className="btn btn-ghost">
              Trang sau
              <ChevronRight className="size-5" aria-hidden />
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

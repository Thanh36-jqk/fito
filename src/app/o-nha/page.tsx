import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Hello } from "@/components/Hello";
import { PickCta } from "@/components/film/PickCta";
import { HomeFilters, HomeFiltersShell } from "@/components/home/HomeFilters";
import { HomeGrid } from "@/components/home/HomeGrid";
import { ResultsSkeleton } from "@/components/search/SearchBox";
import { overlayScores } from "@/lib/movie-cache";
import { fmtTotal, parseFilters, toSearch } from "@/lib/discover";
import { discoverMovies, settle } from "@/lib/tmdb/api";

export const metadata: Metadata = { title: "Ở nhà" };

export default function ONhaPage({ searchParams }: PageProps<"/o-nha">) {
  return (
    <section>
      <Hello lead="Ở nhà thì" highlight="xem gì?" />
      <PickCta where="home" title="Lọc phim trên mạng" sub="Chọn thể loại, độ dài, điểm rồi quẹt cùng nhau." />
      <Suspense fallback={<HomeFiltersShell />}>
        <HomeFilters />
      </Suspense>
      <Suspense fallback={<ResultsSkeleton />}>
        <HomeResults searchParams={searchParams} />
      </Suspense>
      <p className="foot">
        Dữ liệu phim từ TMDB. TMDB chưa có dữ liệu nền tảng ở VN nên tớ lọc theo gu, không đoán nền tảng. Sản phẩm dùng
        API của TMDB nhưng không được TMDB xác nhận hay chứng nhận.
      </p>
    </section>
  );
}

/* Trang 1 vẽ ở server theo URL; các trang sau HomeGrid tự gọi /api/discover. */
async function HomeResults({ searchParams }: Pick<PageProps<"/o-nha">, "searchParams">) {
  const f = parseFilters(await searchParams, "home");
  const r = await settle(discoverMovies(f, 1));
  if (!r.ok) {
    return (
      <EmptyState mood="sad" title="TMDB đang trục trặc">
        Chưa lấy được danh sách phim. Thử tải lại sau nha.
      </EmptyState>
    );
  }
  if (r.data.results.length === 0) {
    return (
      <EmptyState mood="sad" title="Không phim nào hợp bộ lọc">
        Thử nới bớt quốc gia, thập niên hay điểm nha.
      </EmptyState>
    );
  }
  const first = { ...r.data, results: await overlayScores(r.data.results) };
  return (
    <>
      <div className="sec-h">
        <h2>Kho phim</h2>
        <small>{`${fmtTotal(r.data.total)} phim · theo TMDB`}</small>
      </div>
      <HomeGrid key={toSearch(f)} filters={f} first={first} />
    </>
  );
}

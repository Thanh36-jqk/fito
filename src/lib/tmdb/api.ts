import "server-only";

// Lấy dữ liệu TMDB có cache ('use cache' + cacheLife). Lỗi thì throw bên trong scope có cache để không bị cache;
// phần phụ có thể lỗi (en-US, rạp) được gộp bên ngoài cache bằng settle().
import { cacheLife, cacheTag } from "next/cache";
import { discoverParams, effectiveSort, sortCinema, type Filters } from "@/lib/discover";
import { getImdbScore, getOmdbScores, getTraktScore } from "@/lib/ratings/sources";
import { getFilm, sampleDetail } from "@/lib/films";
import type { MovieCard, MovieDetail, MoviePage, Result, SearchPage } from "@/lib/movie";
import { TmdbError, tmdbGet } from "./client";
import { clean, mergeLists, toDetail } from "./pick";
import type { TmdbListItem, TmdbMovieFull, TmdbPaged } from "./types";

export const LIST_LIFE = { stale: 300, revalidate: 21600, expire: 86400 }; // danh sách: 6 giờ
export const DETAIL_LIFE = { stale: 300, revalidate: 86400, expire: 604800 }; // chi tiết: 24 giờ

type Params = Record<string, string | number | boolean>;

/* Một trang danh sách TMDB. Mọi danh sách đều có include_adult=false. */
async function fetchListPage(path: string, params: Params): Promise<TmdbPaged<TmdbListItem>> {
  "use cache";
  cacheLife(LIST_LIFE);
  cacheTag("tmdb", "tmdb-list");
  return tmdbGet<TmdbPaged<TmdbListItem>>(path, { ...params, include_adult: false });
}

/* Trang 1..min(total_pages, maxPages), mỗi trang gọi song song vi-VN và en-US. Có region thì ngày là ngày ra rạp VN, bỏ năm. */
async function fetchPagesViEn(path: string, params: Params, maxPages: number): Promise<MovieCard[]> {
  const pair = (page: number) =>
    Promise.all([
      fetchListPage(path, { ...params, language: "vi-VN", page }),
      fetchListPage(path, { ...params, language: "en-US", page }),
    ]);
  const first = await pair(1);
  const pages = Math.min(first[0].total_pages || 1, maxPages);
  const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, i) => pair(i + 2)));
  const all = [first, ...rest];
  return mergeLists(
    all.flatMap(([vi]) => vi.results),
    all.flatMap(([, en]) => en.results),
    "region" in params,
  );
}

export async function getNowPlayingVN(): Promise<MovieCard[]> {
  "use cache";
  cacheLife(LIST_LIFE);
  cacheTag("tmdb", "now-playing");
  return fetchPagesViEn("/movie/now_playing", { region: "VN" }, 3);
}

export async function getUpcomingVN(): Promise<MovieCard[]> {
  "use cache";
  cacheLife(LIST_LIFE);
  cacheTag("tmdb", "upcoming");
  const list = await fetchPagesViEn("/movie/upcoming", { region: "VN" }, 3);
  return list.sort((a, b) => {
    if (a.releaseDate === b.releaseDate) return 0;
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    return a.releaseDate < b.releaseDate ? -1 : 1;
  });
}

/* Khoảng ngày của now_playing VN (TMDB trả trong `dates`), dùng cho Ra rạp trong Chọn phim. */
async function nowPlayingWindow(): Promise<{ min: string; max: string }> {
  const { dates } = await fetchListPage("/movie/now_playing", { region: "VN", language: "vi-VN", page: 1 });
  if (!dates) throw new TmdbError("/movie/now_playing", 0);
  return { min: dates.minimum, max: dates.maximum };
}

/* Không cache ở tầng này: fetchListPage đã cache 6 giờ. Lỗi thì throw, nơi gọi bọc bằng settle(). */
export async function discoverMovies(f: Filters, page: number): Promise<MoviePage> {
  if (f.where === "cinema") {
    const list = await fetchPagesViEn("/discover/movie", discoverParams(f, await nowPlayingWindow()), 3);
    return { page: 1, totalPages: 1, total: list.length, results: sortCinema(list, effectiveSort(f)) };
  }
  const params = { ...discoverParams(f), page };
  const [vi, en] = await Promise.all([
    fetchListPage("/discover/movie", { ...params, language: "vi-VN" }),
    fetchListPage("/discover/movie", { ...params, language: "en-US" }),
  ]);
  return { page, totalPages: Math.min(vi.total_pages, 500), total: vi.total_results, results: mergeLists(vi.results, en.results) };
}

/* Bản vi-VN đầy đủ. 404 thì trả null (được cache); lỗi khác throw để không bị cache. */
async function getMovieVi(id: number): Promise<TmdbMovieFull | null> {
  "use cache";
  cacheLife(DETAIL_LIFE);
  cacheTag("tmdb", `movie-${id}`);
  try {
    return await tmdbGet<TmdbMovieFull>(`/movie/${id}`, {
      language: "vi-VN",
      append_to_response:
        "credits,videos,images,release_dates,keywords,similar,recommendations,reviews,watch/providers,external_ids",
      include_image_language: "vi,null,en",
      include_video_language: "vi,en,null,ja,ko,zh,th,fr,es,de,it,hi",
    });
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) return null;
    throw error;
  }
}

/* Bản en-US (tên, tóm tắt, review, phim tương tự). Lỗi throw để không bị cache. */
async function getMovieEn(id: number): Promise<TmdbMovieFull> {
  "use cache";
  cacheLife(DETAIL_LIFE);
  cacheTag("tmdb", `movie-${id}`);
  return tmdbGet<TmdbMovieFull>(`/movie/${id}`, {
    language: "en-US",
    append_to_response: "reviews,similar,recommendations",
  });
}

/* Chỉ tên en-US của một phim. Lỗi throw để không bị cache. */
async function getEnTitle(id: number): Promise<string | null> {
  "use cache";
  cacheLife(DETAIL_LIFE);
  cacheTag("tmdb", `movie-${id}`);
  return clean((await tmdbGet<{ title?: string }>(`/movie/${id}`, { language: "en-US" })).title);
}

/* Tên vi-VN chỉ là tên gốc (chưa dịch) và không phải phim tiếng Việt/Anh thì cần tên en-US. */
const needsEn = (m: TmdbListItem) =>
  m.original_language !== "vi" && m.original_language !== "en" && clean(m.title) === clean(m.original_title);

/* similar/recommendations bản en-US là danh sách khác (thứ tự, phim) so với vi-VN. Phim nào cần tên en
   mà danh sách en không có thì lấy tên en riêng (mỗi phim cache 24 giờ); lỗi thì bỏ qua phim đó. */
async function withEnTitles(vi: TmdbMovieFull, en: TmdbMovieFull): Promise<TmdbMovieFull> {
  const out: TmdbMovieFull = { ...en };
  await Promise.all(
    (["similar", "recommendations"] as const).map(async (k) => {
      const enList = en[k]?.results ?? [];
      const have = new Set(enList.map((m) => m.id));
      const missing = (vi[k]?.results ?? []).filter((m) => !m.adult).slice(0, 12).filter((m) => !have.has(m.id) && needsEn(m));
      if (!missing.length) return;
      const titles = await Promise.all(missing.map((m) => settle(getEnTitle(m.id))));
      const extra = missing.flatMap((m, i) => {
        const t = titles[i];
        return t.ok && t.data ? [{ ...m, title: t.data }] : [];
      });
      out[k] = { page: 1, total_pages: 1, total_results: enList.length + extra.length, ...en[k], results: [...enList, ...extra] };
    }),
  );
  return out;
}

async function cinemaOf(id: number): Promise<"now" | "soon" | null> {
  const now = await settle(getNowPlayingVN());
  if (now.ok && now.data.some((m) => m.id === id)) return "now";
  const soon = await settle(getUpcomingVN());
  if (soon.ok && soon.data.some((m) => m.id === id)) return "soon";
  return null;
}

/* Không cache ở tầng này: từng phần đã cache riêng. Phần phụ (en, rạp) lỗi thì chỉ thiếu ở lần này, không bị cache. */
export async function getMovieDetail(id: number, opts?: { scores?: boolean }): Promise<MovieDetail | null> {
  const [vi, en, cinema] = await Promise.all([getMovieVi(id), settle(getMovieEn(id)), cinemaOf(id)]);
  if (!vi || vi.adult) return null; // phim 18+ coi như không có
  const detail = toDetail({ vi, en: en.ok ? await withEnTitles(vi, en.data) : null, cinema });
  // Ảnh OG không dùng điểm nên bỏ qua để khỏi tốn lượt OMDb.
  return opts?.scores === false ? detail : withExternalScores(detail);
}

/* Bổ sung điểm IMDb, RT, Metacritic, Trakt theo imdb_id. Mỗi nguồn lỗi thì chỉ nguồn đó hiện "—". */
async function withExternalScores(detail: MovieDetail): Promise<MovieDetail> {
  if (!detail.imdbId) return detail;
  const [imdb, omdb, trakt] = await Promise.all([
    getImdbScore(detail.imdbId),
    settle(getOmdbScores(detail.imdbId)),
    settle(getTraktScore(detail.imdbId)),
  ]);
  detail.sc = {
    ...detail.sc,
    imdb,
    rt: omdb.ok ? omdb.data.rt : null,
    mc: omdb.ok ? omdb.data.mc : null,
    trakt: trakt.ok ? trakt.data : null,
  };
  return detail;
}

async function searchCached(q: string, page: number): Promise<SearchPage> {
  "use cache";
  cacheLife(LIST_LIFE);
  cacheTag("tmdb", "search");
  const [vi, en] = await Promise.all([
    tmdbGet<TmdbPaged<TmdbListItem>>("/search/movie", { query: q, page, language: "vi-VN", include_adult: false }),
    tmdbGet<TmdbPaged<TmdbListItem>>("/search/movie", { query: q, page, language: "en-US", include_adult: false }),
  ]);
  return {
    query: q,
    page,
    totalPages: Math.min(vi.total_pages, 500),
    total: vi.total_results,
    results: mergeLists(vi.results, en.results),
  };
}

export async function searchMovies(query: string, page: number): Promise<SearchPage> {
  const q = query.trim().replace(/\s+/g, " ").slice(0, 100);
  const p = Math.min(500, Math.max(1, Math.trunc(page) || 1));
  if (!q) return { query: "", page: p, totalPages: 0, total: 0, results: [] };
  return searchCached(q, p);
}

/* KHÔNG cache: bọc lời gọi để trang vẫn chạy khi TMDB lỗi. */
export async function settle<T>(p: Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await p };
  } catch {
    return { ok: false, error: "tmdb" };
  }
}

/* KHÔNG cache. Id âm là phim mẫu, id dương là phim TMDB. */
export async function getDetailForRoute(
  id: number,
  opts?: { scores?: boolean },
): Promise<{ ok: true; data: MovieDetail } | { ok: false; reason: "not_found" | "error" }> {
  if (id < 0) {
    const film = getFilm(id);
    return film ? { ok: true, data: sampleDetail(film) } : { ok: false, reason: "not_found" };
  }
  if (!(id > 0)) return { ok: false, reason: "not_found" };
  try {
    const data = await getMovieDetail(id, opts);
    return data ? { ok: true, data } : { ok: false, reason: "not_found" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

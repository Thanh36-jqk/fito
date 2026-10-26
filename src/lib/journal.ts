import "server-only";

// Đọc nhật ký hai người từ Supabase: phim đã xem (watch_log) và kho hóng (swipes 'want').
// RLS cho người đã đăng nhập đọc cả hai dòng của cả hai đứa. Dữ liệu hiển thị lấy từ movie_cache.
import type { MovieCard, MovieDetail } from "./movie";
import type { Scores } from "./score";
import { totalScore } from "./score";
import { createClient } from "./supabase/server";
import { hasSupabase } from "./supabase/env";

const NONE_SC: Scores = { imdb: null, rt: null, mc: null, tmdb: null, trakt: null };

export type JournalItem = { card: MovieCard; place: "cinema" | "home" | null; date: string | null };
export type Journal = { watched: JournalItem[]; wants: JournalItem[] };

/* Ảnh chụp phim gửi từ trang chi tiết lên server action để ghi nhật ký + snapshot movie_cache. */
export type Snapshot = {
  id: number;
  titleVi: string | null;
  titleEn: string | null;
  imdbId: string | null;
  year: number | null;
  runtime: number | null;
  genres: string[];
  posterPath: string | null;
  backdropPath: string | null;
  scores: Scores | null;
  scoreTotal: number | null;
  place: "cinema" | "home";
};

type CacheRow = {
  tmdb_id: number;
  title_vi: string | null;
  title_en: string | null;
  year: number | null;
  runtime: number | null;
  genres: string[] | null;
  poster_path: string | null;
  backdrop_path: string | null;
  scores: Scores | null;
};

const CACHE_COLS = "tmdb_id,title_vi,title_en,year,runtime,genres,poster_path,backdrop_path,scores";

/* Dựng MovieCard tối giản từ một dòng movie_cache để hiển thị cuống vé. */
function cardFromCache(r: CacheRow): MovieCard {
  const title = r.title_vi ?? r.title_en ?? "Phim";
  return {
    id: r.tmdb_id,
    title,
    enTitle: r.title_en ?? null,
    originalTitle: title,
    originalLanguage: "",
    year: r.year ?? null,
    releaseDate: null,
    runtime: r.runtime ?? null,
    genres: r.genres ?? [],
    posterPath: r.poster_path ?? null,
    backdropPath: r.backdrop_path ?? null,
    popularity: 0,
    sc: r.scores ?? NONE_SC,
    providers: [],
  };
}

export async function getJournal(): Promise<Journal> {
  if (!hasSupabase) return { watched: [], wants: [] };
  const sb = await createClient();
  const [wl, sw] = await Promise.all([
    sb.from("watch_log").select("tmdb_id,watched_on,place").order("watched_on", { ascending: false }),
    sb.from("swipes").select("tmdb_id,created_at").eq("decision", "want").order("created_at", { ascending: false }),
  ]);

  const watchedSeen = new Set<number>();
  const watchedIds: { id: number; place: "cinema" | "home" | null; date: string | null }[] = [];
  for (const r of wl.data ?? []) {
    if (watchedSeen.has(r.tmdb_id)) continue;
    watchedSeen.add(r.tmdb_id);
    watchedIds.push({ id: r.tmdb_id, place: r.place, date: r.watched_on });
  }

  const wantSeen = new Set<number>();
  const wantIds: number[] = [];
  for (const r of sw.data ?? []) {
    if (wantSeen.has(r.tmdb_id) || watchedSeen.has(r.tmdb_id)) continue; // đã xem thì bỏ khỏi kho hóng
    wantSeen.add(r.tmdb_id);
    wantIds.push(r.tmdb_id);
  }

  const allIds = [...watchedSeen, ...wantIds];
  if (!allIds.length) return { watched: [], wants: [] };

  const { data: cache } = await sb.from("movie_cache").select(CACHE_COLS).in("tmdb_id", allIds);
  const byId = new Map<number, CacheRow>((cache ?? []).map((r) => [r.tmdb_id, r as CacheRow]));

  const watched = watchedIds.flatMap((w) => {
    const row = byId.get(w.id);
    return row ? [{ card: cardFromCache(row), place: w.place, date: w.date }] : [];
  });
  const wants = wantIds.flatMap((id) => {
    const row = byId.get(id);
    return row ? [{ card: cardFromCache(row), place: null, date: null }] : [];
  });
  return { watched, wants };
}

/* Ảnh chụp phim từ MovieDetail để gửi lên server action. */
export function snapOf(film: MovieDetail): Snapshot {
  return {
    id: film.id,
    titleVi: film.title,
    titleEn: film.enTitle,
    imdbId: film.imdbId,
    year: film.year,
    runtime: film.runtime,
    genres: film.genres,
    posterPath: film.posterPath,
    backdropPath: film.backdropPath,
    scores: film.sc,
    scoreTotal: totalScore(film.sc),
    place: film.cinema ? "cinema" : "home",
  };
}

/* Trạng thái của phim với người đang đăng nhập, để nút ở trang chi tiết hiện đúng. */
export async function getMyFilmStatus(id: number): Promise<{ wanted: boolean; watched: boolean }> {
  if (!hasSupabase || id <= 0) return { wanted: false, watched: false };
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { wanted: false, watched: false };
  const [sw, wl] = await Promise.all([
    sb.from("swipes").select("tmdb_id").eq("user_id", auth.user.id).eq("tmdb_id", id).eq("decision", "want").maybeSingle(),
    sb.from("watch_log").select("tmdb_id").eq("user_id", auth.user.id).eq("tmdb_id", id).limit(1).maybeSingle(),
  ]);
  return { wanted: !!sw.data, watched: !!wl.data };
}

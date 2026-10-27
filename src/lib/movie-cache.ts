import "server-only";

// Đọc/ghi bảng movie_cache (bảng chỉ service_role ghi được).
// - snapshotMovie: ghi snapshot 1 phim khi quẹt/ghi Nhật ký (poster/tên cho Nhật ký + Match).
// - writeMovieCache: cron làm nóng nhiều phim kèm điểm đủ nguồn.
// - overlayScores: phủ điểm đủ nguồn từ cache lên thẻ list (vốn chỉ có tmdb).
import type { Snapshot } from "./journal";
import type { MovieCard, MovieDetail } from "./movie";
import type { Scores } from "./score";
import { totalScore } from "./score";
import { hasSupabase } from "./supabase/env";
import { createClient } from "./supabase/server";
import { createServiceClient } from "./supabase/service";

export async function snapshotMovie(s: Snapshot) {
  const svc = createServiceClient();
  if (!svc) return; // thiếu service key: bỏ qua, chỉ thiếu poster/tên ở Nhật ký/Match
  await svc.from("movie_cache").upsert(
    {
      tmdb_id: s.id,
      imdb_id: s.imdbId,
      title_vi: s.titleVi,
      title_en: s.titleEn,
      year: s.year,
      runtime: s.runtime,
      genres: s.genres,
      poster_path: s.posterPath,
      backdrop_path: s.backdropPath,
      scores: s.scores,
      score_total: s.scoreTotal,
    },
    { onConflict: "tmdb_id" },
  );
}

function toRow(d: MovieDetail, now: string) {
  return {
    tmdb_id: d.id,
    imdb_id: d.imdbId,
    title_vi: d.title,
    title_en: d.enTitle,
    year: d.year,
    runtime: d.runtime,
    genres: d.genres,
    poster_path: d.posterPath,
    backdrop_path: d.backdropPath,
    trailer_key: d.trailer?.key ?? null,
    providers_vn: d.providersVN,
    scores: d.sc,
    score_total: totalScore(d.sc),
    tmdb_fetched_at: now,
    omdb_fetched_at: now,
    trakt_fetched_at: now,
  };
}

/* Ghi một mẻ phim vào movie_cache. Trả số dòng đã ghi. Không có service_role thì throw (cron cần khoá). */
export async function writeMovieCache(details: MovieDetail[]): Promise<number> {
  const rows = details.filter((d) => d.id > 0).map((d) => toRow(d, new Date().toISOString()));
  if (!rows.length) return 0;
  const svc = createServiceClient();
  if (!svc) throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY");
  const { error } = await svc.from("movie_cache").upsert(rows, { onConflict: "tmdb_id" });
  if (error) throw new Error(`movie_cache upsert: ${error.message}`);
  return rows.length;
}

/* Đọc điểm đã cache cho danh sách tmdb_id (id dương). Lỗi hoặc thiếu Supabase → Map rỗng. */
async function getCachedScores(ids: number[]): Promise<Map<number, Scores>> {
  const out = new Map<number, Scores>();
  const pos = ids.filter((id) => id > 0);
  if (!hasSupabase || !pos.length) return out;
  try {
    const db = await createClient();
    const { data, error } = await db.from("movie_cache").select("tmdb_id, scores").in("tmdb_id", pos);
    if (error || !data) return out;
    for (const r of data as { tmdb_id: number; scores: Scores | null }[]) {
      if (r.scores) out.set(r.tmdb_id, r.scores);
    }
  } catch {
    // Đọc ngoài phạm vi request (không có cookie) hoặc DB lỗi: bỏ qua.
  }
  return out;
}

/* Phủ điểm đủ nguồn (imdb/rt/mc/trakt) từ cache lên thẻ list. Phim chưa cache giữ nguyên. */
export async function overlayScores<T extends MovieCard>(cards: T[]): Promise<T[]> {
  if (!cards.length) return cards;
  const cached = await getCachedScores(cards.map((c) => c.id));
  if (!cached.size) return cards;
  return cards.map((c) => (cached.has(c.id) ? { ...c, sc: cached.get(c.id)! } : c));
}

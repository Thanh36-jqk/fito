import "server-only";

// Ghi snapshot phim vào movie_cache (bảng chỉ service_role ghi được) để Nhật ký + Match hiện poster/tên.
import type { Snapshot } from "./journal";
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

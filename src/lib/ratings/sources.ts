import "server-only";

// Lấy điểm ngoài TMDB theo imdb_id. OMDb (RT+MC) và Trakt cache 24 giờ bằng 'use cache' (dùng chung mọi người,
// giữ OMDb dưới 1.000 lượt/ngày). IMDb đọc từ bảng Supabase imdb_ratings nên KHÔNG cache (phụ thuộc cookie phiên).
// Lỗi tạm thời throw trong scope có cache để không bị cache; "không có dữ liệu" trả null (cache được).
import { cacheLife, cacheTag } from "next/cache";
import type { Score } from "@/lib/score";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";
import { parseImdbRow, parseOmdb, parseTrakt } from "./parse";

// Cùng chính sách cache với chi tiết TMDB (24 giờ). Tự định nghĩa để tránh phụ thuộc vòng với tmdb/api.ts.
const RATING_LIFE = { stale: 300, revalidate: 86400, expire: 604800 };

const OMDB = "https://www.omdbapi.com/";
const TRAKT = "https://api.trakt.tv";

/* RT + Metacritic từ OMDb. Thiếu khoá hoặc phim không có → null (cache được). Hết lượt/lỗi mạng → throw. */
export async function getOmdbScores(imdbId: string): Promise<{ rt: Score; mc: Score }> {
  "use cache";
  cacheLife(RATING_LIFE);
  cacheTag("ratings", `omdb-${imdbId}`);
  const key = process.env.OMDB_API_KEY;
  if (!key) return { rt: null, mc: null };

  const url = new URL(OMDB);
  url.searchParams.set("i", imdbId);
  url.searchParams.set("apikey", key);
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`omdb ${res.status}`);
  const json = await res.json();
  // Hết lượt trong ngày thì đừng cache null, để ngày mai lấy lại.
  if (json?.Response === "False" && /limit/i.test(json?.Error ?? "")) throw new Error("omdb limit");
  const { rt, mc } = parseOmdb(json);
  return { rt, mc };
}

/* Điểm Trakt. Thiếu khoá hoặc 404 → null (cache được). Lỗi khác → throw. */
export async function getTraktScore(imdbId: string): Promise<Score> {
  "use cache";
  cacheLife(RATING_LIFE);
  cacheTag("ratings", `trakt-${imdbId}`);
  const key = process.env.TRAKT_CLIENT_ID;
  if (!key) return null;

  const res = await fetch(`${TRAKT}/movies/${imdbId}/ratings`, {
    headers: { "trakt-api-version": "2", "trakt-api-key": key, accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`trakt ${res.status}`);
  return parseTrakt(await res.json());
}

/* Điểm IMDb từ bảng imdb_ratings (tconst = imdb_id). Không cache. Thiếu Supabase/không có dòng/lỗi → null. */
export async function getImdbScore(imdbId: string): Promise<Score> {
  if (!hasSupabase) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("imdb_ratings")
      .select("rating,votes")
      .eq("tconst", imdbId)
      .maybeSingle();
    if (error) return null;
    return parseImdbRow(data);
  } catch {
    return null;
  }
}

import "server-only";

// Deck quẹt (phim thật) và danh sách trùng gu — đọc từ Supabase.
// Deck: phim đang chiếu + sắp chiếu (TMDB), bỏ phim mình đã quẹt. Trùng gu: view `matches` (cả hai cùng 'want').
import { CACHE_COLS, cardFromCache, type CacheRow } from "./journal";
import type { MovieCard } from "./movie";
import { getNowPlayingVN, getUpcomingVN, settle } from "./tmdb/api";
import { createClient } from "./supabase/server";
import { hasSupabase } from "./supabase/env";

export type MatchEntry = { card: MovieCard; at: string };

/* Phim thật để quẹt: đang chiếu + sắp chiếu, bỏ phim mình đã quẹt rồi. */
export async function getSwipeDeck(): Promise<MovieCard[]> {
  const [now, soon] = await Promise.all([settle(getNowPlayingVN()), settle(getUpcomingVN())]);
  const seen = new Set<number>();
  const list: MovieCard[] = [];
  for (const f of [...(now.ok ? now.data : []), ...(soon.ok ? soon.data : [])]) {
    if (!seen.has(f.id)) {
      seen.add(f.id);
      list.push(f);
    }
  }
  if (!hasSupabase || !list.length) return list;
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return list;
  const { data: mine } = await sb.from("swipes").select("tmdb_id").eq("user_id", auth.user.id);
  const swiped = new Set((mine ?? []).map((r) => r.tmdb_id));
  return list.filter((f) => !swiped.has(f.id));
}

/* Phim đã trùng gu (cả hai cùng muốn), kèm thời điểm trùng. */
export async function getMatches(): Promise<MatchEntry[]> {
  if (!hasSupabase) return [];
  const sb = await createClient();
  const { data: rows } = await sb.from("matches").select("tmdb_id,matched_at").order("matched_at", { ascending: false });
  const list = rows ?? [];
  if (!list.length) return [];
  const { data: cache } = await sb.from("movie_cache").select(CACHE_COLS).in(
    "tmdb_id",
    list.map((r) => r.tmdb_id),
  );
  const byId = new Map<number, CacheRow>((cache ?? []).map((r) => [r.tmdb_id, r as CacheRow]));
  return list.flatMap((r) => {
    const row = byId.get(r.tmdb_id);
    return row ? [{ card: cardFromCache(row), at: r.matched_at as string }] : [];
  });
}

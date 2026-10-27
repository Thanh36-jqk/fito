"use server";

// Ghi nhật ký: 'đã xem' → watch_log, 'hóng' → swipes. Ghi bằng phiên user (RLS: tự ghi của mình).
// Kèm snapshot phim vào movie_cache (chỉ service_role ghi được) để trang Nhật ký hiển thị poster/tên.
import { revalidatePath } from "next/cache";
import type { FilmScorePair, Snapshot } from "./journal";
import { getFilmScores } from "./journal";
import { snapshotMovie } from "./movie-cache";
import { hasSupabase } from "./supabase/env";
import { createClient } from "./supabase/server";

export async function markWatched(
  s: Snapshot,
  entry?: { score?: number | null; note?: string | null },
): Promise<{ ok: boolean; pair?: FilmScorePair }> {
  if (!hasSupabase || s.id <= 0) return { ok: false };
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false };
  await snapshotMovie(s);
  // bản gọn: một dòng/phim/người. Xoá dòng cũ rồi ghi lại để không trùng.
  await sb.from("watch_log").delete().eq("tmdb_id", s.id).eq("user_id", auth.user.id);
  const raw = entry?.score;
  const score = raw == null ? null : Math.min(10, Math.max(1, Math.round(raw))) || null; // kẹp 1..10
  const note = (entry?.note ?? "").trim().slice(0, 300) || null;
  const { error } = await sb.from("watch_log").insert({ tmdb_id: s.id, place: s.place, my_score: score, note });
  if (error) return { ok: false };
  revalidatePath("/nhat-ky");
  const pair = await getFilmScores(s.id);
  return { ok: true, pair };
}

export async function addWant(s: Snapshot): Promise<{ ok: boolean }> {
  if (!hasSupabase || s.id <= 0) return { ok: false };
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false };
  await snapshotMovie(s);
  const { error } = await sb.from("swipes").upsert({ tmdb_id: s.id, decision: "want" }, { onConflict: "user_id,tmdb_id" });
  if (error) return { ok: false };
  revalidatePath("/nhat-ky");
  revalidatePath("/match");
  return { ok: true };
}

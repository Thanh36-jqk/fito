"use server";

// Ghi nhật ký: 'đã xem' → watch_log, 'hóng' → swipes. Ghi bằng phiên user (RLS: tự ghi của mình).
// Kèm snapshot phim vào movie_cache (chỉ service_role ghi được) để trang Nhật ký hiển thị poster/tên.
import { revalidatePath } from "next/cache";
import type { Snapshot } from "./journal";
import { hasSupabase } from "./supabase/env";
import { createClient } from "./supabase/server";
import { createServiceClient } from "./supabase/service";

async function snapshot(s: Snapshot) {
  const svc = createServiceClient();
  if (!svc) return; // thiếu service key: bỏ qua snapshot, vẫn ghi được log (chỉ thiếu poster/tên ở Nhật ký)
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

export async function markWatched(s: Snapshot): Promise<{ ok: boolean }> {
  if (!hasSupabase || s.id <= 0) return { ok: false };
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false };
  await snapshot(s);
  // bản gọn: một dòng/phim/người. Xoá dòng cũ rồi ghi lại để không trùng.
  await sb.from("watch_log").delete().eq("tmdb_id", s.id).eq("user_id", auth.user.id);
  const { error } = await sb.from("watch_log").insert({ tmdb_id: s.id, place: s.place });
  if (error) return { ok: false };
  revalidatePath("/nhat-ky");
  return { ok: true };
}

export async function addWant(s: Snapshot): Promise<{ ok: boolean }> {
  if (!hasSupabase || s.id <= 0) return { ok: false };
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false };
  await snapshot(s);
  const { error } = await sb.from("swipes").upsert({ tmdb_id: s.id, decision: "want" }, { onConflict: "user_id,tmdb_id" });
  if (error) return { ok: false };
  revalidatePath("/nhat-ky");
  return { ok: true };
}

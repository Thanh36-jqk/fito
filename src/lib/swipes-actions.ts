"use server";

// Ghi một lần quẹt vào swipes (phiên user). 'want' thì snapshot phim + kiểm đã trùng gu chưa.
import { revalidatePath } from "next/cache";
import type { Snapshot } from "./journal";
import { snapshotMovie } from "./movie-cache";
import { getMatches, type MatchEntry } from "./swipes";
import { createClient } from "./supabase/server";
import { hasSupabase } from "./supabase/env";

export async function recordSwipe(s: Snapshot, decision: "want" | "skip"): Promise<{ ok: boolean; matched: boolean }> {
  if (!hasSupabase || s.id <= 0) return { ok: false, matched: false };
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false, matched: false };

  if (decision === "want") await snapshotMovie(s);
  const { error } = await sb.from("swipes").upsert({ tmdb_id: s.id, decision }, { onConflict: "user_id,tmdb_id" });
  if (error) return { ok: false, matched: false };

  let matched = false;
  if (decision === "want") {
    const { data } = await sb.from("matches").select("tmdb_id").eq("tmdb_id", s.id).maybeSingle();
    matched = !!data;
  }
  revalidatePath("/match");
  revalidatePath("/nhat-ky");
  return { ok: true, matched };
}

/* Cho client gọi lại danh sách trùng gu (dùng khi nhận sự kiện realtime). */
export async function fetchMatches(): Promise<MatchEntry[]> {
  return getMatches();
}

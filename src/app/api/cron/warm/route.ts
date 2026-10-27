// Cron làm nóng movie_cache: lấy điểm đủ nguồn cho ~phim hot, ghi vào bảng (giữ Supabase sống + điểm tổng lên thẻ list).
// Vercel gọi hằng ngày (xem vercel.json), tự gắn header Authorization: Bearer $CRON_SECRET.
import type { NextRequest } from "next/server";
import { writeMovieCache } from "@/lib/movie-cache";
import { getMovieDetail, getNowPlayingVN, getPopular, getUpcomingVN, settle } from "@/lib/tmdb/api";

export const maxDuration = 60; // Vercel Hobby tối đa 60s; ghi theo mẻ nên hết giờ vẫn giữ phần đã xong.

const MAX = 100; // số phim mỗi lần chạy (OMDb free 1.000 lượt/ngày)
const CONCURRENCY = 10;
const CHUNK = 20; // ghi mỗi mẻ bấy nhiêu phim

/* Chạy fn song song có giới hạn, bỏ qua phim lỗi. */
async function pool<T>(ids: number[], size: number, fn: (id: number) => Promise<T | null>): Promise<T[]> {
  const out: T[] = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(size, ids.length) }, async () => {
    while (i < ids.length) {
      const id = ids[i++];
      const r = await fn(id).catch(() => null);
      if (r) out.push(r);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [now, soon, pop] = await Promise.all([settle(getNowPlayingVN()), settle(getUpcomingVN()), settle(getPopular())]);
  const lists = [now, soon, pop].flatMap((r) => (r.ok ? r.data : []));
  const ids = [...new Set(lists.map((f) => f.id).filter((id) => id > 0))].slice(0, MAX);

  const details = await pool(ids, CONCURRENCY, (id) => getMovieDetail(id));

  let warmed = 0;
  for (let i = 0; i < details.length; i += CHUNK) {
    warmed += await writeMovieCache(details.slice(i, i + CHUNK));
  }

  return Response.json({ candidates: ids.length, warmed });
}

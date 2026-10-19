// Phim theo bộ lọc cho Chọn phim và "Xem thêm". Token TMDB chỉ dùng ở server, JSON chỉ chứa MoviePage.
import type { NextRequest } from "next/server";
import { parseFilters, parsePage } from "@/lib/discover";
import { discoverMovies, settle } from "@/lib/tmdb/api";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const r = await settle(discoverMovies(parseFilters(sp), parsePage(sp.get("trang"))));
  return r.ok ? Response.json(r.data) : Response.json({ error: "tmdb" }, { status: 502 });
}

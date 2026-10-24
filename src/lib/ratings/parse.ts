// Hàm thuần biến JSON OMDb/Trakt và dòng imdb_ratings thành Score. Không I/O, có test (parse.test.ts).
import type { Score } from "@/lib/score";

/* Số thực an toàn: bỏ dấu phẩy ngăn nghìn ("1,032"), loại "N/A"/rỗng/không phải số. */
function num(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string") return null;
  const s = raw.replace(/,/g, "").trim();
  if (!s || s.toUpperCase() === "N/A") return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

type OmdbRating = { Source?: string; Value?: string };
type OmdbResponse = {
  Response?: string;
  Ratings?: OmdbRating[];
  imdbRating?: string;
  imdbVotes?: string;
};

/* OMDb: chỉ lấy Rotten Tomatoes (0–100) và Metacritic (0–100); imdb để sẵn nhưng điểm IMDb lấy từ dataset.
   RT/MC là điểm nhà phê bình nên không có số lượt → votes bỏ trống (score.ts vẫn tính). */
export function parseOmdb(json: OmdbResponse | null | undefined): { rt: Score; mc: Score; imdb: Score } {
  const empty = { rt: null, mc: null, imdb: null };
  if (!json || json.Response === "False") return empty;
  const bySource = (name: string) => json.Ratings?.find((r) => r.Source === name)?.Value;

  const rtVal = num(bySource("Rotten Tomatoes")?.replace("%", "")); // "92%" → 92
  const mcVal = num(bySource("Metacritic")?.split("/")[0]); // "74/100" → 74
  const imdbVal = num(json.imdbRating); // "6.1" → 6.1
  const imdbVotes = num(json.imdbVotes); // "1,032" → 1032

  return {
    rt: rtVal == null ? null : { v: Math.round(rtVal) },
    mc: mcVal == null ? null : { v: Math.round(mcVal) },
    imdb: imdbVal == null ? null : { v: round1(imdbVal), ...(imdbVotes != null ? { votes: Math.round(imdbVotes) } : {}) },
  };
}

type TraktResponse = { rating?: number; votes?: number };

/* Trakt: rating thang 10, kèm số lượt. Không ai chấm (0 lượt) → null. */
export function parseTrakt(json: TraktResponse | null | undefined): Score {
  if (!json) return null;
  const rating = num(json.rating);
  const votes = num(json.votes);
  if (rating == null || rating <= 0 || !votes) return null;
  return { v: round1(rating), votes: Math.round(votes) };
}

/* Một dòng bảng imdb_ratings (rating thang 10, votes ≥ 50 do job nạp đã lọc). */
export function parseImdbRow(row: { rating?: unknown; votes?: unknown } | null | undefined): Score {
  if (!row) return null;
  const rating = num(row.rating);
  const votes = num(row.votes);
  if (rating == null || votes == null) return null;
  return { v: round1(rating), votes: Math.round(votes) };
}

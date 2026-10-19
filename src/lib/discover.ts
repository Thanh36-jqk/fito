// Bộ lọc phim dùng chung cho Ở nhà, Chọn phim và /api/discover. Thuần, an toàn cho client.
import { GENRE_VI, type MovieCard, type MoviePage } from "./movie";
import { fmt1, totalScore } from "./score";

export type Place = "cinema" | "home";
export type Len = "any" | "short" | "mid" | "long";
export type Sort = "score" | "hot" | "new";
export type Fame = "any" | "popular" | "hidden";
export type Decade = "2020" | "2010" | "2000" | "1990" | "1980" | "1970" | "old";
export type Filters = {
  where: Place;
  genres: number[]; // id thể loại TMDB, ghép kiểu OR, luôn tăng dần và không trùng
  len: Len;
  min: number; // 0 | 6 | 7 | 7.5
  sort: Sort | null; // null = mặc định, xem effectiveSort
  country: string | null; // mã trong COUNTRIES (ISO 3166-1 viết hoa)
  lang: string | null; // mã trong LANGUAGES (ISO 639-1 viết thường)
  decade: Decade | null; // chỉ có tác dụng khi where = "home"
  fame: Fame;
};

export const DEFAULT_FILTERS: Filters = {
  where: "home",
  genres: [],
  len: "any",
  min: 0,
  sort: null,
  country: null,
  lang: null,
  decade: null,
  fame: "any",
};

// bỏ 10770 "Phim truyền hình"
export const GENRE_CHIPS: { id: number; label: string }[] = [
  28, 35, 27, 10749, 16, 18, 878, 53, 9648, 80, 12, 14, 10751, 99, 36, 10752, 10402, 37,
].map((id) => ({ id, label: GENRE_VI[id] }));

export const LENS: [Len, string][] = [
  ["any", "Gì cũng được"],
  ["short", "Ngắn, dưới 100 phút"],
  ["mid", "Vừa, 100–120 phút"],
  ["long", "Dài, trên 120 phút"],
];
export const MINS: [number, string][] = [
  [0, "Gì cũng được"],
  [6, "Từ 6 trở lên"],
  [7, "Từ 7 trở lên"],
  [7.5, "Đỉnh nóc, từ 7,5"],
];
export const SORTS: [Sort, string][] = [
  ["score", "Điểm cao nhất"],
  ["hot", "Hot nhất"],
  ["new", "Mới nhất"],
];
export const FAMES: [Fame, string][] = [
  ["any", "Gì cũng được"],
  ["popular", "Phổ biến"],
  ["hidden", "Ít người biết"],
];
export const DECADES: [Decade, string][] = [
  ["2020", "2020–nay"],
  ["2010", "2010–2019"],
  ["2000", "2000–2009"],
  ["1990", "1990–1999"],
  ["1980", "1980–1989"],
  ["1970", "1970–1979"],
  ["old", "Trước 1970"],
];
export const COUNTRIES: { code: string; label: string }[] = [
  { code: "JP", label: "Nhật Bản" },
  { code: "KR", label: "Hàn Quốc" },
  { code: "US", label: "Mỹ" },
  { code: "GB", label: "Anh" },
  { code: "FR", label: "Pháp" },
  { code: "CN", label: "Trung Quốc" },
  { code: "HK", label: "Hồng Kông" },
  { code: "TW", label: "Đài Loan" },
  { code: "TH", label: "Thái Lan" },
  { code: "VN", label: "Việt Nam" },
  { code: "IN", label: "Ấn Độ" },
  { code: "ES", label: "Tây Ban Nha" },
  { code: "IT", label: "Ý" },
  { code: "DE", label: "Đức" },
];
export const LANGUAGES: { code: string; label: string }[] = [
  { code: "ja", label: "Tiếng Nhật" },
  { code: "ko", label: "Tiếng Hàn" },
  { code: "en", label: "Tiếng Anh" },
  { code: "fr", label: "Tiếng Pháp" },
  { code: "zh", label: "Tiếng Trung" },
  { code: "cn", label: "Tiếng Quảng Đông" },
  { code: "th", label: "Tiếng Thái" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "hi", label: "Tiếng Hindi" },
  { code: "es", label: "Tiếng Tây Ban Nha" },
];
export const WHERE_LABEL: Record<Place, string> = { cinema: "Ra rạp", home: "Ở nhà" };

/* Giá trị trong URL ↔ giá trị trong Filters */
const URL_WHERE: Record<string, Place> = { rap: "cinema", nha: "home" };
const URL_LEN: Record<string, Len> = { ngan: "short", vua: "mid", dai: "long" };
const URL_MIN: Record<string, number> = { "6": 6, "7": 7, "7.5": 7.5 };
const URL_SORT: Record<string, Sort> = { diem: "score", hot: "hot", moi: "new" };
const URL_FAME: Record<string, Fame> = { pho: "popular", it: "hidden" };
const URL_DECADE: Record<string, Decade> = { "2020": "2020", "2010": "2010", "2000": "2000", "1990": "1990", "1980": "1980", "1970": "1970", cu: "old" };
const keyOf = <V>(m: Record<string, V>, v: V) => Object.keys(m).find((k) => m[k] === v)!;
const own = <V>(m: Record<string, V>, k: string | null): V | undefined => (k != null && Object.hasOwn(m, k) ? m[k] : undefined);

type SP = URLSearchParams | Record<string, string | string[] | undefined>;

/* Tham số lặp lại thì lấy giá trị đầu. */
function first(sp: SP, k: string): string | null {
  if (sp instanceof URLSearchParams) return sp.get(k);
  const v = sp[k];
  return (Array.isArray(v) ? v[0] : v) ?? null;
}

export function parseFilters(sp: SP, forceWhere?: Place): Filters {
  const get = (k: string) => first(sp, k);
  const genres = [...new Set((get("theloai") ?? "").split(",").filter((s) => /^\d+$/.test(s)).map(Number))]
    .filter((id) => id in GENRE_VI)
    .sort((a, b) => a - b);
  const country = get("quocgia")?.toUpperCase() ?? null;
  const lang = get("ngonngu")?.toLowerCase() ?? null;
  return {
    where: forceWhere ?? own(URL_WHERE, get("noi")) ?? "home",
    genres,
    len: own(URL_LEN, get("dai")) ?? "any",
    min: own(URL_MIN, get("diem")) ?? 0,
    sort: own(URL_SORT, get("sx")) ?? null,
    country: COUNTRIES.some((c) => c.code === country) ? country : null,
    lang: LANGUAGES.some((l) => l.code === lang) ? lang : null,
    decade: own(URL_DECADE, get("thapnien")) ?? null,
    fame: own(URL_FAME, get("noitieng")) ?? "any",
  };
}

/* Chuỗi query không có "?" ở đầu, bỏ giá trị mặc định. Mọi giá trị đều là ký tự an toàn nên không cần encode. */
export function toSearch(f: Filters, opts: { page?: number; withWhere?: boolean } = {}): string {
  const out: [string, string | null][] = [
    ["noi", opts.withWhere ? keyOf(URL_WHERE, f.where) : null],
    ["theloai", f.genres.length ? f.genres.join(",") : null],
    ["dai", f.len !== "any" ? keyOf(URL_LEN, f.len) : null],
    ["diem", f.min > 0 ? String(f.min) : null],
    ["sx", f.sort ? keyOf(URL_SORT, f.sort) : null],
    ["quocgia", f.country],
    ["ngonngu", f.lang],
    ["thapnien", f.decade ? keyOf(URL_DECADE, f.decade) : null],
    ["noitieng", f.fame !== "any" ? keyOf(URL_FAME, f.fame) : null],
    ["trang", opts.page && opts.page > 1 ? String(opts.page) : null],
  ];
  return out
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

export function effectiveSort(f: Filters): Sort {
  return f.sort ?? (f.fame === "hidden" ? "score" : "hot");
}

const SORT_BY: Record<Sort, string> = { score: "vote_average.desc", hot: "popularity.desc", new: "primary_release_date.desc" };

/* Tham số /discover/movie (include_adult=false do fetchListPage thêm). Quy tắc ở docs/DECISIONS.md, 16/10/2026. */
export function discoverParams(f: Filters, window?: { min: string; max: string }): Record<string, string | number> {
  const p: Record<string, string | number> = {};
  if (f.genres.length) p.with_genres = [...f.genres].sort((a, b) => a - b).join("|");
  if (f.len === "short") Object.assign(p, { "with_runtime.gte": 1, "with_runtime.lte": 99 });
  if (f.len === "mid") Object.assign(p, { "with_runtime.gte": 100, "with_runtime.lte": 120 });
  if (f.len === "long") p["with_runtime.gte"] = 121;
  if (f.country) p.with_origin_country = f.country;
  if (f.lang) p.with_original_language = f.lang;

  let vc = 0;
  if (f.fame === "hidden") {
    p["vote_average.gte"] = Math.max(7, f.min);
    p["vote_count.lte"] = 2000;
    vc = 50;
  } else if (f.fame === "popular") {
    if (f.min > 0) p["vote_average.gte"] = f.min;
    vc = 1000;
  } else if (f.min > 0) {
    p["vote_average.gte"] = f.min;
    vc = 50;
  }

  if (f.where === "home") {
    const sort = effectiveSort(f);
    p.sort_by = SORT_BY[sort];
    // sàn lượt đánh giá; Ít người biết giữ đúng 50
    if (f.fame !== "hidden") vc = Math.max(vc, 20, sort === "score" ? 300 : 0);
    if (f.decade === "old") p["primary_release_date.lte"] = "1969-12-31";
    else if (f.decade) {
      p["primary_release_date.gte"] = `${f.decade}-01-01`;
      if (f.decade !== "2020") p["primary_release_date.lte"] = `${Number(f.decade) + 9}-12-31`;
    }
  } else {
    Object.assign(p, { region: "VN", with_release_type: "2|3", sort_by: "popularity.desc" });
    if (window) Object.assign(p, { "release_date.gte": window.min, "release_date.lte": window.max });
  }
  if (vc > 0) p["vote_count.gte"] = vc;
  return p;
}

/* Rạp: TMDB chỉ sắp theo popularity, thứ tự thật xếp ở đây. Trả mảng mới. */
export function sortCinema(list: MovieCard[], sort: Sort): MovieCard[] {
  const out = [...list];
  if (sort === "hot") return out.sort((a, b) => b.popularity - a.popularity);
  if (sort === "new")
    return out.sort((a, b) => {
      if (a.releaseDate === b.releaseDate) return 0;
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return a.releaseDate < b.releaseDate ? 1 : -1;
    });
  const t = new Map(out.map((m) => [m.id, totalScore(m.sc)]));
  return out.sort((a, b) => {
    const x = t.get(a.id) ?? null;
    const y = t.get(b.id) ?? null;
    if (x === y) return b.popularity - a.popularity;
    if (x == null) return 1;
    if (y == null) return -1;
    return y - x;
  });
}

export function parsePage(raw: string | null | undefined): number {
  const n = raw && /^\d+$/.test(raw) ? Number(raw) : 1;
  return Math.min(500, Math.max(1, n));
}

/* total_results của discover bị TMDB chặn trên. */
export function fmtTotal(n: number): string {
  return n >= 10000 ? "10.000+" : n.toLocaleString("vi-VN");
}

export function filterLabels(f: Filters): string[] {
  const out = f.genres.length ? f.genres.map((id) => GENRE_VI[id]) : ["Mọi thể loại"];
  if (f.len !== "any") out.push(LENS.find(([k]) => k === f.len)![1]);
  if (f.min > 0) out.push(`Điểm ≥ ${fmt1(f.min)}`);
  const country = COUNTRIES.find((c) => c.code === f.country);
  if (country) out.push(country.label);
  const lang = LANGUAGES.find((l) => l.code === f.lang);
  if (lang) out.push(lang.label);
  if (f.where === "home" && f.decade) out.push(DECADES.find(([k]) => k === f.decade)![1]);
  if (f.fame !== "any") out.push(FAMES.find(([k]) => k === f.fame)![1]);
  return out;
}

/* CHỈ CLIENT: gọi /api/discover (token nằm ở server). */
export async function fetchMovies(f: Filters, page = 1, signal?: AbortSignal): Promise<MoviePage> {
  const res = await fetch(`/api/discover?${toSearch(f, { page, withWhere: true })}`, { signal });
  if (!res.ok) throw new Error("tmdb");
  return (await res.json()) as MoviePage;
}

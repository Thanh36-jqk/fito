// Kiểu dữ liệu phim dùng chung cho server và client (không import server-only).
import type { Film, Motif } from "./films";
import type { Scores } from "./score";

export const DASH = "—";

export type SampleArt = { c1: string; c2: string; motif: Motif };

export type MovieCard = {
  id: number; // TMDB id (>0). Phim mẫu dùng id ÂM (-1..-15)
  title: string; // tên hiển thị, xem pickTitle
  enTitle: string | null; // tên en-US đã clean (có thể trùng title); null nếu không biết
  originalTitle: string;
  originalLanguage: string; // ISO 639-1
  year: number | null;
  releaseDate: string | null; // "YYYY-MM-DD" (danh sách có region=VN thì là ngày ở VN)
  runtime: number | null; // phút; danh sách luôn là null
  genres: string[]; // nhãn lấy từ GENRE_VI theo thứ tự TMDB, bỏ id lạ
  posterPath: string | null; // path TMDB "/abc.jpg"
  backdropPath: string | null;
  popularity: number;
  sc: Scores; // list: chỉ tmdb. Trang chi tiết bổ sung imdb/rt/mc/trakt theo imdb_id (xem tmdb/api.ts)
  providers: string[]; // nhãn nền tảng VN (Ở nhà); [] nếu không biết
  sample?: SampleArt; // chỉ phim mẫu
};

export type Provider = { id: number; name: string; logoPath: string | null };
export type ProvidersVN = {
  link: string | null;
  flatrate: Provider[];
  free: Provider[];
  ads: Provider[];
  rent: Provider[];
  buy: Provider[];
};
export type Person = { id: number; name: string; originalName: string | null; role: string; profilePath: string | null };
// Người trong kết quả tìm (tên + nghề chính). role null nếu TMDB không biết nghề.
export type PersonHit = { id: number; name: string; role: string | null; profilePath: string | null };
export type Trailer = { key: string; name: string; lang: string | null; publishedAt: string | null };
export type LangText = { text: string; lang: "vi" | "en" };
export type MovieReview = {
  id: string;
  src: "TMDB" | "Trakt" | "Mẫu";
  author: string;
  date: string | null; // ISO
  text: string;
  url: string | null;
  rating: number | null;
  spoiler: boolean;
};

export type MovieDetail = MovieCard & {
  imdbId: string | null;
  tagline: LangText | null;
  overview: LangText | null;
  logoPath: string | null;
  countries: string[]; // tên tiếng Việt qua Intl.DisplayNames("vi",{type:"region"})
  languages: string[]; // tên tiếng Việt qua Intl.DisplayNames("vi",{type:"language"}), viết hoa chữ đầu
  certification: { value: string; country: string } | null;
  vnRelease: string | null; // ngày ra rạp ở VN, "YYYY-MM-DD"
  cinema: "now" | "soon" | null;
  collection: string | null;
  budget: number | null; // 0 → null
  revenue: number | null; // 0 → null
  keywords: string[]; // tối đa 10
  cast: Person[]; // tối đa 15, xếp theo order, role = character
  crew: Person[]; // tối đa 8, role = nhãn việc làm tiếng Việt
  trailer: Trailer | null;
  providersVN: ProvidersVN | null; // null = JustWatch không có dữ liệu VN
  similar: MovieCard[]; // tối đa 12
  recommendations: MovieCard[]; // tối đa 12
  reviews: MovieReview[]; // tối đa 5
  isSample: boolean;
};

// Trang chi tiết một người: tiểu sử + danh sách phim (dùng lại thẻ phim).
export type PersonDetail = {
  id: number; // TMDB id (>0). Người mẫu dùng id ÂM (-1)
  name: string;
  originalName: string | null; // tên gốc nếu khác tên hiển thị
  role: string | null; // nghề chính (known_for_department) sang tiếng Việt
  bio: LangText | null;
  profilePath: string | null;
  birthday: string | null; // "YYYY-MM-DD"
  deathday: string | null;
  placeOfBirth: string | null;
  films: MovieCard[]; // phim của họ (cast + crew), dedupe, xếp mới nhất trước
  isSample: boolean;
};

export type MoviePage = { page: number; totalPages: number; total: number; results: MovieCard[] };
export type SearchPage = { query: string; page: number; totalPages: number; total: number; results: MovieCard[]; people: PersonHit[] };
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type Platform = { key: string; label: string; tmdbId: number | null };
export const PLATFORMS: Platform[] = [
  { key: "netflix", label: "Netflix", tmdbId: 8 },
  { key: "fpt-play", label: "FPT Play", tmdbId: null },
  { key: "galaxy-play", label: "Galaxy Play", tmdbId: null },
  { key: "vieon", label: "VieON", tmdbId: null },
  { key: "tv360", label: "TV360", tmdbId: null },
  { key: "prime-video", label: "Prime Video", tmdbId: 119 },
  { key: "disney-plus", label: "Disney+", tmdbId: 337 },
  { key: "apple-tv", label: "Apple TV", tmdbId: 350 },
  { key: "iqiyi", label: "iQIYI", tmdbId: null },
  { key: "wetv", label: "WeTV", tmdbId: null },
];

export const GENRE_VI: Record<number, string> = {
  28: "Hành động",
  12: "Phiêu lưu",
  16: "Hoạt hình",
  35: "Hài",
  80: "Hình sự",
  99: "Tài liệu",
  18: "Chính kịch",
  10751: "Gia đình",
  14: "Giả tưởng",
  36: "Lịch sử",
  27: "Kinh dị",
  10402: "Âm nhạc",
  9648: "Bí ẩn",
  10749: "Tình cảm",
  878: "Khoa học viễn tưởng",
  10770: "Phim truyền hình",
  53: "Gây cấn",
  10752: "Chiến tranh",
  37: "Miền Tây",
};

// thứ tự key = thứ tự ưu tiên
export const JOB_VI: Record<string, string> = {
  Director: "Đạo diễn",
  Screenplay: "Biên kịch",
  Writer: "Biên kịch",
  Novel: "Nguyên tác",
  "Original Music Composer": "Âm nhạc",
  "Director of Photography": "Quay phim",
  Producer: "Sản xuất",
  Editor: "Dựng phim",
};

// Nghề chính của người (known_for_department) sang tiếng Việt.
export const DEPT_VI: Record<string, string> = {
  Acting: "Diễn viên",
  Directing: "Đạo diễn",
  Writing: "Biên kịch",
  Production: "Sản xuất",
  Sound: "Âm nhạc",
  Camera: "Quay phim",
  Editing: "Dựng phim",
  "Visual Effects": "Kỹ xảo",
  Art: "Mỹ thuật",
  "Costume & Make-Up": "Phục trang & hoá trang",
  Crew: "Đoàn phim",
};

export type ImgSize = "w185" | "w500" | "w780" | "w1280";

export function tmdbImg(path: string, size: ImgSize): string {
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function isSampleFilm(f: Film | MovieCard): f is Film {
  return "motif" in f;
}

export function parseMovieId(raw: string): number | null {
  return /^-?[1-9]\d{0,8}$/.test(raw) ? Number(raw) : null;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/;

export function fmtDate(iso: string | null): string {
  const m = iso ? ISO_DATE.exec(iso) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : DASH;
}

export function fmtDayMonth(iso: string | null): string | null {
  const m = iso ? ISO_DATE.exec(iso) : null;
  return m ? `${m[3]}/${m[2]}` : null;
}

const USD = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function fmtMoneyUSD(n: number | null): string {
  return n == null ? DASH : USD.format(n);
}

export function displaySubtitle(c: Pick<MovieCard, "title" | "enTitle" | "originalTitle">): string[] {
  const out: string[] = [];
  if (c.enTitle && c.enTitle !== c.title) out.push(c.enTitle);
  if (c.originalTitle && c.originalTitle !== c.title && c.originalTitle !== c.enTitle) out.push(c.originalTitle);
  return out;
}

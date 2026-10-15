import { FILMS, total, type Film } from "@/lib/films";
import type { PickWhere } from "@/lib/store";

export type Len = "any" | "short" | "mid" | "long";
export type Sort = "score" | "new" | "short";
export type Criteria = { where: PickWhere; genres: string[]; len: Len; min: number; plats: string[]; sort: Sort };

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
  ["new", "Mới nhất"],
  ["short", "Ngắn nhất"],
];
export const WHERE: Record<PickWhere, { label: string; sub: string; ok: (f: Film) => boolean }> = {
  cinema: { label: "Ra rạp", sub: "Phim đang chiếu ngoài rạp ở VN", ok: (f) => f.when === "now" },
  home: { label: "Ở nhà", sub: "Phim có trên Netflix, FPT Play, Galaxy Play…", ok: (f) => f.when === "home" },
};

export const pool = (where: PickWhere) => FILMS.filter(WHERE[where].ok);
export const okGenre = (c: Criteria) => (f: Film) => !c.genres.length || f.genres.some((g) => c.genres.includes(g));
const okLen = (c: Criteria) => (f: Film) =>
  c.len === "any" || (c.len === "short" ? f.min < 100 : c.len === "mid" ? f.min >= 100 && f.min <= 120 : f.min > 120);
const okMin = (c: Criteria) => (f: Film) => !c.min || (total(f) ?? 0) >= c.min;
const okPlat = (c: Criteria) => (f: Film) => c.where !== "home" || !c.plats.length || f.providers!.some((p) => c.plats.includes(p));

export function results(c: Criteria) {
  const r = pool(c.where).filter((f) => okGenre(c)(f) && okLen(c)(f) && okMin(c)(f) && okPlat(c)(f));
  const by: Record<Sort, (a: Film, b: Film) => number> = {
    score: (a, b) => (total(b) ?? 0) - (total(a) ?? 0),
    new: (a, b) => b.year - a.year || b.id - a.id,
    short: (a, b) => a.min - b.min,
  };
  return r.sort(by[c.sort]);
}

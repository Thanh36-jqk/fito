// Phần dùng chung cho ảnh Open Graph (chỉ chạy ở server). Ảnh OG không đọc được CSS var nên màu chép từ token Neon.
import { cacheLife, cacheTag } from "next/cache";
import { tmdbImg } from "@/lib/movie";
import { DETAIL_LIFE } from "@/lib/tmdb/api";

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  bg: "#0D0E1A",
  surface: "#171829",
  accent: "#C6F432",
  accent2: "#8B7CFF",
  sticker: "#FF6BD6",
  fg: "#F4F4FA",
  muted: "#B3B5CF",
  onAccent: "#0D0E1A",
} as const;

const INK = "#2A1D0F";
const CREAM = "#FFF4D6";
const RED = "#FF5A5F";
const BLUSH = "#FF9DB0";
const { bg: BG, accent: ACC, sticker: STK } = OG_COLORS;

/* Vé xem phim + Bắp, nền trong suốt (giống icon của app). */
export const BRAND_ART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g transform="translate(256 256) scale(.94) translate(-256 -256)">
<g transform="rotate(-10 256 256)">
  <mask id="notch"><rect width="512" height="512" fill="#fff"/><circle cx="66" cy="311" r="26" fill="#000"/><circle cx="446" cy="311" r="26" fill="#000"/></mask>
  <g mask="url(#notch)"><rect x="80" y="248" width="372" height="150" rx="26" fill="#000" opacity=".5"/><rect x="70" y="236" width="372" height="150" rx="26" fill="${ACC}" stroke="#FFFFFF" stroke-width="8"/></g>
  <line x1="352" y1="258" x2="352" y2="364" stroke="${BG}" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 16"/>
  <circle cx="396" cy="311" r="14" fill="${STK}"/>
</g>
<g transform="translate(118 64) scale(2.15)">
  <g fill="${CREAM}" stroke="${INK}" stroke-width="3"><circle cx="34" cy="42" r="15"/><circle cx="86" cy="42" r="15"/><circle cx="58" cy="28" r="18"/><circle cx="46" cy="50" r="14"/><circle cx="74" cy="50" r="14"/></g>
  <path d="M22 54 h76 l-10 70 h-56z" fill="${RED}"/>
  <path d="M37 55 h15 l2 68 h-11z M68 55 h15 l-6 68 h-11z" fill="${CREAM}"/>
  <path d="M22 54 h76 l-10 70 h-56z" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="49" cy="84" r="4.5" fill="${INK}"/><circle cx="71" cy="84" r="4.5" fill="${INK}"/>
  <circle cx="42" cy="93" r="4" fill="${BLUSH}"/><circle cx="78" cy="93" r="4" fill="${BLUSH}"/>
  <path d="M52 95 q8 9 16 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>
</g></svg>`;

export function svgDataUri(svg: string): string {
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

/* Poster w500 dạng data URI, cache 24 giờ. Lỗi thì throw để không bị cache. */
async function loadPoster(path: string): Promise<string> {
  "use cache";
  cacheLife(DETAIL_LIFE);
  cacheTag("tmdb", "og");
  const res = await fetch(tmdbImg(path, "w500"), { signal: AbortSignal.timeout(5000) }); // máy ảnh treo thì bỏ poster, không treo ảnh OG
  if (!res.ok) throw new Error(`poster ${res.status}`);
  const type = res.headers.get("content-type") || "image/jpeg";
  return `data:${type};base64,` + Buffer.from(await res.arrayBuffer()).toString("base64");
}

export async function posterDataUri(path: string | null): Promise<string | null> {
  if (!path) return null;
  try {
    return await loadPoster(path);
  } catch {
    return null;
  }
}

import { ImageResponse } from "next/og";
import { displaySubtitle, parseMovieId } from "@/lib/movie";
import { BRAND_ART_SVG, OG_COLORS as C, OG_SIZE, posterDataUri, svgDataUri } from "@/lib/og";
import { getDetailForRoute } from "@/lib/tmdb/api";

export const alt = "Poster phim trên Fito";
export const size = OG_SIZE;
export const contentType = "image/png";

// Chỉ nhận màu thường làm nền dự phòng (phim mẫu); còn lại dùng màu surface
const PLAIN_COLOR = /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%]+\))$/i;

/* Ảnh xem trước của một phim: poster nghiêng + tên + chip mời xem. Không tìm thấy phim vẫn trả ảnh. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const id = parseMovieId((await params).id);
  const r = id == null ? null : await getDetailForRoute(id);
  const film = r?.ok ? r.data : null;
  const poster = await posterDataUri(film?.posterPath ?? null);

  const raw = film?.title ?? "Không tìm thấy phim";
  const title = raw.length > 48 ? raw.slice(0, 47).trimEnd() + "…" : raw;
  const sub = film ? displaySubtitle(film)[0] : undefined;
  const meta = film
    ? `${film.year ?? "—"} · ${film.genres.slice(0, 3).join(", ") || "—"}` + (film.runtime != null ? ` · ${film.runtime} phút` : "")
    : "—";
  const s = film?.sample;
  const fallback =
    s && PLAIN_COLOR.test(s.c1) && PLAIN_COLOR.test(s.c2) ? `linear-gradient(160deg, ${s.c1}, ${s.c2})` : C.surface;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 80px",
          backgroundColor: C.bg,
          backgroundImage: "radial-gradient(circle at 78% 40%, rgba(139,124,255,.38), transparent 60%)",
        }}
      >
        <div
          style={{
            width: 340,
            height: 510,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "10px solid #FFFFFF",
            borderRadius: 24,
            transform: "rotate(-3deg)",
            boxShadow: "14px 14px 0 rgba(0,0,0,.55)",
            overflow: "hidden",
            background: poster ? C.surface : fallback,
          }}
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} width={340} height={510} style={{ objectFit: "cover" }} alt="" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={svgDataUri(BRAND_ART_SVG)} width={260} height={260} alt="" />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.accent }}>Fito</div>
          <div style={{ fontSize: raw.length > 28 ? 60 : 72, fontWeight: 800, color: C.fg, lineHeight: 1.05 }}>{title}</div>
          {sub && <div style={{ fontSize: 32, color: C.muted }}>{sub}</div>}
          <div style={{ fontSize: 30, color: C.muted }}>{meta}</div>
          <div
            style={{
              alignSelf: "flex-start",
              marginTop: 12,
              backgroundColor: C.accent,
              color: C.onAccent,
              fontSize: 30,
              fontWeight: 800,
              padding: "10px 26px",
              borderRadius: 999,
            }}
          >
            Hai đứa xem phim này không?
          </div>
        </div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from "next/og";
import { ME, PARTNER } from "@/lib/films";
import { parseMovieId } from "@/lib/movie";
import { BRAND_ART_SVG, OG_COLORS as C, posterDataUri, svgDataUri } from "@/lib/og";
import { getDetailForRoute } from "@/lib/tmdb/api";

export const contentType = "image/png";
const SIZE = { width: 1080, height: 1920 }; // story 9:16

/* Ảnh story "TRÙNG GU" để đăng: poster nổi bật + hai avatar + tên phim + ngày. Nền app, phong cách sticker. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseMovieId((await params).id);
  const sp = new URL(request.url).searchParams;
  const n = sp.get("n") ?? "1";
  const date = sp.get("d") ?? "";

  const r = id == null ? null : await getDetailForRoute(id, { scores: false });
  const film = r?.ok ? r.data : null;
  const poster = await posterDataUri(film?.posterPath ?? null);
  const rawTitle = film?.title ?? "Phim của hai đứa";
  const title = rawTitle.length > 42 ? rawTitle.slice(0, 41).trimEnd() + "…" : rawTitle;
  const meta = film ? `${film.year ?? ""}${film.genres.length ? " · " + film.genres.slice(0, 2).join(" · ") : ""}` : "";

  const avatar = (letter: string, name: string, bg: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 132,
          height: 132,
          borderRadius: 999,
          background: bg,
          color: "#111",
          fontSize: 66,
          fontWeight: 800,
          border: "8px solid #FFFFFF",
          boxShadow: "8px 8px 0 rgba(0,0,0,.5)",
        }}
      >
        {letter}
      </div>
      <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: C.fg }}>{name}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "96px 72px",
          backgroundColor: C.bg,
          backgroundImage:
            "radial-gradient(circle at 20% 12%, rgba(139,124,255,.45), transparent 55%), radial-gradient(circle at 85% 88%, rgba(255,107,214,.4), transparent 55%)",
        }}
      >
        {/* thương hiệu */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={svgDataUri(BRAND_ART_SVG)} width={96} height={96} alt="" />
          <div style={{ display: "flex", fontSize: 52, fontWeight: 800, color: C.accent }}>Fito</div>
        </div>

        {/* tiêu đề lớn */}
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 132,
            fontWeight: 800,
            color: C.accent,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          TRÙNG GU!
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 40, color: C.muted }}>cả hai cùng muốn xem</div>

        {/* poster nổi bật */}
        <div
          style={{
            display: "flex",
            marginTop: 56,
            width: 560,
            height: 840,
            alignItems: "center",
            justifyContent: "center",
            border: "14px solid #FFFFFF",
            borderRadius: 28,
            transform: "rotate(-3deg)",
            boxShadow: "20px 20px 0 rgba(0,0,0,.55)",
            overflow: "hidden",
            background: C.surface,
          }}
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} width={560} height={840} style={{ objectFit: "cover" }} alt="" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={svgDataUri(BRAND_ART_SVG)} width={320} height={320} alt="" />
          )}
        </div>

        {/* tên phim */}
        <div
          style={{
            display: "flex",
            marginTop: 52,
            fontSize: rawTitle.length > 24 ? 60 : 72,
            fontWeight: 800,
            color: C.fg,
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        {meta ? <div style={{ display: "flex", marginTop: 14, fontSize: 36, color: C.muted }}>{meta}</div> : null}

        {/* hai avatar */}
        <div style={{ display: "flex", gap: 72, marginTop: "auto", alignItems: "flex-end" }}>
          {avatar(ME.letter, ME.name, C.accent)}
          <div style={{ display: "flex", fontSize: 56, color: C.sticker, paddingBottom: 54 }}>♥</div>
          {avatar(PARTNER.letter, PARTNER.name, C.sticker)}
        </div>

        {/* ngày + số thứ tự */}
        <div
          style={{
            display: "flex",
            marginTop: 48,
            alignItems: "center",
            gap: 16,
            background: C.sticker,
            color: "#111",
            fontSize: 36,
            fontWeight: 800,
            padding: "14px 34px",
            borderRadius: 999,
            border: "6px solid #FFFFFF",
            boxShadow: "8px 8px 0 rgba(0,0,0,.5)",
          }}
        >
          {date ? `${date} · ` : ""}lần trùng gu #{n}
        </div>
      </div>
    ),
    SIZE,
  );
}

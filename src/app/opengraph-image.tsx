import { ImageResponse } from "next/og";
import { BRAND_ART_SVG, OG_COLORS as C, OG_SIZE, svgDataUri } from "@/lib/og";

export const alt = "Fito: sổ tay chọn phim của hai đứa";
export const size = OG_SIZE;
export const contentType = "image/png";

/* Ảnh xem trước khi gửi link Fito (Zalo, Messenger...). */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: C.bg,
          backgroundImage: "radial-gradient(circle at 78% 40%, rgba(139,124,255,.38), transparent 60%)",
          paddingRight: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingLeft: 88 }}>
          <div
            style={{
              alignSelf: "flex-start",
              backgroundColor: C.sticker,
              color: C.onAccent,
              border: "4px solid #FFFFFF",
              borderRadius: 999,
              padding: "8px 22px",
              fontSize: 26,
              fontWeight: 800,
              transform: "rotate(-4deg)",
              boxShadow: "6px 6px 0 rgba(0,0,0,.55)",
            }}
          >
            SỔ TAY HAI ĐỨA
          </div>
          <div style={{ fontSize: 190, fontWeight: 800, color: C.accent, lineHeight: 1 }}>Fito</div>
          <div style={{ fontSize: 54, fontWeight: 700, color: C.fg }}>Tối nay hai đứa xem gì?</div>
          <div style={{ fontSize: 30, color: C.muted }}>Đi rạp hay ở nhà, quẹt chung rồi chốt đơn.</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={svgDataUri(BRAND_ART_SVG)} width={460} height={460} alt="" />
      </div>
    ),
    size,
  );
}

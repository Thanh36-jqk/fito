"use client";

import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { TicketCard } from "@/components/film/TicketCard";
import { PLATFORMS, type HomeData } from "@/lib/movie";

const ALL = "Tất cả";
const ROT = [-2, 1.5, -1, 2, -1.5, 1, -2];

/* Ở nhà: phim có trên nền tảng ở VN (JustWatch qua TMDB); không có dữ liệu VN thì hiện phim hot trên TMDB. */
export function HomeView({ data }: { data: HomeData | null }) {
  const [platform, setPlatform] = useState(ALL);
  const byPlatform = data?.byPlatform ?? [];
  const count = (label: string) => byPlatform.filter((f) => f.providers.includes(label)).length;
  const shown = platform === ALL ? byPlatform : byPlatform.filter((f) => f.providers.includes(platform));

  const chips = [{ label: ALL, n: null as number | null }, ...PLATFORMS.map((p) => ({ label: p.label, n: count(p.label) }))];

  return (
    <>
      <div className="sec-h">
        <h2>Có trên mạng</h2>
        <small>dữ liệu JustWatch</small>
      </div>
      <div className="chips home-chips" role="group" aria-label="Lọc nền tảng">
        {chips.map((c, i) => (
          <button
            key={c.label}
            type="button"
            className="chip"
            style={{ "--rot": `${ROT[i % ROT.length]}deg` } as React.CSSProperties}
            aria-pressed={c.label === platform}
            disabled={c.n === 0}
            onClick={() => setPlatform(c.label)}
          >
            {c.label}
            {c.n != null && <small className="num">{c.n}</small>}
          </button>
        ))}
      </div>

      {data === null ? (
        <EmptyState mood="sad" title="TMDB đang trục trặc">
          Chưa lấy được danh sách phim. Thử tải lại sau nha.
        </EmptyState>
      ) : byPlatform.length > 0 ? (
        <div className="grid-tickets">
          {shown.map((f) => (
            <TicketCard key={f.id} film={f} sticker={f.providers[0]} showScore />
          ))}
        </div>
      ) : (
        <>
          <EmptyState mood="wow" title="JustWatch chưa có dữ liệu ở Việt Nam">
            Nên tớ chưa biết phim nào đang có trên Netflix, FPT Play, Galaxy Play hay VieON ở VN. Không đoán bừa đâu nha.
          </EmptyState>
          <div className="sec-h">
            <h2>Đang hot trên TMDB</h2>
            <small>chưa rõ nền tảng ở VN</small>
          </div>
          <div className="grid-tickets">
            {data.fallback.map((f) => (
              <TicketCard key={f.id} film={f} showScore />
            ))}
          </div>
        </>
      )}

      <p className="foot">
        Dữ liệu phim từ TMDB, nơi xem từ JustWatch. Sản phẩm dùng API của TMDB nhưng không được TMDB xác nhận hay chứng
        nhận.
      </p>
    </>
  );
}

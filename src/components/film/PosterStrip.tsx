"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { DASH, type MovieCard } from "@/lib/movie";
import { EAGER_N, Poster } from "./Poster";
import { ScorePill } from "./ScorePill";

/*
  Băng poster: cuộn dừng giữa, poster giữa phóng to, hai bên mờ, nền app đổi màu theo poster giữa.
  Máy có chuột: kéo bằng chuột để cuộn, poster nghiêng 3D có vệt sáng theo con trỏ.
*/
/* Màu trung bình của poster (ảnh đi qua /_next/image cùng origin nên canvas đọc được). Lỗi thì null. */
function avgColor(img: HTMLImageElement): string | null {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 8;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, 8, 8);
    const d = ctx.getImageData(0, 0, 8, 8).data;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
    }
    const n = d.length / 4;
    return `rgb(${Math.round(r / n)} ${Math.round(g / n)} ${Math.round(b / n)})`;
  } catch {
    return null;
  }
}

export function PosterStrip({ films }: { films: MovieCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: false });
  const updateRef = useRef<() => void>(() => {});

  const update = useCallback(() => {
    const st = ref.current;
    if (!st) return;
    const r = st.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    let best: HTMLElement | null = null;
    let bd = Infinity;
    st.querySelectorAll<HTMLElement>(".slot").forEach((sl) => {
      const b = sl.getBoundingClientRect();
      const d = Math.min(Math.abs(b.left + b.width / 2 - cx) / (b.width + 20), 1);
      sl.style.transform = `scale(${(1.08 - d * 0.24).toFixed(3)})`;
      sl.style.opacity = (1 - d * 0.5).toFixed(3);
      if (d < bd) {
        bd = d;
        best = sl;
      }
    });
    const sl = best as HTMLElement | null;
    if (!sl) return;
    if (!sl.dataset.c) {
      const img = sl.querySelector("img");
      if (img && img.complete && img.naturalWidth > 0) {
        const c = avgColor(img);
        if (c) sl.dataset.c = c;
      } else if (img && !sl.dataset.wait) {
        // ảnh chưa tải xong: tạm dùng màu token, tải xong thì tính lại
        sl.dataset.wait = "1";
        img.addEventListener(
          "load",
          () => {
            delete sl.dataset.wait;
            updateRef.current();
          },
          { once: true },
        );
      }
    }
    document.body.style.setProperty("--tint", sl.dataset.c || "var(--accent-2)");
  }, []);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(() => {
    update();
    const st = ref.current!;
    const onScroll = () => requestAnimationFrame(update);
    st.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      st.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [update, films]);

  const fine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={ref}
      className="strip"
      data-lenis-prevent
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") return;
        drag.current = { on: true, x: e.clientX, left: ref.current!.scrollLeft, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.on) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 5 && !d.moved) {
          d.moved = true;
          ref.current!.classList.add("dragging");
        }
        if (d.moved) ref.current!.scrollLeft = d.left - dx;
      }}
      onPointerUp={() => {
        const st = ref.current!;
        drag.current.on = false;
        if (!st.classList.contains("dragging")) return;
        st.classList.remove("dragging");
        // trả lại snap rồi cuộn mượt vào poster gần giữa nhất
        const slots = [...st.querySelectorAll<HTMLElement>(".slot")];
        const r = st.getBoundingClientRect();
        const near = slots.reduce((a, b) =>
          Math.abs(b.getBoundingClientRect().left + b.offsetWidth / 2 - r.left - r.width / 2) <
          Math.abs(a.getBoundingClientRect().left + a.offsetWidth / 2 - r.left - r.width / 2) ? b : a,
        );
        near.scrollIntoView({ behavior: calm() ? "auto" : "smooth", inline: "center", block: "nearest" });
      }}
      onPointerLeave={() => {
        drag.current.on = false;
        ref.current?.classList.remove("dragging");
      }}
      onClickCapture={(e) => {
        if (drag.current.moved) {
          e.preventDefault();
          e.stopPropagation();
          drag.current.moved = false;
        }
      }}
    >
      {films.map((f, i) => (
        <div key={f.id} className="slot" data-c={f.sample?.c2}>
          <Link
            href={`/phim/${f.id}`}
            scroll={false}
            className="tilt"
            aria-label={`Xem chi tiết ${f.title}`}
            draggable={false}
            onPointerMove={(e) => {
              if (!fine() || calm() || drag.current.on) return;
              const el = e.currentTarget;
              const r = el.getBoundingClientRect();
              const x = (e.clientX - r.left) / r.width;
              const y = (e.clientY - r.top) / r.height;
              el.style.transform = `rotateY(${(x - 0.5) * 18}deg) rotateX(${(0.5 - y) * 18}deg)`;
              const p = el.firstElementChild as HTMLElement;
              p.style.setProperty("--gx", x * 100 + "%");
              p.style.setProperty("--gy", y * 100 + "%");
            }}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            <Poster film={f} eager={i < EAGER_N} sizes="(min-width: 1024px) 210px, 170px" />
          </Link>
          <div className="cap">
            <ScorePill film={f} />
            <span>{f.genres[0] ?? DASH}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

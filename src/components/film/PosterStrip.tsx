"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import type { Film } from "@/lib/films";
import { Poster } from "./Poster";
import { ScorePill } from "./ScorePill";

/*
  Băng poster: cuộn dừng giữa, poster giữa phóng to, hai bên mờ, nền app đổi màu theo poster giữa.
  Máy có chuột: kéo bằng chuột để cuộn, poster nghiêng 3D có vệt sáng theo con trỏ.
*/
export function PosterStrip({ films }: { films: Film[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: false });

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
    if (best) document.body.style.setProperty("--tint", (best as HTMLElement).dataset.c!);
  }, []);

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
      {films.map((f) => (
        <div key={f.id} className="slot" data-c={f.c2}>
          <Link
            href={`/phim/${f.id}`}
            scroll={false}
            className="tilt"
            aria-label={`Xem chi tiết ${f.vi}`}
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
            <Poster film={f} />
          </Link>
          <div className="cap">
            <ScorePill film={f} />
            <span>{f.genres[0]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

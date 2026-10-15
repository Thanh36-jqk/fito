"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getFilm, ME, PARTNER } from "@/lib/films";
import { buzz, useFito } from "@/lib/store";
import { Poster } from "../film/Poster";

gsap.registerPlugin(useGSAP);

const TITLE = "TRÙNG GU RỒI!";

/*
  Màn "Trùng gu rồi!" — một chuỗi GSAP:
  hai nửa vé ghép lại → avatar chạm nhau → chữ nảy → dải photobooth trồi lên → bắp rang bung.
*/
export function MatchOverlay() {
  const { state, dispatch } = useFito();
  const id = state.justMatched;
  if (id == null) return null;
  return <Overlay key={id} id={id} n={state.matches.length} onClose={() => dispatch({ type: "closeMatch" })} />;
}

function Overlay({ id, n, onClose }: { id: number; n: number; onClose: () => void }) {
  const film = getFilm(id)!;
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const openBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buzz([30, 60, 30]);
    openBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });
        tl.from(".half.l", { xPercent: -130, rotate: -12, duration: 0.6 })
          .from(".half.r", { xPercent: 130, rotate: 12, duration: 0.6 }, "<")
          .to(".half.l .ava", { x: 10, scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" })
          .to(".half.r .ava", { x: -10, scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, "<")
          .from(".mo h2 span", { y: 40, scale: 0.4, opacity: 0, duration: 0.5, stagger: 0.035 }, "-=0.2")
          .from(".mo .film", { opacity: 0, y: 10, duration: 0.3, ease: "power2.out" }, "-=0.25")
          .from(".booth", { y: 30, opacity: 0, rotate: 6, duration: 0.6 }, "-=0.15")
          .from(".mo .row, .booth-cap", { opacity: 0, y: 10, duration: 0.3, ease: "power2.out" }, "-=0.3");

        // bắp rang bung ra lúc hai avatar chạm nhau
        const box = root.current!;
        const kernels = Array.from({ length: 24 }, () => {
          const k = document.createElement("span");
          k.className = "kernel";
          const s = 12 + Math.random() * 10;
          k.style.width = k.style.height = s + "px";
          k.style.opacity = "0";
          box.appendChild(k);
          return k;
        });
        tl.add(() => {
          kernels.forEach((k) => {
            const a = Math.random() * Math.PI * 2;
            const d = 130 + Math.random() * 190;
            gsap.fromTo(
              k,
              { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.2, opacity: 1 },
              { x: Math.cos(a) * d, y: Math.sin(a) * d - 40, rotate: gsap.utils.random(-270, 270), scale: 1, duration: 1.6, ease: "power3.out", delay: Math.random() * 0.15 },
            );
            gsap.to(k, { opacity: 0, duration: 0.5, delay: 1.25, onComplete: () => k.remove() });
          });
        }, 0.6);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const d = new Date();
  const date = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div ref={root} className="mo" role="dialog" aria-modal="true" aria-label="Trùng gu" data-lenis-prevent>
      <div className="mo-in">
        <div className="halves">
          <div className="half l">
            <span className="ava me">{ME.letter}</span>
            <small><b>{ME.name}</b>chốt đơn</small>
          </div>
          <div className="half r">
            <small><b>{PARTNER.name}</b>cũng chốt</small>
            <span className="ava you">{PARTNER.letter}</span>
          </div>
        </div>
        <h2 aria-label={TITLE}>
          {Array.from(TITLE).map((ch, i) => (
            <span key={i} aria-hidden>{ch === " " ? " " : ch}</span>
          ))}
        </h2>
        <div className="film">cả hai cùng muốn xem <b>{film.vi}</b></div>
        <div className="booth">
          <div><Poster film={film} bare /></div>
          <div><span className="ava me">{ME.letter}</span></div>
          <div><span className="ava you">{PARTNER.letter}</span></div>
          <div className="dt num">{date}<br />{d.getFullYear()}<br />#{n}</div>
        </div>
        <div className="booth-cap">dải photobooth để đăng story · lưu ảnh sẽ có sau</div>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Để sau</button>
          <button ref={openBtn} type="button" className="btn btn-main" onClick={() => { onClose(); router.push(`/phim/${id}`, { scroll: false }); }}>
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { animate, motion } from "motion/react";
import { Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { SAMPLE_REVIEWS, total, type Film } from "@/lib/films";
import { countedSources, fmt1, fmtVotes, level, SOURCES, STAMP } from "@/lib/score";
import { useFito } from "@/lib/store";
import { EmptyState } from "../EmptyState";
import { Poster } from "../film/Poster";
import { Scratch } from "./Scratch";

const C = 138.2; // chu vi vòng điểm r=22

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt1(to);
      return;
    }
    const a = animate(0, to, { duration: 1, delay: 0.2, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => (el.textContent = fmt1(v)) });
    return () => a.stop();
  }, [to]);
  return <span ref={ref}>{fmt1(0)}</span>;
}

export function DetailBody({ film }: { film: Film }) {
  const { toast } = useFito();
  const t = total(film);
  const lv = level(t);
  const nCount = countedSources(film.sc).length;

  return (
    <>
      <div className="d-hero" style={{ "--c1": film.c1, "--c2": film.c2 } as React.CSSProperties}>
        <Poster film={film} />
        <div>
          <h2 id="dTitle">{film.vi}</h2>
          <div className="en">
            {film.en} · <span className="num">{film.year} · {film.min} phút</span>
          </div>
          <div className="tags">
            {film.genres.map((g) => (
              <span key={g} className="tag">{g}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="d-top">
        <div className="ticket total">
          <div className="big num">
            {t == null ? "—" : <CountUp to={t} />}
            <small>/10</small>
          </div>
          <div className="meta">
            <motion.span
              className={`stamp lv-${lv}`}
              initial={{ scale: 2.4, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.55 }}
            >
              {STAMP[lv]}
            </motion.span>
            <br />
            {t == null ? "Chưa nguồn nào đủ điểm" : `Trung bình ${nCount} nguồn có điểm`}
          </div>
        </div>

        <div className="rings">
          {SOURCES.map(({ key, label, div }, i) => {
            const s = film.sc[key];
            const has = !!s && s.v != null;
            const norm = has ? s.v / div : 0;
            const shown = !has ? "—" : key === "rt" ? s.v + "%" : key === "mc" ? s.v : fmt1(s.v);
            const sub = !has ? "chưa có" : s.votes != null ? (s.votes < 50 ? "ít lượt, không tính" : fmtVotes(s.votes)) : "nhà phê bình";
            const color = has ? `var(--${level(norm)})` : "var(--muted)";
            return (
              <div key={key} className="ring">
                <svg viewBox="0 0 58 58" aria-hidden>
                  <circle className="bgc" cx="29" cy="29" r="22" />
                  <motion.circle
                    cx="29" cy="29" r="22" stroke={color} strokeLinecap="round" strokeDasharray={C}
                    initial={{ strokeDashoffset: C }}
                    animate={{ strokeDashoffset: C * (1 - norm / 10) }}
                    transition={{ duration: 1, delay: 0.15 + i * 0.09, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </svg>
                <div className="rv num">{shown}</div>
                <b>{label}</b>
                <span className="num">{sub}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="d-cols">
        <div className="block">
          <h3>Trailer</h3>
          <button
            type="button"
            className="trailer"
            style={{ "--c1": film.c1, "--c2": film.c2 } as React.CSSProperties}
            aria-label="Phát trailer"
            onClick={() => toast("App thật sẽ mở trailer trên YouTube")}
          >
            <span className="play"><Play className="size-6" fill="currentColor" aria-hidden /></span>
          </button>
        </div>
        <div>
          <div className="block">
            <h3>Xem ở đâu</h3>
            {film.when === "home" ? (
              <>
                <div className="where">{film.providers!.map((p) => <span key={p} className="tag">{p}</span>)}</div>
                <p className="src">Dữ liệu nơi xem: JustWatch</p>
              </>
            ) : (
              <>
                <div className="where">
                  <span className="tag">{film.when === "now" ? "Đang chiếu ngoài rạp" : "Ra rạp " + film.date}</span>
                  <span className="tag">CGV · Lotte · Galaxy</span>
                </div>
                <p className="src">Lịch theo TMDB, có thể lệch với rạp thật</p>
              </>
            )}
          </div>
          <div className="block">
            <h3>Tóm tắt</h3>
            <p>{film.sum}</p>
          </div>
        </div>
      </div>

      <div className="block">
        <h3>Bình luận</h3>
        {t == null ? (
          <EmptyState mood="wow" title="Chưa có bình luận">Phim chưa ra rạp mà.</EmptyState>
        ) : (
          SAMPLE_REVIEWS.map((r, i) => (
            <motion.article
              key={i}
              className="rev"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.7 + i * 0.14, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <header>
                <span className="srcb">{r.src}</span>
                <b>{r.who}</b>
                <span className="num">{r.d}</span>
              </header>
              {r.spoiler ? <Scratch>{r.t}</Scratch> : <p>{r.t}</p>}
            </motion.article>
          ))
        )}
      </div>
      <p className="foot">Dữ liệu phim từ TMDB. Dữ liệu mẫu, mọi điểm và bình luận là giả.</p>
    </>
  );
}

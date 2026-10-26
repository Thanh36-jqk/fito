"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Heart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { DASH, type MovieCard } from "@/lib/movie";
import { buzz } from "@/lib/store";
import { useReducedMotionPref } from "@/lib/useMedia";
import { Poster } from "../film/Poster";
import { ScorePill } from "../film/ScorePill";

type Fling = (want: boolean) => void;

export function subOf(card: MovieCard): string {
  return [card.genres.slice(0, 2).join(" · ") || DASH, card.runtime ? `${card.runtime} phút` : card.year != null ? String(card.year) : null]
    .filter((x) => x != null)
    .join(" · ");
}

function CardFace({ card, top }: { card: MovieCard; top: boolean }) {
  return (
    <>
      <Poster film={card} eager={top} sizes="(min-width: 1024px) 380px, 90vw" />
      <div className="info">
        <span>{subOf(card)}</span>
        <ScorePill film={card} />
      </div>
    </>
  );
}

/* Thẻ trên cùng: kéo nghiêng theo tay, tem hiện dần, thả qua ngưỡng thì bay đi kiểu lò xo. */
function TopCard({ card, flingRef, onDone }: { card: MovieCard; flingRef: React.RefObject<Fling | null>; onDone: (want: boolean) => void }) {
  const router = useRouter();
  const calm = useReducedMotionPref();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const yes = useTransform(x, [20, 110], [0, 1]);
  const no = useTransform(x, [-110, -20], [1, 0]);
  const busy = useRef(false);

  useEffect(() => {
    flingRef.current = (want) => {
      if (busy.current) return;
      busy.current = true;
      buzz(want ? 18 : 8);
      if (calm) return onDone(want);
      animate(x, (want ? 1 : -1) * 560, { type: "spring", stiffness: 260, damping: 26, velocity: x.getVelocity() }).then(() => onDone(want));
    };
    return () => {
      flingRef.current = null;
    };
  }, [flingRef, onDone, x, calm]);

  return (
    <motion.div
      className="card"
      style={{ x, rotate, zIndex: 3 }}
      drag="x"
      dragElastic={0.9}
      dragConstraints={{ left: 0, right: 0 }}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 22 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 700) flingRef.current?.(info.offset.x > 0);
      }}
      onTap={() => !busy.current && router.push(`/phim/${card.id}`, { scroll: false })}
      initial={{ scale: 0.95, y: 12 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <CardFace card={card} top />
      <motion.span className="st st-yes" style={{ opacity: yes }}>CHỐT ĐƠN</motion.span>
      <motion.span className="st st-no" style={{ opacity: no }}>THÔI NÉ</motion.span>
    </motion.div>
  );
}

const BACK = [
  { y: 12, scale: 0.95, rotate: 2 },
  { y: 22, scale: 0.9, rotate: -3 },
];

export function Deck({ cards, onSwipe }: { cards: MovieCard[]; onSwipe: (card: MovieCard, want: boolean) => void }) {
  const flingRef = useRef<Fling | null>(null);
  const top = cards[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector(".layer, .mo")) return; // đang có sheet / màn trùng gu
      if (e.key === "ArrowRight") flingRef.current?.(true);
      if (e.key === "ArrowLeft") flingRef.current?.(false);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  if (!top) return null;

  return (
    <>
      <div className="deck">
        {cards.slice(1, 3).map((c, i) => (
          <motion.div key={c.id} className="card" style={{ zIndex: 2 - i }} animate={BACK[i]} transition={{ type: "spring", stiffness: 300, damping: 26 }} aria-hidden>
            <CardFace card={c} top={false} />
          </motion.div>
        ))}
        <TopCard key={top.id} card={top} flingRef={flingRef} onDone={(want) => onSwipe(top, want)} />
      </div>
      <div className="deck-btns">
        <button type="button" className="round no" aria-label="Thôi né" onClick={() => flingRef.current?.(false)}>
          <X className="size-[30px]" strokeWidth={2.8} aria-hidden />
        </button>
        <button type="button" className="round yes" aria-label="Chốt đơn" onClick={() => flingRef.current?.(true)}>
          <Heart className="size-[30px]" strokeWidth={2.8} fill="currentColor" aria-hidden />
        </button>
      </div>
      <p className="hint">kéo thẻ sang phải để chốt, sang trái để né · bàn phím: ← →</p>
    </>
  );
}

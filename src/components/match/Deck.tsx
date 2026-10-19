"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Heart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { buzz, itemOf, useFito, type SwipeItem } from "@/lib/store";
import { useReducedMotionPref } from "@/lib/useMedia";
import { EmptyState } from "../EmptyState";
import { Poster } from "../film/Poster";
import { ScorePill } from "../film/ScorePill";

type Fling = (want: boolean) => void;

function CardFace({ item, top }: { item: SwipeItem; top: boolean }) {
  return (
    <>
      <Poster film={item.card} eager={top} sizes="(min-width: 1024px) 380px, 90vw" />
      <div className="info">
        <span>{item.sub}</span>
        <ScorePill film={item.card} />
      </div>
    </>
  );
}

/* Thẻ trên cùng: kéo nghiêng theo tay, tem hiện dần, thả qua ngưỡng thì bay đi kiểu lò xo. */
function TopCard({ item, flingRef, onDone }: { item: SwipeItem; flingRef: React.RefObject<Fling | null>; onDone: (want: boolean) => void }) {
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
      onTap={() => !busy.current && router.push(`/phim/${item.card.id}`, { scroll: false })}
      initial={{ scale: 0.95, y: 12 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <CardFace item={item} top />
      <motion.span className="st st-yes" style={{ opacity: yes }}>CHỐT ĐƠN</motion.span>
      <motion.span className="st st-no" style={{ opacity: no }}>THÔI NÉ</motion.span>
    </motion.div>
  );
}

const BACK = [
  { y: 12, scale: 0.95, rotate: 2 },
  { y: 22, scale: 0.9, rotate: -3 },
];

export function Deck() {
  const { state, dispatch } = useFito();
  const flingRef = useRef<Fling | null>(null);
  const items = state.deck.map((id) => itemOf(state, id)).filter((x): x is SwipeItem => !!x);
  const top = items[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector(".layer, .mo")) return; // đang có sheet / màn trùng gu
      if (e.key === "ArrowRight") flingRef.current?.(true);
      if (e.key === "ArrowLeft") flingRef.current?.(false);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  if (!top)
    return (
      <EmptyState mood="happy" title="Hết phim để quẹt rồi" hand="đợi người ấy quẹt xong nha">
        <button type="button" className="btn btn-ghost mx-auto mt-2" onClick={() => dispatch({ type: "resetDeck" })}>
          Quẹt lại từ đầu (dữ liệu mẫu)
        </button>
      </EmptyState>
    );

  return (
    <>
      <div className="deck">
        {items.slice(1, 3).map((it, i) => (
          <motion.div key={it.card.id} className="card" style={{ zIndex: 2 - i }} animate={BACK[i]} transition={{ type: "spring", stiffness: 300, damping: 26 }} aria-hidden>
            <CardFace item={it} top={false} />
          </motion.div>
        ))}
        <TopCard key={top.card.id} item={top} flingRef={flingRef} onDone={(want) => dispatch({ type: "swipe", id: top.card.id, want })} />
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

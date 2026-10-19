"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { PARTNER } from "@/lib/films";
import { itemOf, useFito } from "@/lib/store";
import { EmptyState } from "../EmptyState";
import { Poster } from "../film/Poster";
import { ScorePill } from "../film/ScorePill";
import { Deck } from "./Deck";

const FILTERS = ["Tất cả", "Rạp", "Ở nhà"] as const;

function MatchList() {
  const { state } = useFito();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Tất cả");
  const list = state.matches
    .flatMap((m) => {
      const item = itemOf(state, m.id);
      return item ? [{ m, item }] : [];
    })
    .filter(({ item }) => f === "Tất cả" || item.place === (f === "Ở nhà" ? "home" : "cinema"))
    .reverse();

  return (
    <>
      <div className="sec-h mt-0 hidden lg:flex">
        <h2>Đã trùng gu</h2>
        <small className="num">{state.matches.length} phim</small>
      </div>
      <div className="chips" role="group" aria-label="Lọc nơi xem">
        {FILTERS.map((x, i) => (
          <button key={x} type="button" className="chip" style={{ "--rot": `${[-1.5, 1, -1][i]}deg` } as React.CSSProperties} aria-pressed={x === f} onClick={() => setF(x)}>
            {x}
          </button>
        ))}
      </div>
      {list.length ? (
        <div className="mlist wide">
          {list.map(({ m, item }) => (
            <motion.div key={m.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Link href={`/phim/${item.card.id}`} scroll={false} className="ticket mrow">
                <Poster film={item.card} bare />
                <div className="mi">
                  <b>{item.card.title}</b>
                  <span>{item.where}</span>
                  <span className="num">trùng gu {m.at}</span>
                </div>
                <div className="seat">
                  GHẾ ĐÔI<em className="num">{m.seat}</em>
                  <ScorePill film={item.card} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState mood="sad" title="Chưa trùng gu phim nào ở mục này" />
      )}
    </>
  );
}

/* Điện thoại: 2 mục Quẹt / Đã trùng gu. Máy tính (từ 1024px): chồng thẻ bên trái, danh sách bên phải. */
export function MatchView() {
  const { state } = useFito();
  const [sub, setSub] = useState<"swipe" | "list">("swipe");

  return (
    <div className="match-grid">
      <div className="seg" role="tablist">
        {(["swipe", "list"] as const).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={sub === k} onClick={() => setSub(k)}>
            {sub === k && <motion.span layoutId="seg-ind" className="ind" transition={{ type: "spring", stiffness: 500, damping: 32 }} />}
            {k === "swipe" ? "Quẹt" : `Đã trùng gu (${state.matches.length})`}
          </button>
        ))}
      </div>
      <div data-pane className={sub !== "swipe" ? "max-lg:hidden" : ""}>
        <div className="presence">
          <span className="ava you">{PARTNER.letter}</span>
          <span>{PARTNER.name} cũng đang quẹt</span>
          <span className="dots" aria-hidden><i /><i /><i /></span>
        </div>
        <Deck />
      </div>
      <div data-pane className={sub !== "list" ? "max-lg:hidden" : ""}>
        <MatchList />
      </div>
    </div>
  );
}

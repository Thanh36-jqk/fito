"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { PARTNER } from "@/lib/films";
import type { Snapshot } from "@/lib/journal";
import { fmtDayMonth, type MovieCard } from "@/lib/movie";
import { totalScore } from "@/lib/score";
import { useFito, type SwipeItem } from "@/lib/store";
import { recordSwipe } from "@/lib/swipes-actions";
import type { MatchEntry } from "@/lib/swipes";
import { useMatchRealtime } from "@/lib/useMatchRealtime";
import { EmptyState } from "../EmptyState";
import { Poster } from "../film/Poster";
import { ScorePill } from "../film/ScorePill";
import { Deck, subOf } from "./Deck";
import { MatchOverlayView } from "./MatchOverlay";

function dedupe(cards: MovieCard[]): MovieCard[] {
  const seen = new Set<number>();
  const out: MovieCard[] = [];
  for (const c of cards) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      out.push(c);
    }
  }
  return out;
}

function snapOfCard(card: MovieCard, place: "cinema" | "home"): Snapshot {
  return {
    id: card.id,
    titleVi: card.title,
    titleEn: card.enTitle,
    imdbId: null,
    year: card.year,
    runtime: card.runtime,
    genres: card.genres,
    posterPath: card.posterPath,
    backdropPath: card.backdropPath,
    scores: card.sc,
    scoreTotal: totalScore(card.sc),
    place,
  };
}

function MatchList({ matches }: { matches: MatchEntry[] }) {
  if (!matches.length) {
    return <EmptyState mood="sad" title="Chưa trùng gu phim nào" hand="quẹt thêm xem có duyên không" />;
  }
  return (
    <>
      <div className="sec-h mt-0 hidden lg:flex">
        <h2>Đã trùng gu</h2>
        <small className="num">{matches.length} phim</small>
      </div>
      <div className="mlist wide">
        {matches.map(({ card, at }) => (
          <motion.div key={card.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Link href={`/phim/${card.id}`} scroll={false} className="ticket mrow">
              <Poster film={card} bare />
              <div className="mi">
                <b>{card.title}</b>
                <span>{subOf(card)}</span>
                <span className="num">trùng gu {fmtDayMonth(at) ?? ""}</span>
              </div>
              <div className="seat">
                CẢ HAI MUỐN
                <ScorePill film={card} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
}

/* Điện thoại: 2 mục Quẹt / Đã trùng gu. Máy tính (từ 1024px): chồng thẻ bên trái, danh sách bên phải. */
export function MatchView({ initialDeck, initialMatches }: { initialDeck: MovieCard[]; initialMatches: MatchEntry[] }) {
  const { state, dispatch, toast } = useFito();
  const { matches, partnerOnline, addMatch, setOnNew } = useMatchRealtime(initialMatches);
  const [sub, setSub] = useState<"swipe" | "list">("swipe");
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [overlay, setOverlay] = useState<SwipeItem | null>(null);

  setOnNew((fresh) => toast(`Trùng gu mới: ${fresh[0].card.title}!`));

  // Deck = phim thật từ server + phim thật do Chọn phim đẩy vào, bỏ phim vừa quẹt.
  const pickerCards = state.deck
    .filter((id) => id > 0)
    .flatMap((id) => (state.cards[id] ? [state.cards[id].card] : []));
  const deckCards = dedupe([...pickerCards, ...initialDeck]).filter((c) => !removed.has(c.id));

  function onSwipe(card: MovieCard, want: boolean) {
    setRemoved((prev) => new Set(prev).add(card.id));
    dispatch({ type: "swipe", id: card.id, want: false }); // gỡ khỏi chồng picker nếu có, không chạy match mock
    const place = state.cards[card.id]?.place === "home" ? "home" : "cinema";
    void recordSwipe(snapOfCard(card, place), want ? "want" : "skip").then((r) => {
      if (r.ok && r.matched) {
        addMatch({ card, at: new Date().toISOString() });
        setOverlay({ card, place, where: "", sub: subOf(card) });
      }
    });
  }

  return (
    <div className="match-grid">
      <div className="seg" role="tablist">
        {(["swipe", "list"] as const).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={sub === k} onClick={() => setSub(k)}>
            {sub === k && <motion.span layoutId="seg-ind" className="ind" transition={{ type: "spring", stiffness: 500, damping: 32 }} />}
            {k === "swipe" ? "Quẹt" : `Đã trùng gu (${matches.length})`}
          </button>
        ))}
      </div>
      <div data-pane className={sub !== "swipe" ? "max-lg:hidden" : ""}>
        <div className="presence">
          <span className="ava you">{PARTNER.letter}</span>
          <span>{partnerOnline ? `${PARTNER.name} cũng đang quẹt` : `${PARTNER.name} chưa online`}</span>
          {partnerOnline && (
            <span className="dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
        {deckCards.length ? (
          <Deck cards={deckCards} onSwipe={onSwipe} />
        ) : (
          <EmptyState mood="happy" title="Hết phim để quẹt rồi" hand="chọn thêm phim hoặc đợi người ấy nha" />
        )}
      </div>
      <div data-pane className={sub !== "list" ? "max-lg:hidden" : ""}>
        <MatchList matches={matches} />
      </div>
      {overlay && (
        <MatchOverlayView id={overlay.card.id} item={overlay} n={matches.length} onClose={() => setOverlay(null)} />
      )}
    </div>
  );
}

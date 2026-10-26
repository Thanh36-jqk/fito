import type { Metadata } from "next";
import { Suspense } from "react";
import { Hello } from "@/components/Hello";
import { MatchView } from "@/components/match/MatchView";
import { getMatches, getSwipeDeck } from "@/lib/swipes";

export const metadata: Metadata = { title: "Match" };

export default function MatchPage() {
  return (
    <section>
      <Hello lead="Quẹt cho" highlight="trùng gu" />
      <p className="hint mb-0">Quẹt phim thật. Cả hai cùng chốt một phim là trùng gu.</p>
      <Suspense fallback={<p className="text-muted">Đang xếp chồng quẹt…</p>}>
        <MatchLoader />
      </Suspense>
    </section>
  );
}

async function MatchLoader() {
  const [deck, matches] = await Promise.all([getSwipeDeck(), getMatches()]);
  return <MatchView initialDeck={deck} initialMatches={matches} />;
}

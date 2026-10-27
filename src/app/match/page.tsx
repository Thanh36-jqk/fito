import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Hello } from "@/components/Hello";
import { MatchView } from "@/components/match/MatchView";
import { Skeleton } from "@/components/Skeleton";
import { getMatches, getSwipeDeck } from "@/lib/swipes";

export const metadata: Metadata = { title: "Match" };

export default function MatchPage() {
  return (
    <section>
      <Hello lead="Quẹt cho" highlight="trùng gu" />
      <p className="hint mb-0">Quẹt phim thật. Cả hai cùng chốt một phim là trùng gu.</p>
      <Suspense fallback={<Skeleton style={{ height: 520, maxWidth: 380, margin: "18px auto 0", borderRadius: 24 }} />}>
        <MatchLoader />
      </Suspense>
    </section>
  );
}

async function MatchLoader() {
  await connection(); // đọc TMDB/Supabase ở request-time, không prefill lúc build
  const [deck, matches] = await Promise.all([getSwipeDeck(), getMatches()]);
  return <MatchView initialDeck={deck} initialMatches={matches} />;
}

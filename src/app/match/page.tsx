import type { Metadata } from "next";
import { Hello } from "@/components/Hello";
import { MatchView } from "@/components/match/MatchView";

export const metadata: Metadata = { title: "Match" };

export default function MatchPage() {
  return (
    <section>
      <Hello lead="Quẹt cho" highlight="trùng gu" />
      <MatchView />
    </section>
  );
}

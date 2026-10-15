import type { Metadata } from "next";
import { Hello } from "@/components/Hello";
import { MatchView } from "@/components/match/MatchView";

export const metadata: Metadata = { title: "Match" };

export default function MatchPage() {
  return (
    <section>
      <Hello lead="Quẹt cho" highlight="trùng gu" />
      {/* Quẹt / Match vẫn dùng phim mẫu: báo rõ để không lẫn với dữ liệu thật */}
      <p className="hint mb-0">Dữ liệu mẫu, điểm là giả</p>
      <MatchView />
    </section>
  );
}

import type { Metadata } from "next";
import { Hello } from "@/components/Hello";
import { MatchView } from "@/components/match/MatchView";

export const metadata: Metadata = { title: "Match" };

export default function MatchPage() {
  return (
    <section>
      <Hello lead="Quẹt cho" highlight="trùng gu" />
      {/* Chồng quẹt trộn phim mẫu và phim thật: báo rõ để không lẫn */}
      <p className="hint mb-0">Phim mẫu có điểm giả. Phim cậu đưa từ Chọn phim là phim thật.</p>
      <MatchView />
    </section>
  );
}

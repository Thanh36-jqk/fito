import type { Metadata } from "next";
import { Hello } from "@/components/Hello";
import { PickCta } from "@/components/film/PickCta";
import { TicketCard } from "@/components/film/TicketCard";
import { FILMS } from "@/lib/films";

export const metadata: Metadata = { title: "Ở nhà" };

export default function ONhaPage() {
  const home = FILMS.filter((f) => f.when === "home");
  return (
    <section>
      <Hello lead="Ở nhà thì" highlight="xem gì?" />
      <PickCta where="home" title="Lọc phim trên mạng" sub="Chọn thể loại, độ dài, nền tảng hai đứa đang dùng." />
      <div className="sec-h">
        <h2>Có trên mạng</h2>
        <small>dữ liệu JustWatch</small>
      </div>
      <div className="grid-tickets">
        {home.map((f) => (
          <TicketCard key={f.id} film={f} />
        ))}
      </div>
      <p className="foot">Dữ liệu mẫu, phim và điểm là giả.</p>
    </section>
  );
}

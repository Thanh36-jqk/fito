import Link from "next/link";
import type { Film } from "@/lib/films";
import { Poster } from "./Poster";
import { ScorePill } from "./ScorePill";

/* Cuống vé trong lưới: Sắp chiếu (sticker ngày) và Ở nhà (sticker nền tảng). */
export function TicketCard({ film }: { film: Film }) {
  const sticker = film.when === "home" ? film.providers![0] : film.date;
  return (
    <Link href={`/phim/${film.id}`} scroll={false} className="ticket soon">
      <Poster film={film} />
      {sticker && <span className="sticker date num">{sticker}</span>}
      <div className="perf" />
      <b>{film.vi}</b>
      <span>
        {film.genres.join(" · ")} · {film.min} phút
      </span>
      {film.when === "home" && (
        <div className="mt-1.5">
          <ScorePill film={film} />
        </div>
      )}
    </Link>
  );
}

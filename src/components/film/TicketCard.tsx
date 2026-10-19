import Link from "next/link";
import { sampleCard, type Film } from "@/lib/films";
import { DASH, isSampleFilm, type MovieCard } from "@/lib/movie";
import { Poster } from "./Poster";
import { ScorePill } from "./ScorePill";

/* Cuống vé trong lưới: Sắp chiếu (sticker ngày) và Ở nhà (sticker nền tảng). */
export function TicketCard({
  film,
  sticker,
  showScore,
  eager,
}: {
  film: Film | MovieCard;
  sticker?: string | null;
  showScore?: boolean;
  eager?: boolean;
}) {
  const sample = isSampleFilm(film);
  const card = sample ? sampleCard(film) : film;
  const tag = sticker !== undefined ? sticker : sample ? (film.when === "home" ? film.providers![0] : film.date) : null;
  const score = showScore ?? (sample ? film.when === "home" : false);
  const sub = [card.genres.slice(0, 2).join(" · ") || DASH, card.runtime ? `${card.runtime} phút` : null]
    .filter((x) => x != null)
    .join(" · ");
  return (
    <Link href={`/phim/${card.id}`} scroll={false} className="ticket soon">
      <Poster film={film} eager={eager} />
      {tag && <span className="sticker date num">{tag}</span>}
      <div className="perf" />
      <b>{card.title}</b>
      <span>{sub}</span>
      {score && (
        <div className="mt-1.5">
          <ScorePill film={card} />
        </div>
      )}
    </Link>
  );
}

import Image from "next/image";
import { Cake, Cross, MapPin, UserRound } from "lucide-react";
import { fmtDate, tmdbImg, type PersonDetail } from "@/lib/movie";
import { PERSON_FILMS_MAX } from "@/lib/tmdb/pick";
import { EmptyState } from "../EmptyState";
import { TicketCard } from "../film/TicketCard";

/* Trang/sheet một người: ảnh + nghề + ngày sinh/mất + nơi sinh, tiểu sử, lưới phim của họ. */
export function PersonBody({ person }: { person: PersonDetail }) {
  const meta: { icon: typeof Cake; text: string }[] = [];
  if (person.birthday) meta.push({ icon: Cake, text: fmtDate(person.birthday) });
  if (person.deathday) meta.push({ icon: Cross, text: fmtDate(person.deathday) });
  if (person.placeOfBirth) meta.push({ icon: MapPin, text: person.placeOfBirth });

  return (
    <>
      <div className="p-head">
        <span className="ph p-ph">
          {person.profilePath ? (
            <Image src={tmdbImg(person.profilePath, "w500")} alt="" width={132} height={132} sizes="132px" priority />
          ) : (
            <UserRound className="size-14" aria-hidden />
          )}
        </span>
        <div className="min-w-0">
          <h2 id="pTitle">{person.name}</h2>
          {person.originalName && <div className="en">{person.originalName}</div>}
          {person.role && <span className="tag mt-1 inline-block">{person.role}</span>}
          {meta.length > 0 && (
            <ul className="p-meta">
              {meta.map((m) => (
                <li key={m.text}>
                  <m.icon className="size-4" aria-hidden /> {m.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {person.bio && (
        <div className="block">
          <h3>Tiểu sử</h3>
          <p className="p-bio">{person.bio.text}</p>
        </div>
      )}

      <div className="block">
        <div className="sec-h">
          <h3>Phim</h3>
          {person.films.length >= PERSON_FILMS_MAX && <small>{PERSON_FILMS_MAX} phim nổi bật nhất</small>}
        </div>
        {person.films.length === 0 ? (
          <EmptyState mood="wow" title="Chưa có phim">
            TMDB chưa có phim nào cho người này.
          </EmptyState>
        ) : (
          <div className="grid-tickets">
            {person.films.map((f) => (
              <TicketCard key={f.id} film={f} sticker={f.year ? String(f.year) : null} showScore flat />
            ))}
          </div>
        )}
      </div>

      <p className="foot">
        {person.isSample
          ? "Dữ liệu mẫu."
          : "Dữ liệu người và ảnh từ TMDB. Sản phẩm dùng API của TMDB nhưng không được TMDB xác nhận hay chứng nhận."}
      </p>
    </>
  );
}

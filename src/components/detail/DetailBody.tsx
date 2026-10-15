"use client";

import Image from "next/image";
import { animate, motion } from "motion/react";
import { ExternalLink, UserRound } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  DASH,
  displaySubtitle,
  fmtDate,
  fmtDayMonth,
  fmtMoneyUSD,
  tmdbImg,
  type MovieDetail,
  type Person,
  type Provider,
  type ProvidersVN,
} from "@/lib/movie";
import { countedSources, fmt1, fmtVotes, level, MIN_VOTES, SOURCES, STAMP, totalScore } from "@/lib/score";
import { EmptyState } from "../EmptyState";
import { Poster } from "../film/Poster";
import { TicketCard } from "../film/TicketCard";
import { Scratch } from "./Scratch";
import { Trailer } from "./Trailer";

const C = 138.2; // chu vi vòng điểm r=22

const CINEMAS = [
  { name: "CGV", href: "https://www.cgv.vn/" },
  { name: "Lotte", href: "https://www.lottecinemavn.com/" },
  { name: "Galaxy", href: "https://www.galaxycine.vn/" },
];

const PROVIDER_GROUPS: { key: keyof Omit<ProvidersVN, "link">; label: string }[] = [
  { key: "flatrate", label: "Thuê bao" },
  { key: "free", label: "Miễn phí" },
  { key: "ads", label: "Có quảng cáo" },
  { key: "rent", label: "Thuê" },
  { key: "buy", label: "Mua" },
];

const EXT = { target: "_blank", rel: "noopener noreferrer" } as const;

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt1(to);
      return;
    }
    const a = animate(0, to, { duration: 1, delay: 0.2, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => (el.textContent = fmt1(v)) });
    return () => a.stop();
  }, [to]);
  return <span ref={ref}>{fmt1(0)}</span>;
}

function LangBadge() {
  return (
    <span className="lang" title="Bản tiếng Anh">
      EN
    </span>
  );
}

function People({ list }: { list: Person[] }) {
  if (!list.length) return <p>{DASH}</p>;
  return (
    <ul className="people" data-lenis-prevent>
      {list.map((p) => (
        <li key={`${p.id}-${p.role}`} className="person">
          <span className="ph">
            {p.profilePath ? (
              <Image src={tmdbImg(p.profilePath, "w185")} alt="" width={72} height={72} />
            ) : (
              <UserRound className="size-8" aria-hidden />
            )}
          </span>
          <b>{p.name}</b>
          {p.role && <span>{p.role}</span>}
        </li>
      ))}
    </ul>
  );
}

function Where({ film }: { film: MovieDetail }) {
  const pv = film.providersVN;
  const day = fmtDayMonth(film.vnRelease ?? film.releaseDate);
  return (
    <div className="block">
      <h3>Xem ở đâu</h3>
      {film.cinema && (
        <>
          <div className="where">
            <span className="tag">{film.cinema === "now" ? "Đang chiếu ngoài rạp" : day ? `Ra rạp ${day}` : "Sắp ra rạp"}</span>
          </div>
          <p className="pv-label">Xem lịch chiếu ở</p>
          <div className="where">
            {CINEMAS.map((c) => (
              <a key={c.name} className="tag" href={c.href} {...EXT}>
                {c.name}
              </a>
            ))}
          </div>
          <p className="src">Lịch theo TMDB, có thể lệch với rạp thật</p>
        </>
      )}
      {pv ? (
        <>
          {PROVIDER_GROUPS.filter((g) => pv[g.key].length).map((g) => (
            <div key={g.key} className="pv-group">
              <p className="pv-label">{g.label}</p>
              <div className="where">
                {pv[g.key].map((p: Provider) => (
                  <span key={`${p.id}-${p.name}`} className="tag">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {pv.link && (
            <a className="d-link" href={pv.link} {...EXT}>
              Xem trên JustWatch <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
        </>
      ) : (
        <p>Chưa thấy trên nền tảng nào ở VN</p>
      )}
      <p className="src">Dữ liệu nơi xem: JustWatch</p>
    </div>
  );
}

function Summary({ film }: { film: MovieDetail }) {
  const o = film.overview;
  return (
    <div className="block">
      <h3>
        Tóm tắt {o?.lang === "en" && <LangBadge />}
      </h3>
      <p>{o ? o.text : DASH}</p>
      {o?.lang === "en" && <p className="src">Chưa có bản tiếng Việt, đang hiện bản tiếng Anh.</p>}
    </div>
  );
}

function Facts({ film }: { film: MovieDetail }) {
  const rows: [string, React.ReactNode][] = [
    ["Tên gốc", film.originalTitle || DASH],
    ["Tên tiếng Anh", film.enTitle ?? DASH],
    ["Khởi chiếu", fmtDate(film.releaseDate)],
    ["Ra rạp ở VN", fmtDate(film.vnRelease)],
    ["Độ dài", film.runtime ? `${film.runtime} phút` : DASH],
    ["Nước", film.countries.join(", ") || DASH],
    ["Ngôn ngữ", film.languages.join(", ") || DASH],
    ["Độ tuổi", film.certification ? `${film.certification.value} (${film.certification.country})` : DASH],
    ["Bộ sưu tập", film.collection ?? DASH],
    ["Kinh phí", fmtMoneyUSD(film.budget)],
    ["Doanh thu", fmtMoneyUSD(film.revenue)],
    ["Từ khoá", film.keywords.slice(0, 8).join(", ") || DASH],
    [
      "IMDb",
      film.imdbId ? (
        <a className="d-link" href={`https://www.imdb.com/title/${film.imdbId}/`} {...EXT}>
          {film.imdbId} <ExternalLink className="size-3.5" aria-hidden />
        </a>
      ) : (
        DASH
      ),
    ],
  ];
  return (
    <div className="block">
      <h3>Thông tin</h3>
      <dl className="facts">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function DetailBody({ film }: { film: MovieDetail }) {
  const hero = useRef<HTMLDivElement>(null);
  const t = totalScore(film.sc);
  const lv = level(t);
  const nCount = countedSources(film.sc).length;
  const c1 = film.sample?.c1 ?? "var(--surface-2)";
  const c2 = film.sample?.c2 ?? "var(--accent-2)";
  const sub = displaySubtitle(film);

  // Đổi phim ngay trong sheet (bấm phim tương tự) thì cuộn về đầu.
  useEffect(() => {
    hero.current?.closest(".sheet-scroll")?.scrollTo({ top: 0 });
  }, [film.id]);

  return (
    <>
      <div
        ref={hero}
        className={`d-hero ${film.backdropPath ? "has-bd" : ""}`}
        style={{ "--c1": c1, "--c2": c2 } as React.CSSProperties}
      >
        {film.backdropPath && (
          <Image className="d-bd" fill alt="" loading="eager" src={tmdbImg(film.backdropPath, "w1280")} sizes="(min-width: 768px) 760px, 100vw" />
        )}
        <Poster film={film} size="w780" sizes="(min-width: 768px) 170px, 118px" preload />
        <div className="min-w-0">
          <h2 id="dTitle">
            {film.logoPath ? (
              <>
                <span className="sr-only">{film.title}</span>
                <span className="d-logo">
                  <Image fill alt="" src={tmdbImg(film.logoPath, "w500")} sizes="320px" />
                </span>
              </>
            ) : (
              film.title
            )}
          </h2>
          <div className="en">
            {sub.length > 0 && `${sub.join(" · ")} · `}
            <span className="num">
              {film.year ?? DASH} · {film.runtime ? `${film.runtime} phút` : DASH}
            </span>
          </div>
          {film.tagline && (
            <p className="d-tag">
              “{film.tagline.text}”{film.tagline.lang === "en" && <LangBadge />}
            </p>
          )}
          <div className="tags">
            {film.genres.map((g) => (
              <span key={g} className="tag">
                {g}
              </span>
            ))}
            {film.certification && (
              <span className="tag" title={`Phân loại ở ${film.certification.country}`}>
                {film.certification.value}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="d-top">
        <div className="ticket total">
          <div className="big num">
            {t == null ? DASH : <CountUp to={t} />}
            <small>/10</small>
          </div>
          <div className="meta">
            <motion.span
              className={`stamp lv-${lv}`}
              initial={{ scale: 2.4, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.55 }}
            >
              {STAMP[lv]}
            </motion.span>
            <br />
            {t == null ? "Chưa nguồn nào đủ điểm" : `Trung bình ${nCount} nguồn có điểm`}
          </div>
        </div>

        <div className="rings">
          {SOURCES.map(({ key, label, div }, i) => {
            const s = film.sc[key];
            const has = !!s && s.v != null;
            const norm = has ? s.v / div : 0;
            const shown = !has ? DASH : key === "rt" ? s.v + "%" : key === "mc" ? s.v : fmt1(s.v);
            const sub =
              !has ? "chưa có" : s.votes != null ? (s.votes < MIN_VOTES ? "ít lượt, không tính" : fmtVotes(s.votes)) : "nhà phê bình";
            const color = has ? `var(--${level(norm)})` : "var(--muted)";
            return (
              <div key={key} className="score-ring">
                <svg viewBox="0 0 58 58" aria-hidden>
                  <circle className="bgc" cx="29" cy="29" r="22" />
                  <motion.circle
                    cx="29" cy="29" r="22" stroke={color} strokeLinecap="round" strokeDasharray={C}
                    initial={{ strokeDashoffset: C }}
                    animate={{ strokeDashoffset: C * (1 - norm / 10) }}
                    transition={{ duration: 1, delay: 0.15 + i * 0.09, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </svg>
                <div className="rv num">{shown}</div>
                <b>{label}</b>
                <span className="num">{sub}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="d-cols">
        {film.trailer ? (
          <>
            <div className="block">
              <h3>Trailer</h3>
              <Trailer key={film.id} trailer={film.trailer} title={film.title} backdropPath={film.backdropPath} c1={c1} c2={c2} />
            </div>
            <div>
              <Where film={film} />
              <Summary film={film} />
            </div>
          </>
        ) : (
          <>
            <Where film={film} />
            <Summary film={film} />
          </>
        )}
      </div>

      <Facts film={film} />
      <div className="block">
        <h3>Diễn viên</h3>
        <People list={film.cast} />
      </div>
      <div className="block">
        <h3>Ekip</h3>
        <People list={film.crew} />
      </div>

      <div className="block">
        <h3>Bình luận</h3>
        {film.reviews.length === 0 ? (
          <EmptyState mood="wow" title="Chưa có bình luận">
            {film.isSample ? "Phim chưa ra rạp mà." : "TMDB chưa có bình luận cho phim này. Trakt sẽ nối ở bản sau."}
          </EmptyState>
        ) : (
          film.reviews.map((r, i) => (
            <motion.article
              key={r.id}
              className="rev"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.7 + i * 0.14, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <header>
                <span className="srcb">{r.src}</span>
                <b>{r.author}</b>
                <span className="num">{fmtDate(r.date)}</span>
                {r.rating != null && <span className="num">{r.rating}/10</span>}
              </header>
              {r.spoiler ? <Scratch>{r.text}</Scratch> : <p style={{ whiteSpace: "pre-line" }}>{r.text}</p>}
              {r.url && (
                <a className="d-link mt-2" href={r.url} {...EXT}>
                  Đọc đầy đủ trên {r.src} <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
            </motion.article>
          ))
        )}
      </div>

      {film.similar.length > 0 && (
        <div className="block">
          <h3>Phim tương tự</h3>
          <div className="rail" data-lenis-prevent>
            {film.similar.map((m) => (
              <TicketCard key={m.id} film={m} showScore />
            ))}
          </div>
        </div>
      )}
      {film.recommendations.length > 0 && (
        <div className="block">
          <h3>Có thể cậu cũng thích</h3>
          <div className="rail" data-lenis-prevent>
            {film.recommendations.map((m) => (
              <TicketCard key={m.id} film={m} showScore />
            ))}
          </div>
        </div>
      )}

      <p className="foot">
        {film.isSample
          ? "Dữ liệu mẫu, mọi điểm và bình luận là giả."
          : "Dữ liệu phim, ảnh và trailer từ TMDB. Nơi xem từ JustWatch. Điểm IMDb, RT, MC, Trakt chưa nối nên hiện “—”. Sản phẩm dùng API của TMDB nhưng không được TMDB xác nhận hay chứng nhận."}
      </p>
    </>
  );
}

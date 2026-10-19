"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronLeft, Pickaxe, Ticket, Tv, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEFAULT_FILTERS,
  GENRE_CHIPS,
  LENS,
  MINS,
  SORTS,
  WHERE_LABEL,
  effectiveSort,
  filterLabels,
  fmtTotal,
  type Filters,
  type Place,
} from "@/lib/discover";
import { DASH, GENRE_VI, fmtDayMonth } from "@/lib/movie";
import { useFito } from "@/lib/store";
import { useMedia } from "@/lib/useMedia";
import { EmptyState } from "../EmptyState";
import { ChipGroup, DeepFilters } from "../filters/Chips";
import { Poster } from "../film/Poster";
import { ScorePill } from "../film/ScorePill";
import { useMovies } from "./useMovies";

const WHERE_SUB: Record<Place, string> = {
  cinema: "Phim đang chiếu ngoài rạp ở VN, theo TMDB",
  home: "Cả kho phim TMDB, lọc theo gu hai đứa",
};
const CINEMA: Filters = { ...DEFAULT_FILTERS, where: "cinema" };
const HOME: Filters = { ...DEFAULT_FILTERS, where: "home" };

/* Dòng báo lỗi nhỏ ở bước 0–1, bấm Thử lại thì gọi lại /api/discover. */
function ErrLine({ retry }: { retry: () => void }) {
  return (
    <div className="pk-err" role="alert">
      <span>TMDB đang trục trặc, chưa đếm được phim.</span>
      <button type="button" className="btn btn-ghost" onClick={retry}>Thử lại</button>
    </div>
  );
}

/* Luồng chọn phim trên TMDB: nơi xem → thể loại → thêm tiêu chí → list. Mở từ nút "Chưa biết xem gì?". */
export function Picker() {
  const { picker } = useFito();
  return <AnimatePresence>{picker.open && <PickerSheet key={picker.key} start={picker.where} />}</AnimatePresence>;
}

function PickerSheet({ start }: { start?: Place }) {
  const { closePicker, dispatch, toast } = useFito();
  const router = useRouter();
  const wide = useMedia("(min-width: 768px)");
  const [step, setStep] = useState(start ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [f, setF] = useState<Filters>({ ...DEFAULT_FILTERS, where: start ?? "cinema", sort: "score" });
  const [deep, setDeep] = useState<boolean | null>(null); // null = tự mở nếu đã có tiêu chí Đào sâu
  const set = (p: Partial<Filters>) => setF((x) => ({ ...x, ...p }));

  // danh sách rạp gốc: đếm ở bước 0, lọc thể loại tại chỗ ở bước 1
  const cinema = useMovies(CINEMA);
  const home = useMovies(step === 0 ? HOME : null);
  const localGenres = step === 1 && f.where === "cinema";
  const live = useMovies(step >= 1 && !localGenres ? f : null, { debounce: step === 3 ? 0 : 300 });

  useEffect(() => {
    // Esc chỉ đóng Chọn phim khi không có trang chi tiết đang mở đè lên
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.querySelector(".layer:not([data-picker])") && closePicker();
    addEventListener("keydown", onKey);
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      root.style.overflow = prev;
    };
  }, [closePicker]);

  const go = (s: number) => {
    setDir(s > step ? 1 : -1);
    setStep(s);
  };
  // số phim ở chân bước 1–2; null = đang tải hoặc lỗi
  const liveN = live.data?.total ?? null;
  const countText = (loading: boolean, n: number | null) => (loading ? "…" : n == null ? DASH : fmtTotal(n));

  let body: React.ReactNode;
  let foot: React.ReactNode;

  if (step === 0) {
    body = (
      <>
        <h2 className="pk-q">Hôm nay xem ở đâu?</h2>
        <p className="pk-sub">Chọn một cái, Bắp lọc tiếp cho.</p>
        <div className="pk-opts">
          {(["cinema", "home"] as Place[]).map((k) => {
            const r = k === "cinema" ? cinema : home;
            const Icon = k === "cinema" ? Ticket : Tv;
            return (
              <button
                key={k}
                type="button"
                className="ticket pk-opt"
                onClick={() => {
                  set({ where: k, genres: [], decade: k === "cinema" ? null : f.decade });
                  go(1);
                }}
              >
                <span className="sticker num">{r.loading ? "Đang đếm…" : r.data ? `${fmtTotal(r.data.total)} phim` : DASH}</span>
                <div className="fan">
                  {r.data?.results.slice(0, 3).map((m, i) => (
                    <Poster key={m.id} film={m} bare eager={i === 0} sizes="74px" style={{ left: i * 54, rotate: `${[-8, 2, 10][i]}deg`, zIndex: 3 - i }} />
                  ))}
                </div>
                <div className="perf" />
                <b><Icon className="size-6" aria-hidden />{WHERE_LABEL[k]}</b>
                <span>{WHERE_SUB[k]}</span>
              </button>
            );
          })}
        </div>
        {(cinema.error || home.error) && (
          <ErrLine
            retry={() => {
              if (cinema.error) cinema.retry();
              if (home.error) home.retry();
            }}
          />
        )}
      </>
    );
    foot = <p className="hint m-0">hoặc quẹt thử ở tab Match</p>;
  } else if (step === 1) {
    const list = cinema.data?.results ?? [];
    const has = (genres: string[], id: number) => genres.includes(GENRE_VI[id]);
    // rạp: chỉ hiện thể loại có trong list đang chiếu, kèm số phim; list lỗi thì hiện đủ chip, không số
    const chips = localGenres && !cinema.error
      ? GENRE_CHIPS.map((g) => ({ key: g.id, label: g.label, n: list.filter((m) => has(m.genres, g.id)).length })).filter((g) => g.n > 0)
      : GENRE_CHIPS.map((g) => ({ key: g.id, label: g.label }));
    const loading = localGenres ? cinema.loading : live.loading;
    const n = !localGenres
      ? liveN
      : cinema.data
        ? list.filter((m) => !f.genres.length || f.genres.some((id) => has(m.genres, id))).length
        : null;
    body = (
      <>
        <h2 className="pk-q">Thèm thể loại gì?</h2>
        <p className="pk-sub">{WHERE_LABEL[f.where]} · chọn bao nhiêu cũng được</p>
        <ChipGroup
          title="Thể loại"
          items={[{ key: 0, label: "Gì cũng được" }, ...chips]}
          on={(k) => (k === 0 ? !f.genres.length : f.genres.includes(k))}
          tap={(k) =>
            set({
              genres: k === 0 ? [] : f.genres.includes(k) ? f.genres.filter((x) => x !== k) : [...f.genres, k].sort((a, b) => a - b),
            })
          }
        />
        {localGenres && cinema.error && <ErrLine retry={cinema.retry} />}
      </>
    );
    foot = (
      <button type="button" className="btn btn-main" disabled={n === 0} onClick={() => go(2)}>
        Tiếp <small className="num text-sm opacity-75">· {countText(loading, n)} phim</small>
      </button>
    );
  } else if (step === 2) {
    const open = deep ?? Boolean(f.country || f.lang || f.decade || f.fame !== "any");
    body = (
      <>
        <h2 className="pk-q">Thêm chút nữa nha</h2>
        <p className="pk-sub">Không chắc thì để &quot;Gì cũng được&quot;.</p>
        <ChipGroup title="Độ dài" items={LENS.map(([key, label]) => ({ key, label }))} on={(k) => f.len === k} tap={(len) => set({ len })} />
        <ChipGroup title="Điểm tổng" items={MINS.map(([key, label]) => ({ key, label }))} on={(k) => f.min === k} tap={(min) => set({ min })} />
        <button type="button" className="pk-deep" aria-expanded={open} onClick={() => setDeep(!open)}>
          <Pickaxe className="size-5" aria-hidden />
          Đào sâu
          <ChevronDown className="size-5" aria-hidden />
        </button>
        {open && <DeepFilters f={f} set={set} />}
        <ChipGroup title="Sắp xếp" items={SORTS.map(([key, label]) => ({ key, label }))} on={(k) => k === effectiveSort(f)} tap={(sort) => set({ sort })} />
        {f.where === "home" && (
          <p className="pk-note">
            Kho phim chưa biết nền tảng ở VN. Nền tảng hai đứa dùng thì đánh dấu ở{" "}
            <Link href="/cai-dat" onClick={closePicker}>Cài đặt</Link>.
          </p>
        )}
      </>
    );
    foot = (
      <button type="button" className="btn btn-main" onClick={() => go(3)}>
        {liveN ? `Xem ${fmtTotal(liveN)} phim hợp gu` : "Xem kết quả"}
      </button>
    );
  } else {
    const res = live.data?.results ?? [];
    const sum = (
      <div className="pk-sum">
        {[WHERE_LABEL[f.where], ...filterLabels(f)].map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
    );
    if (live.loading) {
      body = (
        <>
          <h2 className="pk-q">Bắp đang lọc…</h2>
          <div className="mlist">
            {[0, 1, 2].map((i) => <div key={i} className="ticket mrow pk-skel animate-pulse motion-reduce:animate-none" aria-hidden />)}
          </div>
        </>
      );
    } else if (live.error) {
      body = (
        <>
          <h2 className="pk-q">Hụt mất rồi</h2>
          <EmptyState mood="sad" title="TMDB đang trục trặc">Chưa lọc được, thử lại sau nha.</EmptyState>
          <button type="button" className="btn btn-ghost w-full" onClick={live.retry}>Thử lại</button>
        </>
      );
    } else if (!live.data || !res.length) {
      body = (
        <>
          <h2 className="pk-q">Hụt mất rồi</h2>
          {sum}
          <EmptyState mood="sad" title="Không phim nào hợp hết">Thử nới bớt thể loại, điểm hoặc Đào sâu nha.</EmptyState>
        </>
      );
    } else {
      const total = live.data.total;
      body = (
        <>
          <h2 className="pk-q">Bắp lọc được {fmtTotal(total)} phim</h2>
          <p className="pk-sub">{total > res.length ? `Theo TMDB · đang hiện ${res.length} phim đầu` : "Theo TMDB"}</p>
          {sum}
          <div className="mlist">
            {res.map((card, i) => (
              <motion.div key={card.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}>
                <Link href={`/phim/${card.id}`} scroll={false} className="ticket mrow">
                  <Poster film={card} bare eager={i === 0} sizes="72px" />
                  <div className="mi">
                    <b>{card.title}</b>
                    <span>{f.where === "cinema" ? "Đang chiếu ngoài rạp" : card.year ? `Ở nhà · ${card.year}` : "Ở nhà"}</span>
                    <span>{card.genres.join(" · ") || DASH}</span>
                  </div>
                  {/* list rạp chỉ có ngày ra rạp ở VN, không có năm thật */}
                  {f.where === "cinema" ? (
                    <div className="seat rt">RA RẠP<em className="num">{fmtDayMonth(card.releaseDate) ?? DASH}</em><ScorePill film={card} /></div>
                  ) : (
                    <div className="seat rt">NĂM<em className="num">{card.year ?? DASH}</em><ScorePill film={card} /></div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      );
    }
    foot = (
      <div className={`grid gap-2.5 ${res.length ? "grid-cols-[1fr_1.4fr]" : ""}`}>
        <button type="button" className="btn btn-ghost" onClick={() => go(2)}>Đổi tiêu chí</button>
        {res.length > 0 && (
          <button
            type="button"
            className="btn btn-main"
            onClick={() => {
              dispatch({ type: "pushDeck", items: res.map((card) => ({ card, place: f.where })) });
              closePicker();
              router.push("/match");
              toast(`Đã xếp ${res.length} phim lên đầu chồng quẹt`);
            }}
          >
            Quẹt {res.length} phim này
          </button>
        )}
      </div>
    );
  }

  const from = wide ? { opacity: 0, y: 40, scale: 0.96 } : { y: "105%" };
  const to = wide ? { opacity: 1, y: 0, scale: 1 } : { y: 0 };

  return (
    <div className="layer" style={{ zIndex: 45 }} data-picker data-lenis-prevent>
      <motion.div className="scrim" onClick={closePicker} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        className="sheet"
        style={{ "--sheet-w": "620px" } as React.CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label="Chọn phim"
        initial={from}
        animate={to}
        exit={from}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
      >
        <span className="grab" />
        <div className="pk-head">
          <button type="button" className="icon-btn" aria-label="Quay lại" disabled={step === 0} onClick={() => go(step - 1)}>
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <div className="pk-dots" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <motion.i
                key={i}
                animate={{ width: i === step ? 26 : 8, backgroundColor: i === step ? "var(--accent)" : i < step ? "var(--accent-2)" : "var(--line)" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            ))}
          </div>
          <button type="button" className="icon-btn" aria-label="Đóng" onClick={closePicker}>
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <div className="sheet-scroll overflow-x-hidden">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {body}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="actions !grid-cols-1">{foot}</div>
      </motion.div>
    </div>
  );
}

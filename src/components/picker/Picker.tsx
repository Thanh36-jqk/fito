"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, Ticket, Tv, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FILMS, whereLabel } from "@/lib/films";
import { fmt1 } from "@/lib/score";
import { useFito, type PickWhere } from "@/lib/store";
import { useMedia } from "@/lib/useMedia";
import { EmptyState } from "../EmptyState";
import { Poster } from "../film/Poster";
import { ScorePill } from "../film/ScorePill";
import { LENS, MINS, SORTS, WHERE, okGenre, pool, results, type Criteria } from "./pick";

const ROT = [-1.5, 1, -1, 1.5];

function Chips<T>({ title, items, on, tap }: {
  title: string;
  items: { key: T; label: string; n?: number; dis?: boolean }[];
  on: (k: T) => boolean;
  tap: (k: T) => void;
}) {
  return (
    <div className="pk-g">
      <h4>{title}</h4>
      <div className="pk-chips">
        {items.map((it, i) => (
          <button
            key={String(it.key)}
            type="button"
            className="chip"
            style={{ "--rot": `${ROT[i % 4]}deg` } as React.CSSProperties}
            aria-pressed={on(it.key)}
            disabled={it.dis}
            onClick={() => tap(it.key)}
          >
            {it.label}
            {it.n != null && <small className="num">{it.n}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Luồng chọn phim: nơi xem → thể loại → thêm tiêu chí → list. Mở từ nút "Chưa biết xem gì?". */
export function Picker() {
  const { picker } = useFito();
  return <AnimatePresence>{picker.open && <PickerSheet key={picker.key} start={picker.where} />}</AnimatePresence>;
}

function PickerSheet({ start }: { start?: PickWhere }) {
  const { closePicker, dispatch, toast } = useFito();
  const router = useRouter();
  const wide = useMedia("(min-width: 768px)");
  const [step, setStep] = useState(start ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [c, setC] = useState<Criteria>({ where: start ?? "cinema", genres: [], len: "any", min: 0, plats: [], sort: "score" });

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
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const p = pool(c.where);
  const res = results(c);

  let body: React.ReactNode;
  let foot: React.ReactNode;

  if (step === 0) {
    body = (
      <>
        <h2 className="pk-q">Hôm nay xem ở đâu?</h2>
        <p className="pk-sub">Chọn một cái, Bắp lọc tiếp cho.</p>
        <div className="pk-opts">
          {(Object.keys(WHERE) as PickWhere[]).map((k) => {
            const list = FILMS.filter(WHERE[k].ok);
            const Icon = k === "cinema" ? Ticket : Tv;
            return (
              <button key={k} type="button" className="ticket pk-opt" onClick={() => { setC({ ...c, where: k, genres: [], plats: [] }); go(1); }}>
                <span className="sticker num">{list.length} phim</span>
                <div className="fan">
                  {list.slice(0, 3).map((f, i) => (
                    <Poster key={f.id} film={f} bare style={{ left: i * 54, rotate: `${[-8, 2, 10][i]}deg`, zIndex: 3 - i }} />
                  ))}
                </div>
                <div className="perf" />
                <b><Icon className="size-6" aria-hidden />{WHERE[k].label}</b>
                <span>{WHERE[k].sub}</span>
              </button>
            );
          })}
        </div>
      </>
    );
    foot = <p className="hint m-0">hoặc quẹt thử ở tab Match</p>;
  } else if (step === 1) {
    const genres = [...new Set(p.flatMap((f) => f.genres))];
    const n = p.filter(okGenre(c)).length;
    body = (
      <>
        <h2 className="pk-q">Thèm thể loại gì?</h2>
        <p className="pk-sub">{WHERE[c.where].label} · chọn bao nhiêu cũng được</p>
        <Chips
          title="Thể loại"
          items={[{ key: "*", label: "Gì cũng được" }, ...genres.map((g) => ({ key: g, label: g, n: p.filter((f) => f.genres.includes(g)).length }))]}
          on={(k) => (k === "*" ? !c.genres.length : c.genres.includes(k))}
          tap={(k) => setC({ ...c, genres: k === "*" ? [] : toggle(c.genres, k) })}
        />
      </>
    );
    foot = (
      <button type="button" className="btn btn-main" disabled={!n} onClick={() => go(2)}>
        Tiếp <small className="num text-sm opacity-75">· {n} phim</small>
      </button>
    );
  } else if (step === 2) {
    const plats = [...new Set(p.flatMap((f) => f.providers ?? []))];
    const byGenre = p.filter(okGenre(c));
    body = (
      <>
        <h2 className="pk-q">Thêm chút nữa nha</h2>
        <p className="pk-sub">Không chắc thì để &quot;Gì cũng được&quot;.</p>
        <Chips title="Độ dài" items={LENS.map(([key, label]) => ({ key, label }))} on={(k) => c.len === k} tap={(len) => setC({ ...c, len })} />
        <Chips title="Điểm tổng" items={MINS.map(([key, label]) => ({ key, label }))} on={(k) => c.min === k} tap={(min) => setC({ ...c, min })} />
        {c.where === "home" && (
          <Chips
            title="Nền tảng hai đứa có"
            items={plats.map((pl) => {
              const n = byGenre.filter((f) => f.providers!.includes(pl)).length;
              return { key: pl, label: pl, n, dis: !n && !c.plats.includes(pl) };
            })}
            on={(k) => c.plats.includes(k)}
            tap={(k) => setC({ ...c, plats: toggle(c.plats, k) })}
          />
        )}
        <Chips title="Sắp xếp" items={SORTS.map(([key, label]) => ({ key, label }))} on={(k) => c.sort === k} tap={(sort) => setC({ ...c, sort })} />
      </>
    );
    foot = (
      <button type="button" className="btn btn-main" onClick={() => go(3)}>
        {res.length ? `Xem ${res.length} phim hợp gu` : "Xem kết quả"}
      </button>
    );
  } else {
    const tags = [
      WHERE[c.where].label,
      ...(c.genres.length ? c.genres : ["Mọi thể loại"]),
      ...(c.len !== "any" ? [LENS.find((l) => l[0] === c.len)![1]] : []),
      ...(c.min ? ["Điểm ≥ " + fmt1(c.min)] : []),
      ...c.plats,
    ];
    body = (
      <>
        <h2 className="pk-q">{res.length ? `Bắp lọc được ${res.length} phim` : "Hụt mất rồi"}</h2>
        <div className="pk-sum">{tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
        {res.length ? (
          <div className="mlist">
            {res.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}>
                <Link href={`/phim/${f.id}`} scroll={false} className="ticket mrow">
                  <Poster film={f} bare />
                  <div className="mi">
                    <b>{f.vi}</b>
                    <span>{whereLabel(f)}</span>
                    <span>{f.genres.join(" · ")}</span>
                  </div>
                  <div className="seat rt">PHÚT<em className="num">{f.min}</em><ScorePill film={f} /></div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState mood="sad" title="Không phim nào hợp hết">Thử nới bớt thể loại hoặc điểm nha.</EmptyState>
        )}
      </>
    );
    foot = (
      <div className={`grid gap-2.5 ${res.length ? "grid-cols-[1fr_1.4fr]" : ""}`}>
        <button type="button" className="btn btn-ghost" onClick={() => go(2)}>Đổi tiêu chí</button>
        {res.length > 0 && (
          <button
            type="button"
            className="btn btn-main"
            onClick={() => {
              dispatch({ type: "pushDeck", ids: res.map((f) => f.id) });
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

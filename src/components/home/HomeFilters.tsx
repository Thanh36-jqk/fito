"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, SlidersHorizontal } from "lucide-react";
import { ChipGroup, DeepFilters } from "@/components/filters/Chips";
import {
  DEFAULT_FILTERS,
  GENRE_CHIPS,
  LENS,
  MINS,
  SORTS,
  effectiveSort,
  filterLabels,
  parseFilters,
  toSearch,
  type Filters,
} from "@/lib/discover";
import { GENRE_VI } from "@/lib/movie";
import { useMedia } from "@/lib/useMedia";

const ROT = [-2, 1.5, -1, 2, -1.5, 1, -2];
const QUICK = [28, 35, 27, 10749, 16, 878];

/* Bật/tắt một thể loại, giữ mảng tăng dần. */
const toggleGenre = (genres: number[], id: number) =>
  genres.includes(id) ? genres.filter((g) => g !== id) : [...genres, id].sort((a, b) => a - b);

/* Số bộ lọc nâng cao đang bật (ngoài thể loại). */
function deepCount(f: Filters) {
  return [f.len !== "any", f.min > 0, f.country, f.lang, f.decade, f.fame !== "any", f.sort].filter(Boolean).length;
}

type Quick = { key: string; label: string; on: boolean; tap: () => void };

function QuickChips({ items, disabled }: { items: Quick[]; disabled?: boolean }) {
  return (
    <div className="chips home-chips" role="group" aria-label="Lọc nhanh">
      {items.map((c, i) => (
        <button
          key={c.key}
          type="button"
          className="chip"
          style={{ "--rot": `${ROT[i % ROT.length]}deg` } as React.CSSProperties}
          aria-pressed={c.on}
          disabled={disabled}
          onClick={c.tap}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function quickItems(f: Filters, apply: (next: Filters) => void): Quick[] {
  return [
    { key: "all", label: "Tất cả", on: toSearch(f) === "", tap: () => apply(DEFAULT_FILTERS) },
    ...QUICK.map((id) => ({
      key: String(id),
      label: GENRE_VI[id],
      on: f.genres.includes(id),
      tap: () => apply({ ...f, genres: toggleGenre(f.genres, id) }),
    })),
    {
      key: "hidden",
      label: "Ít người biết",
      on: f.fame === "hidden",
      tap: () => apply({ ...f, fame: f.fame === "hidden" ? "any" : "hidden" }),
    },
  ];
}

/* Bộ lọc Ở nhà nằm trên URL: đổi chip là router.replace, server vẽ lại trang 1. */
export function HomeFilters() {
  const router = useRouter();
  const f = parseFilters(useSearchParams(), "home");
  const [pending, startTransition] = useTransition();
  const n = deepCount(f);
  // Máy tính: mở sẵn nếu URL đã có bộ lọc nâng cao. Điện thoại: đóng để lưới phim không bị đẩy xuống xa
  const wide = useMedia("(min-width: 1024px)");
  const [picked, setOpen] = useState<boolean | null>(null);
  const open = picked ?? (wide && n > 0);
  const qsNow = toSearch(f);

  function apply(next: Filters) {
    const qs = toSearch(next);
    startTransition(() => router.replace(qs ? `/o-nha?${qs}` : "/o-nha", { scroll: false }));
  }

  return (
    <>
      <QuickChips items={quickItems(f, apply)} />
      <div className="home-tools">
        <button
          type="button"
          className="btn btn-ghost home-deep-btn"
          aria-expanded={open}
          aria-controls="home-deep"
          onClick={() => setOpen(!open)}
        >
          <SlidersHorizontal className="size-5" aria-hidden />
          Đào sâu
          {n > 0 && <small className="num">{n}</small>}
        </button>
        {pending && (
          <span className="home-pending" role="status">
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            Đang lọc…
          </span>
        )}
        {qsNow !== "" && (
          <button type="button" className="home-clear" onClick={() => apply(DEFAULT_FILTERS)}>
            Xoá bộ lọc
          </button>
        )}
      </div>

      {open && (
        <div id="home-deep" className="ticket home-deep">
          <ChipGroup
            title="Thể loại"
            items={[{ key: 0, label: "Gì cũng được" }, ...GENRE_CHIPS.map((g) => ({ key: g.id, label: g.label }))]}
            on={(k) => (k === 0 ? !f.genres.length : f.genres.includes(k))}
            tap={(k) => apply({ ...f, genres: k === 0 ? [] : toggleGenre(f.genres, k) })}
          />
          <ChipGroup
            title="Độ dài"
            items={LENS.map(([key, label]) => ({ key, label }))}
            on={(k) => f.len === k}
            tap={(len) => apply({ ...f, len })}
          />
          <ChipGroup
            title="Điểm tổng"
            items={MINS.map(([key, label]) => ({ key, label }))}
            on={(k) => f.min === k}
            tap={(min) => apply({ ...f, min })}
          />
          <DeepFilters f={f} set={(p) => apply({ ...f, ...p })} />
          <ChipGroup
            title="Sắp xếp"
            items={SORTS.map(([key, label]) => ({ key, label }))}
            on={(k) => k === effectiveSort(f)}
            tap={(sort) => apply({ ...f, sort })}
          />
        </div>
      )}

      {qsNow !== "" && (
        <div className="pk-sum">
          {filterLabels(f).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* Khung chờ khi chưa đọc được URL: hàng chip mặc định, khoá bấm. */
export function HomeFiltersShell() {
  return <QuickChips items={quickItems(DEFAULT_FILTERS, () => {})} disabled />;
}

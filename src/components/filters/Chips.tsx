"use client";

// Nhóm chip dùng chung cho Chọn phim và Ở nhà (markup giống bản mẫu: .pk-g > h4 + .pk-chips).
import { COUNTRIES, DECADES, FAMES, LANGUAGES, type Filters } from "@/lib/discover";

export type ChipItem<T> = { key: T; label: string; n?: number; dis?: boolean };

const ROT = [-1.5, 1, -1, 1.5];
const ANY = "Gì cũng được";

export function ChipGroup<T>({ title, items, on, tap }: {
  title: string;
  items: ChipItem<T>[];
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

/* "Đào sâu": các nhóm chọn một. Thập niên chỉ có khi xem ở nhà. */
export function DeepFilters({ f, set }: { f: Filters; set: (patch: Partial<Filters>) => void }) {
  return (
    <>
      <ChipGroup<string | null>
        title="Quốc gia"
        items={[{ key: null, label: ANY }, ...COUNTRIES.map((c) => ({ key: c.code, label: c.label }))]}
        on={(k) => f.country === k}
        tap={(country) => set({ country })}
      />
      <ChipGroup<string | null>
        title="Ngôn ngữ gốc"
        items={[{ key: null, label: ANY }, ...LANGUAGES.map((l) => ({ key: l.code, label: l.label }))]}
        on={(k) => f.lang === k}
        tap={(lang) => set({ lang })}
      />
      {f.where === "home" && (
        <ChipGroup<Filters["decade"]>
          title="Thập niên"
          items={[{ key: null, label: ANY }, ...DECADES.map(([key, label]) => ({ key, label }))]}
          on={(k) => f.decade === k}
          tap={(decade) => set({ decade })}
        />
      )}
      <ChipGroup
        title="Độ nổi tiếng"
        items={FAMES.map(([key, label]) => ({ key, label }))}
        on={(k) => f.fame === k}
        tap={(fame) => set({ fame })}
      />
    </>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";

const DEBOUNCE_MS = 300;
const PLACEHOLDER = "Tên Việt, tên Anh hay tên gốc đều được";

function normalize(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

/* Đổi ?q= tại chỗ, trang về 1. Loại "search" để layout có thể bỏ hiệu ứng chuyển trang khi đang gõ. */
function replaceQuery(router: ReturnType<typeof useRouter>, v: string) {
  router.replace(v ? `/tim?q=${encodeURIComponent(v)}` : "/tim", { scroll: false, transitionTypes: ["search"] });
}

/* Ô tìm phim: ngừng gõ 300ms thì đổi URL (?q=), trang về 1. Kết quả do server vẽ theo URL. */
export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Khi sheet chi tiết (@modal) mở, trang /tim vẫn nằm dưới nhưng URL là /phim/…: giữ nguyên ô, không điều hướng.
  const onTim = usePathname() === "/tim";
  const q = searchParams.get("q") ?? "";
  const [value, setValue] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // URL đổi từ ngoài (Back, link) thì đồng bộ lại ô, trừ khi chỉ khác khoảng trắng đang gõ dở.
  if (onTim && q !== prevQ) {
    setPrevQ(q);
    if (normalize(value) !== q) setValue(q);
  }

  useEffect(() => {
    const v = normalize(value);
    if (!onTim || v === q) return;
    const t = setTimeout(() => startTransition(() => replaceQuery(router, v)), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value, q, onTim, router]);

  function go(raw: string) {
    const v = normalize(raw);
    if (onTim && v !== q) startTransition(() => replaceQuery(router, v));
  }

  return (
    <form
      role="search"
      className="search-box"
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
    >
      <label htmlFor="tim-q" className="sr-only">
        Tìm phim
      </label>
      <Search className="search-ico size-5" aria-hidden />
      <input
        ref={inputRef}
        id="tim-q"
        name="q"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder={PLACEHOLDER}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="search-end">
        {pending && (
          <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" role="status" aria-label="Đang tìm" />
        )}
        {value && (
          <button
            type="button"
            className="search-clear"
            aria-label="Xoá chữ"
            onClick={() => {
              setValue("");
              go("");
              inputRef.current?.focus();
            }}
          >
            <X className="size-5" aria-hidden />
          </button>
        )}
      </div>
    </form>
  );
}

/* Khung giữ chỗ khi ô tìm chưa đọc được URL. */
export function SearchBoxShell() {
  return (
    <div className="search-box">
      <Search className="search-ico size-5" aria-hidden />
      <input type="search" aria-label="Tìm phim" placeholder={PLACEHOLDER} disabled />
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="grid-tickets mt-5" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-surface motion-reduce:animate-none" />
      ))}
    </div>
  );
}

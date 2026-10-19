"use client";

import { useEffect, useState } from "react";
import { fetchMovies, parseFilters, toSearch, type Filters } from "@/lib/discover";
import type { MoviePage } from "@/lib/movie";

// Cache theo chuỗi bộ lọc, sống tới khi tải lại trang
const cache = new Map<string, MoviePage>();

type St = { key: string | null; data: MoviePage | null; error: boolean };

/* Phim theo bộ lọc qua /api/discover. f = null thì không gọi gì. */
export function useMovies(f: Filters | null, opts: { debounce?: number } = {}) {
  const key = f ? toSearch(f, { withWhere: true }) : null;
  const debounce = opts.debounce ?? 0;
  const [st, setSt] = useState<St>({ key: null, data: null, error: false });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (key === null || cache.has(key)) return;
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        // dựng lại bộ lọc từ key (round-trip giữ nguyên) để effect chỉ phụ thuộc chuỗi
        const data = await fetchMovies(parseFilters(new URLSearchParams(key)), 1, ctl.signal);
        cache.set(key, data);
        setSt({ key, data, error: false });
      } catch {
        if (!ctl.signal.aborted) setSt({ key, data: null, error: true });
      }
    }, debounce);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [key, debounce, nonce]);

  const hit = key !== null ? cache.get(key) : undefined;
  const mine = key !== null && st.key === key;
  return {
    data: hit ?? (mine ? st.data : null),
    loading: key !== null && !hit && !mine,
    error: !hit && mine && st.error,
    retry: () => {
      setSt({ key: null, data: null, error: false });
      setNonce((n) => n + 1);
    },
  };
}

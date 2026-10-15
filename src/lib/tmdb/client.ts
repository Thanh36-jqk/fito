import "server-only";

// Lệnh gọi TMDB duy nhất của app. Token chỉ đọc ở đây, không bao giờ log header hay token.
const BASE = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  status: number;
  constructor(path: string, status: number) {
    super(`TMDB ${path} ${status}`);
    this.name = "TmdbError";
    this.status = status;
  }
}

export async function tmdbGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    console.error("[tmdb]", path, 0);
    throw new TmdbError(path, 0);
  }
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    console.error("[tmdb]", path, 0);
    throw new TmdbError(path, 0);
  }
  if (!res.ok) {
    if (res.status !== 404) console.error("[tmdb]", path, res.status);
    throw new TmdbError(path, res.status);
  }
  return (await res.json()) as T;
}

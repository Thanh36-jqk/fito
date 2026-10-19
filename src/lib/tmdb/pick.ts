// Hàm thuần biến JSON TMDB thành MovieCard/MovieDetail. Không I/O, có test (pick.test.ts).
import { DASH, GENRE_VI, JOB_VI, PLATFORMS } from "@/lib/movie";
import type { LangText, MovieCard, MovieDetail, MovieReview, Person, Provider, ProvidersVN, Trailer } from "@/lib/movie";
import type { Score } from "@/lib/score";
import type { TmdbImage, TmdbListItem, TmdbMovieFull, TmdbProvider, TmdbReleaseDates, TmdbVideo, TmdbWatchProviders } from "./types";

export function clean(s: string | null | undefined): string | null {
  const t = s?.trim();
  return t ? t : null;
}

export function pickTitle(t: {
  vi: string | null | undefined;
  en: string | null | undefined;
  original: string;
  originalLanguage: string;
}): { title: string; enTitle: string | null } {
  const vi = clean(t.vi);
  const en = clean(t.en);
  const orig = clean(t.original) ?? "";
  const title = vi && (vi !== orig || t.originalLanguage === "vi") ? vi : (en ?? vi ?? orig);
  return { title, enTitle: en };
}

export function pickText(vi: string | null | undefined, en: string | null | undefined): LangText | null {
  const v = clean(vi);
  if (v) return { text: v, lang: "vi" };
  const e = clean(en);
  return e ? { text: e, lang: "en" } : null;
}

const langRank = (lang: string | null, order: (string | null)[]) => {
  const i = order.indexOf(lang);
  return i === -1 ? order.length : i;
};

export function pickTrailer(videos: TmdbVideo[] | undefined): Trailer | null {
  const ok = (videos ?? []).filter((v) => v.site === "YouTube" && v.type === "Trailer" && v.official === true && !!v.key);
  if (!ok.length) return null;
  const rank = (v: TmdbVideo) => (v.iso_639_1 === "vi" ? 0 : v.iso_639_1 === "en" ? 1 : 2);
  const time = (v: TmdbVideo) => {
    const t = v.published_at ? Date.parse(v.published_at) : NaN;
    return Number.isNaN(t) ? -Infinity : t;
  };
  const best = ok.slice().sort((a, b) => rank(a) - rank(b) || time(b) - time(a))[0];
  return { key: best.key, name: best.name, lang: best.iso_639_1 ?? null, publishedAt: best.published_at ?? null };
}

function sortImages(list: TmdbImage[], order: (string | null)[]) {
  return list.slice().sort((a, b) => langRank(a.iso_639_1, order) - langRank(b.iso_639_1, order) || b.vote_average - a.vote_average);
}

export function pickPoster(posters: TmdbImage[] | undefined, fallback: string | null): string | null {
  const list = (posters ?? []).filter((p) => !!p.file_path);
  if (!list.length) return fallback;
  return sortImages(list, ["vi", null, "en"])[0].file_path;
}

export function pickLogo(logos: TmdbImage[] | undefined): string | null {
  const list = (logos ?? []).filter((l) => !!l.file_path && !/\.svg$/i.test(l.file_path));
  if (!list.length) return null;
  return sortImages(list, ["vi", "en", null])[0].file_path;
}

const VN_RATING = /^(P|K|T13|T16|T18|C)$/;

export function pickCertification(
  rd: TmdbReleaseDates | undefined,
  originCountries: string[],
): { value: string; country: string } | null {
  const countries = [...new Set(["VN", ...originCountries, "US"])];
  for (const country of countries) {
    const entries = rd?.results?.find((r) => r.iso_3166_1 === country)?.release_dates ?? [];
    for (const e of entries) {
      let value = (e.certification ?? "").trim();
      if (!value && country === "VN") {
        const note = (e.note ?? "").trim();
        if (VN_RATING.test(note)) value = note;
      }
      if (value) return { value, country };
    }
  }
  return null;
}

// Ngày ra rạp ở VN: type 3 (rạp), không có thì type 2 (rạp giới hạn); lấy ngày sớm nhất.
export function vnTheatrical(rd: TmdbReleaseDates | undefined): string | null {
  const entries = rd?.results?.find((r) => r.iso_3166_1 === "VN")?.release_dates ?? [];
  for (const type of [3, 2]) {
    const dates = entries
      .filter((e) => e.type === type && /^\d{4}-\d{2}-\d{2}/.test(e.release_date ?? ""))
      .map((e) => e.release_date.slice(0, 10))
      .sort();
    if (dates.length) return dates[0];
  }
  return null;
}

const toProviders = (list: TmdbProvider[] | undefined): Provider[] =>
  (list ?? []).map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path ?? null }));

export function pickProvidersVN(wp: TmdbWatchProviders | undefined): ProvidersVN | null {
  const vn = wp?.results?.VN;
  if (!vn) return null;
  const out: ProvidersVN = {
    link: clean(vn.link),
    flatrate: toProviders(vn.flatrate),
    free: toProviders(vn.free),
    ads: toProviders(vn.ads),
    rent: toProviders(vn.rent),
    buy: toProviders(vn.buy),
  };
  const any = out.flatrate.length + out.free.length + out.ads.length + out.rent.length + out.buy.length;
  return any ? out : null;
}

export function tmdbScore(avg: number | undefined, count: number | undefined): Score {
  if (!count || avg == null) return null;
  return { v: Math.round(avg * 10) / 10, votes: count };
}

const yearOf = (d: string | null) => (d ? Number(d.slice(0, 4)) : null);
const isoDay = (s: string | undefined) => {
  const d = clean(s);
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
};
const genreLabels = (ids: number[] | undefined) => (ids ?? []).map((id) => GENRE_VI[id]).filter((g): g is string => !!g);

/* vnDates: list có region=VN thì release_date là ngày ra rạp ở VN (phim cũ chiếu lại ra năm sai), nên bỏ năm. */
export function toCard(vi: TmdbListItem, en?: TmdbListItem | null, vnDates = false): MovieCard {
  const { title, enTitle } = pickTitle({
    vi: vi.title,
    en: en?.title,
    original: vi.original_title,
    originalLanguage: vi.original_language,
  });
  const releaseDate = isoDay(vi.release_date);
  return {
    id: vi.id,
    title,
    enTitle,
    originalTitle: clean(vi.original_title) ?? title,
    originalLanguage: vi.original_language,
    year: vnDates ? null : yearOf(releaseDate),
    releaseDate,
    runtime: null,
    genres: genreLabels(vi.genre_ids),
    posterPath: vi.poster_path ?? null,
    backdropPath: vi.backdrop_path ?? null,
    popularity: vi.popularity ?? 0,
    sc: { imdb: null, rt: null, mc: null, tmdb: tmdbScore(vi.vote_average, vi.vote_count), trakt: null },
    providers: [],
  };
}

export function mergeLists(vi: TmdbListItem[], en: TmdbListItem[], vnDates = false): MovieCard[] {
  const enById = new Map(en.map((e) => [e.id, e]));
  const seen = new Set<number>();
  const out: MovieCard[] = [];
  for (const item of vi) {
    // similar/recommendations không có include_adult nên tự lọc phim 18+
    if (seen.has(item.id) || item.adult) continue;
    seen.add(item.id);
    out.push(toCard(item, enById.get(item.id) ?? null, vnDates));
  }
  return out;
}

const regionNames = new Intl.DisplayNames("vi", { type: "region", fallback: "none" });
const languageNames = new Intl.DisplayNames("vi", { type: "language", fallback: "none" });
const upperFirst = (s: string) => s.charAt(0).toLocaleUpperCase("vi") + s.slice(1);

function displayNames(codes: string[], dn: Intl.DisplayNames, cap: boolean): string[] {
  const out: string[] = [];
  for (const code of codes) {
    let name: string | undefined;
    try {
      name = dn.of(code);
    } catch {
      name = undefined;
    }
    if (!name) continue;
    const label = cap ? upperFirst(name) : name;
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

const REVIEW_MAX = 700;

const otherName = (name: string, original: string | undefined) => {
  const o = clean(original);
  return o && o !== name ? o : null;
};

export function toDetail(input: { vi: TmdbMovieFull; en: TmdbMovieFull | null; cinema: "now" | "soon" | null }): MovieDetail {
  const { vi, en, cinema } = input;
  const card = toCard(vi, en);
  const genres = vi.genres ? genreLabels(vi.genres.map((g) => g.id)) : card.genres;

  const providersVN = pickProvidersVN(vi["watch/providers"]);
  const providers = providersVN
    ? [
        ...new Set(
          [...providersVN.flatrate, ...providersVN.free, ...providersVN.ads].map(
            (p) => PLATFORMS.find((x) => x.tmdbId === p.id)?.label ?? p.name,
          ),
        ),
      ]
    : [];

  const originCountries = vi.origin_country?.length
    ? vi.origin_country
    : (vi.production_countries ?? []).map((c) => c.iso_3166_1);
  const countryCodes = vi.production_countries?.length
    ? vi.production_countries.map((c) => c.iso_3166_1)
    : (vi.origin_country ?? []);

  const cast: Person[] = (vi.credits?.cast ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .slice(0, 15)
    .map((c) => ({
      id: c.id,
      name: c.name,
      originalName: otherName(c.name, c.original_name),
      role: clean(c.character) ?? DASH,
      profilePath: c.profile_path ?? null,
    }));

  const jobOrder = Object.keys(JOB_VI);
  const crewSeen = new Set<string>();
  const crew: Person[] = [];
  for (const c of (vi.credits?.crew ?? [])
    .filter((c) => c.job in JOB_VI)
    .sort((a, b) => jobOrder.indexOf(a.job) - jobOrder.indexOf(b.job))) {
    const role = JOB_VI[c.job];
    const k = `${c.id}|${role}`;
    if (crewSeen.has(k)) continue;
    crewSeen.add(k);
    crew.push({
      id: c.id,
      name: c.name,
      originalName: otherName(c.name, c.original_name),
      role,
      profilePath: c.profile_path ?? null,
    });
    if (crew.length >= 8) break;
  }

  const reviewSeen = new Set<string>();
  const reviews: MovieReview[] = [...(vi.reviews?.results ?? []), ...(en?.reviews?.results ?? [])]
    .filter((r) => (reviewSeen.has(r.id) ? false : (reviewSeen.add(r.id), true)))
    .filter((r) => !!clean(r.content))
    .sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0))
    .slice(0, 5)
    .map((r) => {
      const text = clean(r.content)!;
      return {
        id: r.id,
        src: "TMDB" as const,
        author: clean(r.author_details?.username) ?? clean(r.author) ?? DASH,
        date: clean(r.created_at),
        text: text.length > REVIEW_MAX ? text.slice(0, REVIEW_MAX) + "…" : text,
        url: clean(r.url),
        rating: r.author_details?.rating ?? null,
        spoiler: false,
      };
    });

  const nonZero = (n: number | undefined) => (n ? n : null);

  return {
    ...card,
    genres,
    runtime: nonZero(vi.runtime ?? undefined),
    posterPath: pickPoster(vi.images?.posters, vi.poster_path ?? null),
    providers,
    imdbId: clean(vi.external_ids?.imdb_id) ?? clean(vi.imdb_id) ?? null,
    tagline: pickText(vi.tagline, en?.tagline),
    overview: pickText(vi.overview, en?.overview),
    logoPath: pickLogo(vi.images?.logos),
    countries: displayNames(countryCodes, regionNames, false),
    languages: displayNames(
      (vi.spoken_languages ?? []).map((l) => l.iso_639_1),
      languageNames,
      true,
    ),
    certification: pickCertification(vi.release_dates, originCountries),
    vnRelease: vnTheatrical(vi.release_dates),
    cinema,
    collection: clean(vi.belongs_to_collection?.name),
    budget: nonZero(vi.budget),
    revenue: nonZero(vi.revenue),
    keywords: (vi.keywords?.keywords ?? []).map((k) => k.name).slice(0, 10),
    cast,
    crew,
    trailer: pickTrailer(vi.videos?.results),
    providersVN,
    similar: mergeLists(vi.similar?.results ?? [], en?.similar?.results ?? []).slice(0, 12),
    recommendations: mergeLists(vi.recommendations?.results ?? [], en?.recommendations?.results ?? []).slice(0, 12),
    reviews,
    isSample: false,
  };
}

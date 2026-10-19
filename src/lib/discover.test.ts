import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  discoverParams,
  fmtTotal,
  parseFilters,
  parsePage,
  sortCinema,
  toSearch,
  type Filters,
} from "./discover";
import type { MovieCard } from "./movie";

const F = (o: Partial<Filters>): Filters => ({ ...DEFAULT_FILTERS, ...o });
const W = { min: "2026-09-01", max: "2026-10-20" };

const card = (id: number, tmdb: MovieCard["sc"]["tmdb"], popularity: number): MovieCard => ({
  id,
  title: `Phim ${id}`,
  enTitle: null,
  originalTitle: `Phim ${id}`,
  originalLanguage: "en",
  year: 2026,
  releaseDate: "2026-10-01",
  runtime: null,
  genres: [],
  posterPath: null,
  backdropPath: null,
  popularity,
  sc: { imdb: null, rt: null, mc: null, tmdb, trakt: null },
  providers: [],
});

describe("parseFilters", () => {
  it("rỗng thì ra mặc định", () => {
    expect(parseFilters({})).toEqual(DEFAULT_FILTERS);
  });

  it("quốc gia không phân biệt hoa thường", () => {
    const f = parseFilters(new URLSearchParams("quocgia=jp&noitieng=it"));
    expect(f.country).toBe("JP");
    expect(f.fame).toBe("hidden");
  });

  it("bỏ giá trị lạ, thể loại tăng dần", () => {
    const f = parseFilters(new URLSearchParams("diem=9&dai=xyz&theloai=35,abc,99999,27&quocgia=ZZ&ngonngu=xx"));
    expect(f.min).toBe(0);
    expect(f.len).toBe("any");
    expect(f.genres).toEqual([27, 35]);
    expect(f.country).toBeNull();
    expect(f.lang).toBeNull();
  });

  it("object searchParams của Next: lấy phần tử đầu, forceWhere thắng", () => {
    const f = parseFilters({ sx: ["moi", "diem"], noi: "rap" }, "home");
    expect(f.sort).toBe("new");
    expect(f.where).toBe("home");
  });
});

describe("toSearch", () => {
  it("round-trip đủ mọi trường", () => {
    const f: Filters = {
      where: "cinema",
      genres: [27, 35],
      len: "mid",
      min: 7.5,
      sort: "new",
      country: "KR",
      lang: "ko",
      decade: "old",
      fame: "popular",
    };
    expect(parseFilters(new URLSearchParams(toSearch(f, { withWhere: true })))).toEqual(f);
  });

  it("mặc định ra chuỗi rỗng và round-trip", () => {
    expect(toSearch(DEFAULT_FILTERS)).toBe("");
    expect(parseFilters(new URLSearchParams(toSearch(DEFAULT_FILTERS, { withWhere: true })))).toEqual(DEFAULT_FILTERS);
  });

  it("bỏ giá trị mặc định, giữ thứ tự khoá", () => {
    expect(toSearch(F({ country: "JP", fame: "hidden" }))).toBe("quocgia=JP&noitieng=it");
    expect(toSearch(F({ genres: [27, 35] }), { page: 2, withWhere: true })).toBe("noi=nha&theloai=27,35&trang=2");
  });
});

describe("discoverParams", () => {
  it("ví dụ bắt buộc: JP + Ít người biết", () => {
    expect(discoverParams(F({ country: "JP", fame: "hidden" }))).toEqual({
      sort_by: "vote_average.desc",
      with_origin_country: "JP",
      "vote_average.gte": 7,
      "vote_count.gte": 50,
      "vote_count.lte": 2000,
    });
  });

  it("ví dụ bắt buộc: mặc định", () => {
    expect(discoverParams(DEFAULT_FILTERS)).toEqual({ sort_by: "popularity.desc", "vote_count.gte": 20 });
  });

  it("sàn lượt đánh giá theo sort và độ nổi tiếng", () => {
    expect(discoverParams(F({ sort: "score" }))["vote_count.gte"]).toBe(300);
    const h = discoverParams(F({ sort: "score", fame: "hidden" }));
    expect(h["vote_count.gte"]).toBe(50);
    expect(h["vote_count.lte"]).toBe(2000);
    expect(discoverParams(F({ min: 7.5, fame: "hidden" }))["vote_average.gte"]).toBe(7.5);
    expect(discoverParams(F({ min: 6 }))["vote_count.gte"]).toBe(50);
    expect(discoverParams(F({ fame: "popular", sort: "score" }))["vote_count.gte"]).toBe(1000);
  });

  it("độ dài", () => {
    const s = discoverParams(F({ len: "short" }));
    expect(s["with_runtime.gte"]).toBe(1);
    expect(s["with_runtime.lte"]).toBe(99);
    const l = discoverParams(F({ len: "long" }));
    expect(l["with_runtime.gte"]).toBe(121);
    expect(l).not.toHaveProperty(["with_runtime.lte"]);
  });

  it("thập niên", () => {
    const d = discoverParams(F({ decade: "1990" }));
    expect(d["primary_release_date.gte"]).toBe("1990-01-01");
    expect(d["primary_release_date.lte"]).toBe("1999-12-31");
    const n = discoverParams(F({ decade: "2020" }));
    expect(n["primary_release_date.gte"]).toBe("2020-01-01");
    expect(n).not.toHaveProperty(["primary_release_date.lte"]);
    const o = discoverParams(F({ decade: "old" }));
    expect(o["primary_release_date.lte"]).toBe("1969-12-31");
    expect(o).not.toHaveProperty(["primary_release_date.gte"]);
  });

  it("rạp: region VN, khoảng ngày now_playing, không sàn, không thập niên", () => {
    const p = discoverParams(F({ where: "cinema", decade: "1990" }), W);
    expect(p).toMatchObject({
      region: "VN",
      with_release_type: "2|3",
      "release_date.gte": W.min,
      "release_date.lte": W.max,
      sort_by: "popularity.desc",
    });
    expect(Object.keys(p).some((k) => k.startsWith("primary_release_date"))).toBe(false);
    expect(p).not.toHaveProperty(["vote_count.gte"]);
  });

  it("thể loại ghép OR tăng dần", () => {
    expect(discoverParams(F({ genres: [35, 27] })).with_genres).toBe("27|35");
  });
});

describe("sortCinema", () => {
  it("score: phim chưa đủ điểm xuống cuối, bằng điểm thì xét độ hot", () => {
    const list = [
      card(1, null, 900),
      card(2, { v: 9, votes: 10 }, 800),
      card(3, { v: 6, votes: 500 }, 10),
      card(4, { v: 8, votes: 500 }, 5),
      card(5, { v: 8, votes: 500 }, 50),
    ];
    const out = sortCinema(list, "score").map((m) => m.id);
    expect(out.slice(0, 3)).toEqual([5, 4, 3]);
    expect(out.slice(3).sort()).toEqual([1, 2]);
    expect(list[0].id).toBe(1); // không đổi mảng gốc
  });
});

describe("fmtTotal, parsePage", () => {
  it("fmtTotal", () => {
    expect(fmtTotal(20001)).toBe("10.000+");
    expect(fmtTotal(720)).toBe("720");
    expect(fmtTotal(1234)).toBe("1.234");
  });

  it("parsePage", () => {
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("9999")).toBe(500);
    expect(parsePage(null)).toBe(1);
    expect(parsePage("3")).toBe(3);
  });
});

import { describe, expect, it } from "vitest";
import enJson from "./__fixtures__/movie-38551.en.json";
import viJson from "./__fixtures__/movie-38551.vi.json";
import { mergeLists, pickCertification, pickLogo, pickProvidersVN, pickText, pickTitle, pickTrailer, toDetail } from "./pick";
import type { TmdbListItem, TmdbMovieFull, TmdbVideo } from "./types";

// Fixture thật lấy từ TMDB ngày 16/10/2026 (phim 38551 "Snakes and Earrings").
const vi = viJson as unknown as TmdbMovieFull;
const en = enJson as unknown as TmdbMovieFull;

const vid = (o: Partial<TmdbVideo>): TmdbVideo => ({
  key: "k",
  site: "YouTube",
  type: "Trailer",
  official: true,
  iso_639_1: "en",
  name: "Trailer",
  published_at: "2020-01-01T00:00:00.000Z",
  ...o,
});

describe("pickTrailer", () => {
  it("bỏ bản ja không chính thức, lấy bản en chính thức", () => {
    const t = pickTrailer([
      vid({ key: "ja", iso_639_1: "ja", official: false }),
      vid({ key: "en", iso_639_1: "en" }),
    ]);
    expect(t?.key).toBe("en");
  });

  it("ưu tiên vi dù cũ hơn en", () => {
    const t = pickTrailer([
      vid({ key: "vi", iso_639_1: "vi", published_at: "2019-01-01T00:00:00.000Z" }),
      vid({ key: "en", iso_639_1: "en", published_at: "2024-01-01T00:00:00.000Z" }),
    ]);
    expect(t?.key).toBe("vi");
  });

  it("hai bản en chính thức thì lấy bản mới hơn", () => {
    const t = pickTrailer([
      vid({ key: "old", published_at: "2018-05-01T00:00:00.000Z" }),
      vid({ key: "new", published_at: "2023-05-01T00:00:00.000Z" }),
    ]);
    expect(t?.key).toBe("new");
  });

  it("chỉ có Teaser chính thức thì null", () => {
    expect(pickTrailer([vid({ type: "Teaser" })])).toBeNull();
  });

  it("site Vimeo thì null", () => {
    expect(pickTrailer([vid({ site: "Vimeo" })])).toBeNull();
  });

  it("chỉ có bản ko chính thức thì lấy ko", () => {
    const t = pickTrailer([vid({ key: "ko", iso_639_1: "ko" })]);
    expect(t).toEqual({ key: "ko", name: "Trailer", lang: "ko", publishedAt: "2020-01-01T00:00:00.000Z" });
  });

  it("undefined thì null", () => {
    expect(pickTrailer(undefined)).toBeNull();
  });
});

describe("pickTitle", () => {
  it("38551: tên vi trùng tên gốc tiếng Nhật thì lấy tên en", () => {
    expect(pickTitle({ vi: "蛇にピアス", en: "Snakes and Earrings", original: "蛇にピアス", originalLanguage: "ja" })).toEqual({
      title: "Snakes and Earrings",
      enTitle: "Snakes and Earrings",
    });
  });

  it("phim Việt giữ tên Việt", () => {
    expect(pickTitle({ vi: "Mắt Biếc", en: "Dreamy Eyes", original: "Mắt Biếc", originalLanguage: "vi" }).title).toBe("Mắt Biếc");
  });

  it("có tên Việt khác tên gốc thì lấy tên Việt", () => {
    expect(
      pickTitle({ vi: "Vùng Đất Quỷ Dữ", en: "Resident Evil", original: "Resident Evil", originalLanguage: "en" }).title,
    ).toBe("Vùng Đất Quỷ Dữ");
  });

  it("vi rỗng hoặc chỉ khoảng trắng thì lấy en", () => {
    expect(pickTitle({ vi: "", en: "Snakes and Earrings", original: "蛇にピアス", originalLanguage: "ja" }).title).toBe(
      "Snakes and Earrings",
    );
    expect(pickTitle({ vi: "   ", en: " Snakes and Earrings ", original: "蛇にピアス", originalLanguage: "ja" }).title).toBe(
      "Snakes and Earrings",
    );
  });

  it("vi và en đều rỗng thì lấy tên gốc", () => {
    expect(pickTitle({ vi: "", en: " ", original: "蛇にピアス", originalLanguage: "ja" })).toEqual({ title: "蛇にピアス", enTitle: null });
  });
});

describe("pickText", () => {
  it("vi rỗng thì lấy en", () => {
    expect(pickText("", "Hello")).toEqual({ text: "Hello", lang: "en" });
  });

  it("cả hai rỗng thì null", () => {
    expect(pickText("", null)).toBeNull();
    expect(pickText(undefined, undefined)).toBeNull();
  });

  it("chuỗi chỉ có khoảng trắng coi như rỗng", () => {
    expect(pickText("  \n ", "  ")).toBeNull();
    expect(pickText(" Xin chào ", "Hello")).toEqual({ text: "Xin chào", lang: "vi" });
  });
});

describe("pickCertification", () => {
  it("VN có certification rỗng thì lấy note T18", () => {
    const rd = {
      results: [{ iso_3166_1: "VN", release_dates: [{ certification: "", note: " T18 ", release_date: "2026-10-01T00:00:00.000Z", type: 3 }] }],
    };
    expect(pickCertification(rd, ["US"])).toEqual({ value: "T18", country: "VN" });
  });

  it("note VN không phải mã độ tuổi thì bỏ qua", () => {
    const rd = {
      results: [
        { iso_3166_1: "VN", release_dates: [{ certification: "", note: "Premiere", release_date: "2026-10-01T00:00:00.000Z", type: 1 }] },
        { iso_3166_1: "US", release_dates: [{ certification: "PG-13", note: "", release_date: "2026-10-01T00:00:00.000Z", type: 3 }] },
      ],
    };
    expect(pickCertification(rd, [])).toEqual({ value: "PG-13", country: "US" });
  });

  it("fixture 38551 → R15+ (JP)", () => {
    expect(pickCertification(vi.release_dates, vi.origin_country ?? [])).toEqual({ value: "R15+", country: "JP" });
  });
});

describe("pickLogo / pickProvidersVN", () => {
  it("pickLogo bỏ file .svg", () => {
    expect(
      pickLogo([
        { file_path: "/vi.svg", iso_639_1: "vi", vote_average: 9 },
        { file_path: "/en.png", iso_639_1: "en", vote_average: 1 },
      ]),
    ).toBe("/en.png");
    expect(pickLogo([{ file_path: "/a.SVG", iso_639_1: "vi", vote_average: 5 }])).toBeNull();
  });

  it("pickProvidersVN(fixture 38551) → null vì không có VN", () => {
    expect(pickProvidersVN(vi["watch/providers"])).toBeNull();
  });
});

describe("toDetail(fixture 38551)", () => {
  const d = toDetail({ vi, en, cinema: null });

  it("tên hiển thị và tên gốc", () => {
    expect(d.title).toBe("Snakes and Earrings");
    expect(d.originalTitle).toBe("蛇にピアス");
  });

  it("trailer tiếng Anh chính thức", () => {
    expect(d.trailer?.key).toBe("A9onKczFG5M");
  });

  it("tóm tắt lấy bản en", () => {
    expect(d.overview?.lang).toBe("en");
  });

  it("độ dài, nước, ngôn ngữ", () => {
    expect(d.runtime).toBe(123);
    expect(d.countries).toContain("Nhật Bản");
    expect(d.languages[0]).toBe("Tiếng Nhật");
  });

  it("ekip có đạo diễn, diễn viên đầu tiên", () => {
    expect(d.crew.map((c) => c.role)).toContain("Đạo diễn");
    expect(d.crew.length).toBeLessThanOrEqual(8);
    expect(d.cast[0].name).toBe("Yoshitaka Yuriko");
  });

  it("điểm TMDB và imdb_id", () => {
    expect(d.sc.tmdb?.votes).toBe(41);
    expect(d.imdbId).toBe("tt1254249");
    expect(d.isSample).toBe(false);
    expect(d.providersVN).toBeNull();
  });
});

describe("mergeLists vnDates", () => {
  const laputa: TmdbListItem = { id: 10515, title: "Laputa", original_title: "天空の城ラピュタ", original_language: "ja", release_date: "2026-09-25", poster_path: null, backdrop_path: null };
  it("list region=VN: giữ ngày ra rạp VN, bỏ năm", () => {
    const [c] = mergeLists([laputa], [], true);
    expect(c.releaseDate).toBe("2026-09-25");
    expect(c.year).toBeNull();
  });
  it("list thường vẫn có năm", () => {
    expect(mergeLists([laputa], [])[0].year).toBe(2026);
  });
});

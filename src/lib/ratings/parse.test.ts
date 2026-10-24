import { describe, expect, it } from "vitest";
import { parseImdbRow, parseOmdb, parseTrakt } from "./parse";

describe("parseOmdb", () => {
  it("lấy RT (0–100), MC (0–100), IMDb kèm lượt", () => {
    const json = {
      Response: "True",
      Ratings: [
        { Source: "Internet Movie Database", Value: "6.1/10" },
        { Source: "Rotten Tomatoes", Value: "92%" },
        { Source: "Metacritic", Value: "74/100" },
      ],
      imdbRating: "6.1",
      imdbVotes: "1,032",
    };
    expect(parseOmdb(json)).toEqual({ rt: { v: 92 }, mc: { v: 74 }, imdb: { v: 6.1, votes: 1032 } });
  });

  it("Response False → tất cả null", () => {
    expect(parseOmdb({ Response: "False" })).toEqual({ rt: null, mc: null, imdb: null });
  });

  it("thiếu nguồn hoặc N/A → nguồn đó null", () => {
    const json = { Response: "True", Ratings: [{ Source: "Rotten Tomatoes", Value: "88%" }], imdbRating: "N/A" };
    expect(parseOmdb(json)).toEqual({ rt: { v: 88 }, mc: null, imdb: null });
  });

  it("null/undefined → tất cả null", () => {
    expect(parseOmdb(null)).toEqual({ rt: null, mc: null, imdb: null });
    expect(parseOmdb(undefined)).toEqual({ rt: null, mc: null, imdb: null });
  });
});

describe("parseTrakt", () => {
  it("làm tròn 1 chữ số, giữ số lượt", () => {
    expect(parseTrakt({ rating: 7.23456, votes: 142 })).toEqual({ v: 7.2, votes: 142 });
  });

  it("chưa ai chấm → null", () => {
    expect(parseTrakt({ rating: 0, votes: 0 })).toBeNull();
    expect(parseTrakt({ rating: 7, votes: 0 })).toBeNull();
    expect(parseTrakt(undefined)).toBeNull();
  });
});

describe("parseImdbRow", () => {
  it("nhận số hoặc chuỗi từ Supabase", () => {
    expect(parseImdbRow({ rating: 6.1, votes: 1032 })).toEqual({ v: 6.1, votes: 1032 });
    expect(parseImdbRow({ rating: "6.1", votes: "1032" })).toEqual({ v: 6.1, votes: 1032 });
  });

  it("thiếu dữ liệu → null", () => {
    expect(parseImdbRow(null)).toBeNull();
    expect(parseImdbRow({ rating: 6.1 })).toBeNull();
  });
});

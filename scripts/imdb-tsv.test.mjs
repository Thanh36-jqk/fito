import { describe, it, expect } from "vitest";
import { parseRatingLine } from "./imdb-tsv.mjs";

const snakes = { tconst: "tt1254249", rating: 6.1, votes: 1032 };

describe("parseRatingLine", () => {
  it("bỏ dòng tiêu đề", () => {
    expect(parseRatingLine("tconst\taverageRating\tnumVotes")).toBeNull();
  });

  it("đọc dòng hợp lệ", () => {
    expect(parseRatingLine("tt1254249\t6.1\t1032")).toEqual(snakes);
  });

  it("chịu được \\r cuối dòng", () => {
    expect(parseRatingLine("tt1254249\t6.1\t1032\r")).toEqual(snakes);
  });

  it("dưới 50 lượt thì bỏ, đúng 50 thì giữ", () => {
    expect(parseRatingLine("tt1\t7\t49")).toBeNull();
    expect(parseRatingLine("tt1\t7\t50")).toEqual({ tconst: "tt1", rating: 7, votes: 50 });
  });

  it("bỏ dòng hỏng", () => {
    expect(parseRatingLine("tt1\t\\N\t100")).toBeNull();
    expect(parseRatingLine("tt1\t7")).toBeNull();
    expect(parseRatingLine("")).toBeNull();
    expect(parseRatingLine("nm123\t7\t100")).toBeNull();
  });

  it("minVotes = 0 cho qua cả 1 lượt", () => {
    expect(parseRatingLine("tt1\t5.5\t1", 0)).toEqual({ tconst: "tt1", rating: 5.5, votes: 1 });
  });
});

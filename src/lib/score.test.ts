import { describe, expect, it } from "vitest";
import { counted, level, totalScore, type Scores } from "./score";

const none: Scores = { imdb: null, rt: null, mc: null, tmdb: null, trakt: null };

describe("totalScore / level / counted", () => {
  it("mọi nguồn null thì null, mức none", () => {
    expect(totalScore(none)).toBeNull();
    expect(level(totalScore(none))).toBe("none");
  });

  it("TMDB 41 lượt bị loại khỏi điểm tổng", () => {
    expect(counted({ v: 6.1, votes: 41 })).toBe(false);
    expect(totalScore({ ...none, tmdb: { v: 6.1, votes: 41 } })).toBeNull();
  });

  it("đúng 50 lượt thì được tính", () => {
    expect(counted({ v: 7, votes: 50 })).toBe(true);
    expect(totalScore({ ...none, tmdb: { v: 7, votes: 50 } })).toBe(7);
  });

  it("RT không có số lượt vẫn được tính", () => {
    expect(counted({ v: 80 })).toBe(true);
  });

  it("RT 80 + IMDb 7 → 7.5, mức good", () => {
    const t = totalScore({ ...none, rt: { v: 80 }, imdb: { v: 7, votes: 1000 } });
    expect(t).toBe(7.5);
    expect(level(t)).toBe("good");
  });

  it("ngưỡng mức điểm", () => {
    expect(level(7.4)).toBe("mid");
    expect(level(6)).toBe("mid");
    expect(level(5.9)).toBe("bad");
  });
});

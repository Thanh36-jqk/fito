// Điểm tổng thang 10 theo docs/PLAN.md: RT và MC chia 10, bỏ nguồn thiếu, bỏ nguồn dưới 50 lượt.

export type Score = { v: number; votes?: number } | null;
export type Scores = { imdb: Score; rt: Score; mc: Score; tmdb: Score; trakt: Score };
export type SourceKey = keyof Scores;

export const SOURCES: { key: SourceKey; label: string; div: number }[] = [
  { key: "imdb", label: "IMDb", div: 1 },
  { key: "rt", label: "RT", div: 10 },
  { key: "mc", label: "MC", div: 10 },
  { key: "tmdb", label: "TMDB", div: 1 },
  { key: "trakt", label: "Trakt", div: 1 },
];

export const MIN_VOTES = 50;

export function counted(s: Score): s is { v: number; votes?: number } {
  return !!s && s.v != null && (s.votes == null || s.votes >= MIN_VOTES);
}

export function countedSources(sc: Scores) {
  return SOURCES.filter(({ key }) => counted(sc[key]));
}

export function totalScore(sc: Scores): number | null {
  const vals = countedSources(sc).map(({ key, div }) => (sc[key] as { v: number }).v / div);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export type Level = "good" | "mid" | "bad" | "none";

export function level(t: number | null): Level {
  return t == null ? "none" : t >= 7.5 ? "good" : t >= 6 ? "mid" : "bad";
}

export const STAMP: Record<Level, string> = {
  good: "ĐỈNH NÓC",
  mid: "CŨNG ĐƯỢC",
  bad: "NÉ GẤP",
  none: "CHƯA ĐỦ ĐIỂM",
};

export const fmt1 = (n: number) => n.toFixed(1).replace(".", ",");
export const fmtVotes = (n: number) => (n >= 1000 ? fmt1(n / 1000) + "K lượt" : n + " lượt");

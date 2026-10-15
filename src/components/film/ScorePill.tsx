import { DASH } from "@/lib/movie";
import { fmt1, level, totalScore, type Scores } from "@/lib/score";

export function ScorePill({ film }: { film: { sc: Scores } }) {
  const t = totalScore(film.sc);
  return <span className={`pill num lv-${level(t)}`}>{t == null ? DASH : fmt1(t)}</span>;
}

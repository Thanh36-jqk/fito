import { total, type Film } from "@/lib/films";
import { fmt1, level } from "@/lib/score";

export function ScorePill({ film }: { film: Film }) {
  const t = total(film);
  return <span className={`pill num lv-${level(t)}`}>{t == null ? "—" : fmt1(t)}</span>;
}

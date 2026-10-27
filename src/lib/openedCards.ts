// Nhớ MovieCard vừa bấm (client, trong bộ nhớ) để sheet render poster tức thì → morph layoutId bắt đầu ngay,
// không chờ fetch. Chỉ phim thật (id > 0). Giữ tối đa 40 thẻ gần nhất.
import type { MovieCard } from "./movie";

const cache = new Map<number, MovieCard>();

export function rememberCard(card: MovieCard) {
  if (card.id <= 0) return;
  cache.delete(card.id);
  cache.set(card.id, card);
  if (cache.size > 40) cache.delete(cache.keys().next().value as number);
}

export function getOpenedCard(id: number): MovieCard | null {
  return cache.get(id) ?? null;
}

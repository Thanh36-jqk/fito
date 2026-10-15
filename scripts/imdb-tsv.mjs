export const MIN_VOTES = 50;

// Mỗi dòng title.ratings.tsv: tconst<TAB>averageRating<TAB>numVotes (dòng đầu là tiêu đề)
export function parseRatingLine(line, minVotes = MIN_VOTES) {
  const p = line.replace(/\r$/, "").split("\t");
  if (p.length !== 3 || !/^tt\d+$/.test(p[0])) return null;
  const rating = Number(p[1]);
  const votes = Number(p[2]);
  if (!Number.isFinite(rating) || !Number.isInteger(votes) || rating < 0 || rating > 10) return null;
  if (votes < minVotes) return null;
  return { tconst: p[0], rating, votes };
}

// Nạp điểm IMDb (file chính thức IMDb Non-Commercial Datasets) vào bảng imdb_ratings.
// Chạy: npm run imdb:import  ·  chạy thử không ghi: node scripts/import-imdb-ratings.mjs --dry
import { Readable } from "node:stream";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { parseRatingLine } from "./imdb-tsv.mjs";

const SOURCE = "https://datasets.imdbws.com/title.ratings.tsv.gz";
const BATCH = 5000;

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dry = process.argv.includes("--dry");

if (!dry && (!url || !key)) {
  console.error(
    'Thiếu SUPABASE_URL (hoặc NEXT_PUBLIC_SUPABASE_URL) hoặc SUPABASE_SERVICE_ROLE_KEY. Xem mục "Thiết lập Supabase" trong README.',
  );
  process.exit(1);
}

async function upsert(rows) {
  const res = await fetch(`${url}/rest/v1/imdb_ratings?on_conflict=tconst`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

async function main() {
  const startedAt = new Date().toISOString();
  const res = await fetch(SOURCE);
  if (!res.ok || !res.body) throw new Error(`Không tải được ${SOURCE}: HTTP ${res.status}`);

  const input = Readable.fromWeb(res.body).pipe(createGunzip());
  const lines = createInterface({ input, crlfDelay: Infinity });

  let batch = [];
  let n = 0;
  for await (const line of lines) {
    const row = parseRatingLine(line);
    if (!row) continue;
    batch.push({ ...row, updated_at: startedAt });
    n++;
    if (batch.length === BATCH) {
      if (!dry) await upsert(batch);
      batch = [];
    }
    if (n % 100_000 === 0) console.log(`Đã nạp ${n.toLocaleString("vi-VN")} dòng…`);
  }
  if (batch.length && !dry) await upsert(batch);

  console.log(
    `Xong: ${n.toLocaleString("vi-VN")} phim có từ 50 lượt (${dry ? "chạy thử, không ghi" : "đã ghi vào imdb_ratings"}).`,
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

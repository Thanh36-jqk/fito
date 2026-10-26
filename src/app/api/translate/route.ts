// Dịch bình luận sang tiếng Việt. Gọi endpoint Google Translate miễn phí (không cần khoá), chỉ ở server.
// Văn bản dài thì cắt khúc để không vượt giới hạn URL. Lỗi/hết lượt → 502, client giữ bản gốc.
import "server-only";
import type { NextRequest } from "next/server";

const ENDPOINT = "https://clients5.google.com/translate_a/t";
const CHUNK = 4000; // ký tự/khúc, tránh URL quá dài
const MAX = 20000; // chặn văn bản quá lớn

/* Cắt văn bản thành các khúc ≤ CHUNK, ưu tiên ngắt ở xuống dòng. */
function split(text: string): string[] {
  if (text.length <= CHUNK) return [text];
  const out: string[] = [];
  let cur = "";
  for (const line of text.split(/(\n)/)) {
    if (line.length > CHUNK) {
      if (cur) {
        out.push(cur);
        cur = "";
      }
      for (let i = 0; i < line.length; i += CHUNK) out.push(line.slice(i, i + CHUNK));
      continue;
    }
    if ((cur + line).length > CHUNK && cur) {
      out.push(cur);
      cur = "";
    }
    cur += line;
  }
  if (cur) out.push(cur);
  return out;
}

async function translateChunk(q: string, to: string): Promise<string> {
  const url = new URL(ENDPOINT);
  url.search = new URLSearchParams({ client: "dict-chrome-ex", sl: "auto", tl: to, q }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`translate ${res.status}`);
  const json = await res.json();
  // [[đoạn đã dịch, mã ngôn ngữ], ...] — nhiều phần tử nếu nguồn có nhiều đoạn
  if (!Array.isArray(json)) return "";
  return json.map((s) => (Array.isArray(s) ? (s[0] ?? "") : typeof s === "string" ? s : "")).join("");
}

export async function POST(request: NextRequest) {
  let body: { text?: unknown; to?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad-json" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const to = typeof body.to === "string" && /^[a-z]{2}$/.test(body.to) ? body.to : "vi";
  if (!text) return Response.json({ error: "empty" }, { status: 400 });
  if (text.length > MAX) return Response.json({ error: "too-long" }, { status: 413 });

  try {
    const parts = await Promise.all(split(text).map((c) => translateChunk(c, to)));
    return Response.json({ text: parts.join("") });
  } catch {
    return Response.json({ error: "translate" }, { status: 502 });
  }
}

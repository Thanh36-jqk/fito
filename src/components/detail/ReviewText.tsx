"use client";

import { Languages, Loader2 } from "lucide-react";
import { useState } from "react";
import { Scratch } from "./Scratch";

/* Nội dung một bình luận + nút dịch sang tiếng Việt (gọi /api/translate). Giữ được bản gốc để xem lại. */
export function ReviewText({ text, spoiler }: { text: string; spoiler?: boolean }) {
  const [vi, setVi] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  async function translate() {
    if (vi) {
      setShow(true);
      return;
    }
    setLoading(true);
    setErr(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("translate");
      const data = (await res.json()) as { text?: string };
      if (!data.text) throw new Error("empty");
      setVi(data.text);
      setShow(true);
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }

  const shown = show && vi ? vi : text;

  return (
    <>
      {spoiler ? <Scratch>{shown}</Scratch> : <p style={{ whiteSpace: "pre-line" }}>{shown}</p>}
      <div className="rev-tr">
        {show && vi ? (
          <>
            <button type="button" className="d-link" onClick={() => setShow(false)}>
              Xem bản gốc
            </button>
            <span className="rev-tr-note">Dịch tự động</span>
          </>
        ) : (
          <button type="button" className="d-link" onClick={translate} disabled={loading}>
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Languages className="size-3.5" aria-hidden />
            )}
            {loading ? "Đang dịch…" : "Dịch sang tiếng Việt"}
          </button>
        )}
        {err && <span className="rev-tr-err">Dịch lỗi, thử lại nha.</span>}
      </div>
    </>
  );
}

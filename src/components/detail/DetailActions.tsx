"use client";

import { Check, Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { FilmScores } from "@/components/detail/FilmScores";
import { PARTNER_WANTS } from "@/lib/films";
import type { FilmScorePair, Snapshot } from "@/lib/journal";
import { addWant, markWatched } from "@/lib/journal-actions";
import { buzz, useFito } from "@/lib/store";

const EMPTY_SCORES: FilmScorePair = { signedIn: false, me: null, them: null };

export function DetailActions({
  id,
  snap,
  initialWanted = false,
  initialWatched = false,
  initialScores = EMPTY_SCORES,
  className = "",
}: {
  id: number;
  snap: Snapshot;
  initialWanted?: boolean;
  initialWatched?: boolean;
  initialScores?: FilmScorePair;
  className?: string;
}) {
  const { state, dispatch, toast } = useFito();
  const [pending, start] = useTransition();
  const [wanted, setWanted] = useState(initialWanted);
  const [watched, setWatched] = useState(initialWatched);
  const [pair, setPair] = useState(initialScores);
  const [showForm, setShowForm] = useState(false);
  const [score, setScore] = useState<number | null>(initialScores.me?.score ?? null);
  const [note, setNote] = useState(initialScores.me?.note ?? "");
  const sample = id <= 0; // phim mẫu: giữ hành vi trong bộ nhớ như cũ, không ghi Supabase
  const isWanted = sample ? state.wants.includes(id) : wanted;

  function onWatched() {
    if (sample) return toast("Đây là phim mẫu nên chưa vào nhật ký. Phim thật thì lưu được nha.");
    setShowForm((v) => !v); // mở/đóng form chấm điểm
  }

  function onSave() {
    buzz(18);
    start(async () => {
      const r = await markWatched(snap, { score, note });
      if (r.ok) {
        setPair(r.pair!);
        setWatched(true);
        toast("Đã lưu vào nhật ký · đã xem");
        setShowForm(false);
      } else toast("Lưu nhật ký lỗi, thử lại nha");
    });
  }

  function onWant() {
    if (sample) {
      if (state.wants.includes(id)) return toast("Đã nằm trong danh sách hóng rồi");
      dispatch({ type: "want", id });
      buzz(18);
      if (!PARTNER_WANTS.has(id)) toast("Đã thêm vào danh sách hóng");
      return;
    }
    if (wanted) return toast("Đã nằm trong kho hóng rồi");
    setWanted(true);
    buzz(18);
    start(async () => {
      const r = await addWant(snap);
      if (r.ok) toast("Đã thêm vào kho hóng");
      else {
        setWanted(false);
        toast("Thêm hóng lỗi, thử lại nha");
      }
    });
  }

  return (
    <>
      <div className={`actions ${className}`}>
        <button type="button" className="btn btn-ghost" onClick={onWatched} aria-expanded={!sample && showForm}>
          {watched ? (
            <>
              <Check className="size-5" aria-hidden /> Đã xem
            </>
          ) : (
            "Xem rồi nha"
          )}
        </button>
        <button type="button" className="btn btn-main" onClick={onWant} disabled={pending}>
          <Heart className="size-5" fill={isWanted ? "currentColor" : "none"} aria-hidden />
          {isWanted ? "Đã hóng" : "Hóng"}
        </button>
      </div>

      {!sample && showForm && (
        <div className="cmp-form">
          <p className="cmp-form-q" id="cmp-form-q">Chấm mấy điểm nè?</p>
          <div className="cmp-scale" role="group" aria-labelledby="cmp-form-q">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className="chip cmp-dot"
                aria-pressed={score === n}
                aria-label={`${n} điểm`}
                onClick={() => setScore((s) => (s === n ? null : n))}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="cmp-input"
            value={note}
            maxLength={300}
            aria-label="Ghi chú ngắn"
            placeholder="Ghi chú ngắn (tuỳ chọn)"
            onChange={(e) => setNote(e.target.value)}
          />
          <button type="button" className="btn btn-main cmp-save" onClick={onSave} disabled={pending}>
            Lưu vào nhật ký
          </button>
        </div>
      )}

      {!sample && <FilmScores pair={pair} />}
    </>
  );
}

"use client";

import { Check, Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { PARTNER_WANTS } from "@/lib/films";
import type { Snapshot } from "@/lib/journal";
import { addWant, markWatched } from "@/lib/journal-actions";
import { buzz, useFito } from "@/lib/store";

export function DetailActions({
  id,
  snap,
  initialWanted = false,
  initialWatched = false,
  className = "",
}: {
  id: number;
  snap: Snapshot;
  initialWanted?: boolean;
  initialWatched?: boolean;
  className?: string;
}) {
  const { state, dispatch, toast } = useFito();
  const [pending, start] = useTransition();
  const [wanted, setWanted] = useState(initialWanted);
  const [watched, setWatched] = useState(initialWatched);
  const sample = id <= 0; // phim mẫu: giữ hành vi trong bộ nhớ như cũ, không ghi Supabase
  const isWanted = sample ? state.wants.includes(id) : wanted;

  function onWatched() {
    if (sample) return toast("Đây là phim mẫu nên chưa vào nhật ký. Phim thật thì lưu được nha.");
    if (watched) return toast("Phim này đã nằm trong nhật ký rồi");
    setWatched(true);
    buzz(18);
    start(async () => {
      const r = await markWatched(snap);
      if (r.ok) toast("Đã lưu vào nhật ký · đã xem");
      else {
        setWatched(false);
        toast("Lưu nhật ký lỗi, thử lại nha");
      }
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
    <div className={`actions ${className}`}>
      <button type="button" className="btn btn-ghost" onClick={onWatched} disabled={pending}>
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
  );
}

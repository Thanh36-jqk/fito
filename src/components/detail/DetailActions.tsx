"use client";

import { Heart } from "lucide-react";
import { PARTNER_WANTS } from "@/lib/films";
import { buzz, useFito } from "@/lib/store";

export function DetailActions({ id, className = "" }: { id: number; className?: string }) {
  const { state, dispatch, toast } = useFito();
  const wanted = state.wants.includes(id);
  return (
    <div className={`actions ${className}`}>
      <button type="button" className="btn btn-ghost" onClick={() => toast("Nhật ký sẽ có ở bản sau. Nhớ chấm điểm nha!")}>
        Xem rồi nha
      </button>
      <button
        type="button"
        className="btn btn-main"
        onClick={() => {
          if (wanted) return toast("Đã nằm trong danh sách hóng rồi");
          dispatch({ type: "want", id });
          buzz(18);
          if (!PARTNER_WANTS.has(id)) toast("Đã thêm vào danh sách hóng");
        }}
      >
        <Heart className="size-5" fill={wanted ? "currentColor" : "none"} aria-hidden />
        {wanted ? "Đã hóng" : "Hóng"}
      </button>
    </div>
  );
}

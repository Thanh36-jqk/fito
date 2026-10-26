"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/EmptyState";

/* Ranh giới lỗi: có sự cố thì hiện đẹp + nút thử lại, thay vì trang trắng. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section>
      <EmptyState mood="sad" title="Trục trặc rồi" hand="thử lại phát xem sao">
        Có gì đó lỗi khi tải phần này. Thử lại giúp mình nha.
      </EmptyState>
      <div className="mx-auto mt-4 flex max-w-xs justify-center">
        <button type="button" className="btn btn-main" onClick={reset}>
          Thử lại
        </button>
      </div>
    </section>
  );
}

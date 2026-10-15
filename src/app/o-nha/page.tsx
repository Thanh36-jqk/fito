import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { Hello } from "@/components/Hello";

export const metadata: Metadata = { title: "Ở nhà" };

export default function ONhaPage() {
  return (
    <section>
      <Hello lead="Ở nhà thì" highlight="xem gì?" />
      <EmptyState mood="happy" title="Sofa đã sẵn sàng" hand="Netflix · FPT Play · Galaxy Play · VieON">
        Phim có trên các nền tảng xem ở VN sẽ hiện ở đây, lọc theo nền tảng hai đứa đang dùng.
      </EmptyState>
    </section>
  );
}

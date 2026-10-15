import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { Hello } from "@/components/Hello";

export const metadata: Metadata = { title: "Nhật ký" };

export default function NhatKyPage() {
  return (
    <section>
      <Hello lead="Sổ tay" highlight="hai đứa" />
      <EmptyState mood="sad" title="Sổ còn trắng tinh" hand="phim này làm cậu thấy sao?">
        Xem xong, mỗi đứa chấm điểm và viết vài dòng. Tường polaroid sẽ hiện ở đây.
      </EmptyState>
    </section>
  );
}

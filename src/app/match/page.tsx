import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { Hello } from "@/components/Hello";

export const metadata: Metadata = { title: "Match" };

export default function MatchPage() {
  return (
    <section>
      <Hello lead="Quẹt cho" highlight="trùng gu" />
      <EmptyState mood="happy" title="Chưa trùng gu phim nào" hand="chốt đơn hay thôi né?">
        Chồng thẻ quẹt và danh sách phim cả hai cùng muốn xem sẽ ở đây.
      </EmptyState>
    </section>
  );
}

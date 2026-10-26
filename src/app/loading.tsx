import { PosterRowSkeleton, Skeleton, TicketGridSkeleton } from "@/components/Skeleton";

/* Khung chờ khi chuyển trang (chủ yếu cho trang chủ gọi TMDB). */
export default function Loading() {
  return (
    <section>
      <Skeleton style={{ width: "62%", height: 46, margin: "8px 0 14px" }} />
      <Skeleton style={{ height: 118, borderRadius: 20, marginBottom: 16 }} />
      <Skeleton style={{ height: 60, borderRadius: 16, marginBottom: 20 }} />
      <Skeleton style={{ width: 160, height: 28, marginBottom: 6 }} />
      <PosterRowSkeleton />
      <Skeleton style={{ width: 140, height: 28, margin: "8px 0 14px" }} />
      <TicketGridSkeleton />
    </section>
  );
}

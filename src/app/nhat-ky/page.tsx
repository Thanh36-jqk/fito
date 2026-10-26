import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Hello } from "@/components/Hello";
import { TicketCard } from "@/components/film/TicketCard";
import { TicketGridSkeleton } from "@/components/Skeleton";
import { getJournal } from "@/lib/journal";
import { fmtDayMonth } from "@/lib/movie";

export const metadata: Metadata = { title: "Nhật ký" };

export default function NhatKyPage() {
  return (
    <section>
      <Hello lead="Sổ tay" highlight="hai đứa" />
      <Suspense fallback={<TicketGridSkeleton />}>
        <JournalContent />
      </Suspense>
    </section>
  );
}

async function JournalContent() {
  const { watched, wants } = await getJournal();

  if (!watched.length && !wants.length) {
    return (
      <EmptyState mood="sad" title="Sổ còn trắng tinh" hand="xem xong nhớ bấm “Xem rồi” nha">
        Mở một phim rồi bấm “Xem rồi nha” hoặc “Hóng”. Phim sẽ hiện ở đây, cả hai đứa cùng thấy.
      </EmptyState>
    );
  }

  return (
    <>
      <div className="sec-h">
        <h2>Đã xem</h2>
        <small>{watched.length} phim</small>
      </div>
      {watched.length ? (
        <div className="grid-tickets">
          {watched.map((it) => (
            <TicketCard key={`w${it.card.id}`} film={it.card} showScore sticker={fmtDayMonth(it.date)} />
          ))}
        </div>
      ) : (
        <p className="text-muted">Chưa đánh dấu phim nào đã xem.</p>
      )}

      <div className="sec-h">
        <h2>Kho hóng</h2>
        <small>{wants.length} phim</small>
      </div>
      {wants.length ? (
        <div className="grid-tickets">
          {wants.map((it) => (
            <TicketCard key={`h${it.card.id}`} film={it.card} showScore />
          ))}
        </div>
      ) : (
        <p className="text-muted">Chưa hóng phim nào.</p>
      )}
    </>
  );
}

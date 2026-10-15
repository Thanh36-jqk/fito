import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailActions } from "@/components/detail/DetailActions";
import { DetailBody } from "@/components/detail/DetailBody";
import { DetailSkeleton } from "@/components/detail/DetailSkeleton";
import { Sheet } from "@/components/detail/Sheet";
import { FILMS, getFilm } from "@/lib/films";

export function generateStaticParams() {
  return FILMS.map((f) => ({ id: String(f.id) }));
}

/* Sheet hiện ngay; nội dung đọc params nằm trong Suspense để điều hướng tức thì. */
export default function PhimModal({ params }: PageProps<"/phim/[id]">) {
  return (
    <Sheet>
      <Suspense fallback={<DetailSkeleton />}>
        <ModalContent params={params} />
      </Suspense>
    </Sheet>
  );
}

async function ModalContent({ params }: { params: PageProps<"/phim/[id]">["params"] }) {
  const film = getFilm(Number((await params).id));
  if (!film) notFound();
  return (
    <>
      <div className="sheet-scroll">
        <DetailBody film={film} />
      </div>
      <DetailActions id={film.id} />
    </>
  );
}

import { Suspense } from "react";
import { DetailActions } from "@/components/detail/DetailActions";
import { DetailBody } from "@/components/detail/DetailBody";
import { DetailError } from "@/components/detail/DetailError";
import { DetailNotFound } from "@/components/detail/DetailNotFound";
import { DetailSkeleton } from "@/components/detail/DetailSkeleton";
import { Sheet } from "@/components/detail/Sheet";
import { parseMovieId } from "@/lib/movie";
import { getDetailForRoute } from "@/lib/tmdb/api";

export function generateStaticParams() {
  return [{ id: "38551" }];
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
  const id = parseMovieId((await params).id);
  // Không gọi notFound() ở đây: ranh giới not-found nằm ngoài Sheet nên sheet sẽ mất. Báo ngay trong sheet.
  if (id == null) return <DetailNotFound />;
  const r = await getDetailForRoute(id);
  if (!r.ok) return r.reason === "not_found" ? <DetailNotFound /> : <DetailError />;
  return (
    <>
      <div className="sheet-scroll">
        <DetailBody film={r.data} />
      </div>
      <DetailActions id={r.data.id} />
    </>
  );
}

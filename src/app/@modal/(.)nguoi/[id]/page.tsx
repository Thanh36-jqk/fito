import { Suspense } from "react";
import { DetailError } from "@/components/detail/DetailError";
import { DetailNotFound } from "@/components/detail/DetailNotFound";
import { MorphSkeleton } from "@/components/detail/MorphSkeleton";
import { Sheet } from "@/components/detail/Sheet";
import { PersonBody } from "@/components/person/PersonBody";
import { parseMovieId } from "@/lib/movie";
import { getPersonForRoute } from "@/lib/tmdb/api";

/* id -1 là người mẫu offline: build không gọi TMDB nên không vỡ khi API chập chờn. */
export function generateStaticParams() {
  return [{ id: "-1" }];
}

/* Sheet hiện ngay; nội dung đọc params nằm trong Suspense để điều hướng tức thì. */
export default function NguoiModal({ params }: PageProps<"/nguoi/[id]">) {
  return (
    <Sheet label="pTitle">
      <Suspense fallback={<MorphSkeleton />}>
        <ModalContent params={params} />
      </Suspense>
    </Sheet>
  );
}

async function ModalContent({ params }: { params: PageProps<"/nguoi/[id]">["params"] }) {
  const id = parseMovieId((await params).id);
  // Không gọi notFound() ở đây: ranh giới not-found nằm ngoài Sheet nên sheet sẽ mất. Báo ngay trong sheet.
  if (id == null) return <DetailNotFound />;
  const r = await getPersonForRoute(id);
  if (!r.ok) return r.reason === "not_found" ? <DetailNotFound /> : <DetailError />;
  return (
    <div className="sheet-scroll">
      <PersonBody person={r.data} />
    </div>
  );
}

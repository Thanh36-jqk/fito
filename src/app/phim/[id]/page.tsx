import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { DetailActions } from "@/components/detail/DetailActions";
import { DetailBody } from "@/components/detail/DetailBody";
import { DetailError } from "@/components/detail/DetailError";
import { DetailSkeleton } from "@/components/detail/DetailSkeleton";
import { parseMovieId } from "@/lib/movie";
import { getFilmScores, getMyFilmStatus, snapOf } from "@/lib/journal";
import { getDetailForRoute } from "@/lib/tmdb/api";

/* cacheComponents cần ít nhất 1 mẫu để kiểm lúc build; id khác render khi có request.
   Dùng id mẫu âm (dữ liệu offline, không gọi TMDB/điểm ngoài) để build không phụ thuộc mạng. */
export function generateStaticParams() {
  return [{ id: "-1" }];
}

export async function generateMetadata({ params }: PageProps<"/phim/[id]">): Promise<Metadata> {
  const id = parseMovieId((await params).id);
  const r = id == null ? null : await getDetailForRoute(id);
  const film = r?.ok ? r.data : null;
  if (!film) return { title: "Không tìm thấy phim" };
  const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  const description = film.overview?.text
    ? clip(film.overview.text, 160)
    : `${film.year ?? "—"} · ${film.genres.join(", ") || "—"}`;
  // openGraph ở đây thay hẳn của layout (merge nông) nên ghi đủ trường; ảnh lấy từ opengraph-image.tsx
  return {
    title: film.title,
    description,
    openGraph: { type: "video.movie", siteName: "Fito", locale: "vi_VN", title: film.title, description },
  };
}

/* Mở trực tiếp bằng link (hoặc tải lại trang). Bấm từ list thì @modal/(.)phim/[id] chặn và mở dạng sheet. */
export default function PhimPage({ params }: PageProps<"/phim/[id]">) {
  return (
    <div className="mx-auto max-w-[900px]">
      <Link href="/" className="mb-3 inline-flex min-h-11 items-center gap-1 font-extrabold text-muted hover:text-fg">
        <ChevronLeft className="size-5" aria-hidden /> Về Rạp
      </Link>
      <article className="overflow-hidden rounded-[28px] border-2 border-line bg-bg">
        <Suspense fallback={<DetailSkeleton />}>
          <PageContent params={params} />
        </Suspense>
      </article>
    </div>
  );
}

async function PageContent({ params }: { params: PageProps<"/phim/[id]">["params"] }) {
  const id = parseMovieId((await params).id);
  if (id == null) notFound();
  const [r, status, scores] = await Promise.all([getDetailForRoute(id), getMyFilmStatus(id), getFilmScores(id)]);
  if (!r.ok) {
    if (r.reason === "not_found") notFound();
    return <DetailError />;
  }
  return (
    <>
      <div className="sheet-scroll">
        <DetailBody film={r.data} />
      </div>
      <DetailActions
        id={r.data.id}
        snap={snapOf(r.data)}
        initialWanted={status.wanted}
        initialWatched={status.watched}
        initialScores={scores}
        className="sticky bottom-[calc(84px+env(safe-area-inset-bottom,0px))] lg:bottom-0"
      />
    </>
  );
}

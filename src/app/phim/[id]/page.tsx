import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { DetailActions } from "@/components/detail/DetailActions";
import { DetailBody } from "@/components/detail/DetailBody";
import { DetailSkeleton } from "@/components/detail/DetailSkeleton";
import { FILMS, getFilm } from "@/lib/films";

export function generateStaticParams() {
  return FILMS.map((f) => ({ id: String(f.id) }));
}

export async function generateMetadata({ params }: PageProps<"/phim/[id]">): Promise<Metadata> {
  const film = getFilm(Number((await params).id));
  return { title: film?.vi ?? "Không tìm thấy phim" };
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
  const film = getFilm(Number((await params).id));
  if (!film) notFound();
  return (
    <>
      <div className="sheet-scroll">
        <DetailBody film={film} />
      </div>
      <DetailActions id={film.id} className="sticky bottom-[calc(84px+env(safe-area-inset-bottom,0px))] lg:bottom-0" />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { DetailError } from "@/components/detail/DetailError";
import { DetailSkeleton } from "@/components/detail/DetailSkeleton";
import { PersonBody } from "@/components/person/PersonBody";
import { parseMovieId } from "@/lib/movie";
import { getPersonForRoute } from "@/lib/tmdb/api";

/* cacheComponents cần ít nhất 1 mẫu để kiểm lúc build; id -1 là người mẫu offline (không gọi TMDB). */
export function generateStaticParams() {
  return [{ id: "-1" }];
}

export async function generateMetadata({ params }: PageProps<"/nguoi/[id]">): Promise<Metadata> {
  const id = parseMovieId((await params).id);
  const r = id == null ? null : await getPersonForRoute(id);
  const person = r?.ok ? r.data : null;
  if (!person) return { title: "Không tìm thấy người" };
  return {
    title: person.name,
    description: person.role ?? undefined,
    openGraph: { type: "profile", siteName: "Fito", locale: "vi_VN", title: person.name },
  };
}

/* Mở trực tiếp bằng link (hoặc tải lại trang). Bấm từ trong app thì @modal/(.)nguoi/[id] chặn và mở dạng sheet. */
export default function NguoiPage({ params }: PageProps<"/nguoi/[id]">) {
  return (
    <div className="mx-auto max-w-[900px]">
      <Link href="/" className="mb-3 inline-flex min-h-11 items-center gap-1 font-extrabold text-muted hover:text-fg">
        <ChevronLeft className="size-5" aria-hidden /> Về trang chủ
      </Link>
      <article className="overflow-hidden rounded-[28px] border-2 border-line bg-bg">
        <Suspense fallback={<DetailSkeleton />}>
          <PageContent params={params} />
        </Suspense>
      </article>
    </div>
  );
}

async function PageContent({ params }: { params: PageProps<"/nguoi/[id]">["params"] }) {
  const id = parseMovieId((await params).id);
  if (id == null) notFound();
  const r = await getPersonForRoute(id);
  if (!r.ok) {
    if (r.reason === "not_found") notFound();
    return <DetailError />;
  }
  return (
    <div className="sheet-scroll">
      <PersonBody person={r.data} />
    </div>
  );
}

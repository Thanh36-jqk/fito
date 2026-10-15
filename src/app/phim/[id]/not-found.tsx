import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DetailNotFound } from "@/components/detail/DetailNotFound";

/* notFound() ở /phim/[id] (id sai hoặc TMDB 404): giữ khung trang chi tiết, chữ tiếng Việt. */
export default function PhimNotFound() {
  return (
    <div className="mx-auto max-w-[900px]">
      <Link href="/" className="mb-3 inline-flex min-h-11 items-center gap-1 font-extrabold text-muted hover:text-fg">
        <ChevronLeft className="size-5" aria-hidden /> Về Rạp
      </Link>
      <article className="overflow-hidden rounded-[28px] border-2 border-line bg-bg">
        <DetailNotFound />
      </article>
    </div>
  );
}

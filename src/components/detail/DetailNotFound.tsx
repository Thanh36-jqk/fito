import Link from "next/link";
import { EmptyState } from "../EmptyState";

/* Id sai hoặc TMDB trả 404. Dùng được cả trong sheet (@modal) lẫn trang /phim/[id]. h2 ẩn để dialog vẫn có tên. */
export function DetailNotFound() {
  return (
    <div className="sheet-scroll pt-14">
      <h2 id="dTitle" className="sr-only">Không tìm thấy phim này</h2>
      <EmptyState mood="sad" title="Không tìm thấy phim này">
        Có thể link bị sai, hoặc phim không còn trên TMDB.
      </EmptyState>
      <Link href="/" className="btn btn-ghost mx-auto mb-6 w-fit">
        Về Rạp
      </Link>
    </div>
  );
}

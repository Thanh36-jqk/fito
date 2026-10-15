import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = { title: "Không tìm thấy" };

/* Link không khớp trang nào (thay trang 404 tiếng Anh mặc định của Next). */
export default function NotFound() {
  return (
    <section className="pt-10">
      <EmptyState mood="sad" title="Không tìm thấy trang này">
        Có thể link bị sai hoặc trang đã đổi chỗ.
      </EmptyState>
      <Link href="/" className="btn btn-ghost mx-auto w-fit">
        Về Rạp
      </Link>
    </section>
  );
}

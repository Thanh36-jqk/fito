import type { Metadata } from "next";
import { Hello } from "@/components/Hello";
import { PickCta } from "@/components/film/PickCta";
import { HomeView } from "@/components/home/HomeView";
import { getHomeVN, settle } from "@/lib/tmdb/api";

export const metadata: Metadata = { title: "Ở nhà" };

export default async function ONhaPage() {
  const home = await settle(getHomeVN());
  return (
    <section>
      <Hello lead="Ở nhà thì" highlight="xem gì?" />
      <PickCta where="home" title="Lọc phim trên mạng" sub="Chọn thể loại, độ dài, nền tảng hai đứa đang dùng." />
      <HomeView data={home.ok ? home.data : null} />
    </section>
  );
}

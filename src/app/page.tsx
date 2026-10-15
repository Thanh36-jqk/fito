import { Hello } from "@/components/Hello";
import { Marquee } from "@/components/Marquee";
import { PickCta } from "@/components/film/PickCta";
import { RapView } from "@/components/film/RapView";
import { FILMS } from "@/lib/films";

export default function RapPage() {
  const n = FILMS.filter((f) => f.when === "now").length;
  return (
    <section>
      <Hello lead="Tối nay hai đứa" highlight="xem gì?" />
      <PickCta title="Chưa biết xem gì?" sub="Chọn ra rạp hay ở nhà, thể loại, độ dài. Bắp lọc ra list giùm." />
      <Marquee
        label="Đang chiếu theo TMDB"
        text={`ĐANG CHIẾU · ${n} PHIM · CẬP NHẬT THEO TMDB · CHIỀU NAY ĐI XEM GÌ ĐÂY · RỦ NHAU ĐI RẠP ĐI · `}
      />
      <RapView />
    </section>
  );
}

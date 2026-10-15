import { Hello } from "@/components/Hello";
import { Marquee } from "@/components/Marquee";
import { PickCta } from "@/components/film/PickCta";
import { RapView } from "@/components/film/RapView";
import { getNowPlayingVN, getUpcomingVN, settle } from "@/lib/tmdb/api";

export default async function RapPage() {
  const [now, soon] = await Promise.all([settle(getNowPlayingVN()), settle(getUpcomingVN())]);
  const nowList = now.ok ? now.data : [];
  const nowIds = new Set(nowList.map((f) => f.id));
  const soonList = soon.ok ? soon.data.filter((f) => !nowIds.has(f.id)) : [];
  return (
    <section>
      <Hello lead="Tối nay hai đứa" highlight="xem gì?" />
      <PickCta title="Chưa biết xem gì?" sub="Chọn ra rạp hay ở nhà, thể loại, độ dài. Bắp lọc ra list giùm." />
      <Marquee
        label="Đang chiếu theo TMDB"
        text={`ĐANG CHIẾU · ${nowList.length} PHIM · CẬP NHẬT THEO TMDB · CHIỀU NAY ĐI XEM GÌ ĐÂY · RỦ NHAU ĐI RẠP ĐI · `}
      />
      <RapView now={nowList} soon={soonList} nowError={!now.ok} soonError={!soon.ok} />
    </section>
  );
}

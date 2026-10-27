import { Suspense } from "react";
import { Hello } from "@/components/Hello";
import { Marquee } from "@/components/Marquee";
import { PosterRowSkeleton, TicketGridSkeleton } from "@/components/Skeleton";
import { PickCta } from "@/components/film/PickCta";
import { RapView } from "@/components/film/RapView";
import { overlayScores } from "@/lib/movie-cache";
import { getNowPlayingVN, getUpcomingVN, settle } from "@/lib/tmdb/api";

export default function RapPage() {
  return (
    <section>
      <Hello lead="Tối nay hai đứa" highlight="xem gì?" />
      <PickCta title="Chưa biết xem gì?" sub="Chọn ra rạp hay ở nhà, thể loại, độ dài. Bắp lọc ra list giùm." />
      <Suspense fallback={<RapFallback />}>
        <RapSection />
      </Suspense>
    </section>
  );
}

function RapFallback() {
  return (
    <>
      <div className="sec-h">
        <h2>Đang chiếu</h2>
      </div>
      <PosterRowSkeleton />
      <div className="sec-h">
        <h2>Sắp chiếu</h2>
      </div>
      <TicketGridSkeleton />
    </>
  );
}

/* Dữ liệu động (điểm cache đọc cookie) nằm trong Suspense theo yêu cầu cacheComponents. */
async function RapSection() {
  const [now, soon] = await Promise.all([settle(getNowPlayingVN()), settle(getUpcomingVN())]);
  const nowList = await overlayScores(now.ok ? now.data : []);
  const nowIds = new Set(nowList.map((f) => f.id));
  const soonList = await overlayScores(soon.ok ? soon.data.filter((f) => !nowIds.has(f.id)) : []);
  return (
    <>
      <Marquee
        label="Đang chiếu theo TMDB"
        text={`ĐANG CHIẾU · ${nowList.length} PHIM · CẬP NHẬT THEO TMDB · CHIỀU NAY ĐI XEM GÌ ĐÂY · RỦ NHAU ĐI RẠP ĐI · `}
      />
      <RapView now={nowList} soon={soonList} nowError={!now.ok} soonError={!soon.ok} />
    </>
  );
}

import { EmptyState } from "@/components/EmptyState";
import { Hello } from "@/components/Hello";
import { Marquee } from "@/components/Marquee";

export default function RapPage() {
  return (
    <section>
      <Hello lead="Tối nay hai đứa" highlight="xem gì?" />
      <Marquee
        label="Đang chiếu theo TMDB"
        text="ĐANG CHIẾU · CẬP NHẬT THEO TMDB · CHIỀU NAY ĐI XEM GÌ ĐÂY · RỦ NHAU ĐI RẠP ĐI · "
      />
      <EmptyState mood="wow" title="Rạp đang dọn ghế" hand="pha 2 nối TMDB là có phim thật">
        Phim đang chiếu và sắp chiếu ở VN sẽ hiện ở đây, kèm băng poster cuộn và lưới cuống vé.
      </EmptyState>
    </section>
  );
}

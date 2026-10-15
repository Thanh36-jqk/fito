// DỮ LIỆU MẪU (phim giả) để dựng giao diện. Pha 2 thay bằng TMDB/OMDb/Trakt qua movie_cache.
import { totalScore, type Scores } from "./score";

export type Where = "now" | "soon" | "home";
export type Motif = "sun" | "moon" | "stripes" | "waves" | "grid" | "door" | "dune";

export type Film = {
  id: number;
  vi: string;
  en: string;
  year: number;
  min: number;
  genres: string[];
  when: Where;
  date?: string;
  providers?: string[];
  c1: string;
  c2: string;
  motif: Motif;
  sum: string;
  sc: Scores;
};

const none: Scores = { imdb: null, rt: null, mc: null, tmdb: null, trakt: null };

export const FILMS: Film[] = [
  { id: 1, vi: "Mùa Hè Năm Ấy", en: "That Summer", year: 2026, min: 112, genres: ["Tình cảm", "Hài"], when: "now", c1: "#FF7AA8", c2: "#6B4CFF", motif: "sun",
    sum: "Hai đứa bạn thân về quê ngoại một mùa hè, tìm lại cuốn sổ lưu bút chôn dưới gốc phượng từ năm lớp 9.",
    sc: { imdb: { v: 7.8, votes: 12400 }, rt: { v: 91 }, mc: { v: 78 }, tmdb: { v: 7.9, votes: 860 }, trakt: { v: 8.1, votes: 1500 } } },
  { id: 2, vi: "Ký Túc Xá Số 7", en: "Dorm 7", year: 2026, min: 98, genres: ["Kinh dị"], when: "now", c1: "#24264F", c2: "#3FB68B", motif: "moon",
    sum: "Phòng 7 khu B tắt đèn lúc 23 giờ, nhưng mỗi đêm vẫn có ai đó gõ cửa ba tiếng.",
    sc: { imdb: { v: 6.4, votes: 3100 }, rt: { v: 58 }, mc: { v: 52 }, tmdb: { v: 6.6, votes: 240 }, trakt: { v: 6.2, votes: 40 } } },
  { id: 3, vi: "Tốc Độ 404", en: "Error 404: Speed", year: 2026, min: 126, genres: ["Hành động"], when: "now", c1: "#FF5A36", c2: "#B8126B", motif: "stripes",
    sum: "Một shipper công nghệ vô tình nhận đơn hàng chứa chìa khoá của cả hệ thống đèn giao thông thành phố.",
    sc: { imdb: { v: 7.1, votes: 8800 }, rt: { v: 74 }, mc: null, tmdb: { v: 7.3, votes: 510 }, trakt: { v: 7.0, votes: 620 } } },
  { id: 4, vi: "Nàng Tiên Cá Quận 4", en: "Mermaid of District 4", year: 2026, min: 104, genres: ["Hài", "Tình cảm"], when: "now", c1: "#2EC4C0", c2: "#2A3BFF", motif: "waves",
    sum: "Cô nàng bán ốc ven kênh tuyên bố mình là tiên cá, và cả xóm quyết định tin cô.",
    sc: { imdb: { v: 5.6, votes: 1900 }, rt: { v: 41 }, mc: { v: 45 }, tmdb: { v: 5.9, votes: 180 }, trakt: { v: 5.4, votes: 95 } } },
  { id: 5, vi: "Robot Biết Khóc", en: "The Crying Robot", year: 2026, min: 95, genres: ["Hoạt hình"], when: "now", c1: "#7BC41A", c2: "#2F5BFF", motif: "grid",
    sum: "Robot dọn dẹp ở một tiệm net cũ học cách khóc sau khi chủ tiệm treo biển sang nhượng.",
    sc: { imdb: { v: 8.3, votes: 22000 }, rt: { v: 96 }, mc: { v: 85 }, tmdb: { v: 8.4, votes: 1900 }, trakt: { v: 8.5, votes: 3300 } } },
  { id: 6, vi: "Hẹn Em Ở Đà Lạt", en: "See You in Dalat", year: 2026, min: 108, genres: ["Tình cảm"], when: "soon", date: "24/10", c1: "#E98AC9", c2: "#4C3A8F", motif: "sun",
    sum: "Hai người lạ cùng thuê nhầm một homestay trong tuần sương mù dày nhất năm.", sc: none },
  { id: 7, vi: "Bão Cát", en: "Sandstorm", year: 2026, min: 131, genres: ["Hành động"], when: "soon", date: "07/11", c1: "#E0A04A", c2: "#7A2E1C", motif: "dune",
    sum: "Đội cứu hộ có 48 giờ để đưa đoàn làm phim ra khỏi đồi cát Mũi Né trước cơn bão.",
    sc: { ...none, imdb: { v: 6.9, votes: 320 } } },
  { id: 8, vi: "Đêm Trăng Rằm", en: "Mid-Autumn Night", year: 2026, min: 88, genres: ["Hoạt hình"], when: "soon", date: "14/11", c1: "#FFB443", c2: "#1E2A6E", motif: "moon",
    sum: "Chú thỏ ngọc bị lạc xuống phố đèn lồng Hội An đúng đêm rằm tháng Tám.", sc: none },
  { id: 9, vi: "Chuyện Nhà Bên", en: "Next Door Stories", year: 2025, min: 117, genres: ["Hài"], when: "home", providers: ["Netflix", "FPT Play"], c1: "#5BC0EB", c2: "#1B3A5C", motif: "door",
    sum: "Cả khu tập thể náo loạn khi nhà bên mở quán cà phê mèo ngay hành lang tầng ba.",
    sc: { imdb: { v: 7.4, votes: 5600 }, rt: { v: 82 }, mc: { v: 70 }, tmdb: { v: 7.5, votes: 430 }, trakt: { v: 7.6, votes: 880 } } },
  { id: 10, vi: "Cà Phê Muối", en: "Salted Coffee", year: 2025, min: 102, genres: ["Tình cảm", "Hài"], when: "home", providers: ["Netflix"], c1: "#C98B5A", c2: "#3B2A4F", motif: "sun",
    sum: "Cô barista Huế và anh khách Sài Gòn cãi nhau mỗi sáng vì một ly cà phê muối pha sai công thức.",
    sc: { imdb: { v: 7.2, votes: 4100 }, rt: { v: 86 }, mc: { v: 71 }, tmdb: { v: 7.4, votes: 390 }, trakt: { v: 7.3, votes: 700 } } },
  { id: 11, vi: "Thám Tử Hẻm 9", en: "Alley 9 Detective", year: 2025, min: 118, genres: ["Hành động", "Hài"], when: "home", providers: ["FPT Play", "Galaxy Play"], c1: "#FFCF3F", c2: "#C2185B", motif: "stripes",
    sum: "Bà bán xôi đầu hẻm phá án nhanh hơn cả công an phường, chỉ nhờ nghe ngóng giờ khách mua xôi.",
    sc: { imdb: { v: 6.8, votes: 2700 }, rt: { v: 69 }, mc: { v: 60 }, tmdb: { v: 7.0, votes: 260 }, trakt: { v: 6.7, votes: 310 } } },
  { id: 12, vi: "Chuyến Xe Cuối", en: "The Last Bus", year: 2024, min: 92, genres: ["Kinh dị"], when: "home", providers: ["Netflix"], c1: "#1C2B3A", c2: "#B23A48", motif: "moon",
    sum: "Chuyến xe buýt 23 giờ 50 không bao giờ dừng ở trạm cuối, và hành khách thì cứ ít dần.",
    sc: { imdb: { v: 6.1, votes: 3900 }, rt: { v: 55 }, mc: { v: 49 }, tmdb: { v: 6.3, votes: 300 }, trakt: { v: 6.0, votes: 420 } } },
  { id: 13, vi: "Bé Mèo Vũ Trụ", en: "Space Kitty", year: 2025, min: 85, genres: ["Hoạt hình"], when: "home", providers: ["VieON", "Galaxy Play"], c1: "#8B7CFF", c2: "#0F6E8C", motif: "grid",
    sum: "Một bé mèo hoang trèo nhầm lên tên lửa đồ chơi và trở thành phi hành gia đầu tiên của hẻm.",
    sc: { imdb: { v: 7.7, votes: 6200 }, rt: { v: 93 }, mc: { v: 80 }, tmdb: { v: 7.9, votes: 540 }, trakt: { v: 7.8, votes: 900 } } },
  { id: 14, vi: "Ngày Mai Tốt Nghiệp", en: "Graduation Tomorrow", year: 2025, min: 124, genres: ["Tình cảm"], when: "home", providers: ["Galaxy Play", "VieON"], c1: "#FF9F80", c2: "#5B3E96", motif: "waves",
    sum: "Đêm trước lễ tốt nghiệp, năm đứa bạn cùng lớp quyết định làm hết những gì cả ba năm chưa dám.",
    sc: { imdb: { v: 7.0, votes: 1800 }, rt: { v: 78 }, mc: null, tmdb: { v: 7.2, votes: 150 }, trakt: { v: 7.1, votes: 60 } } },
  { id: 15, vi: "Đảo Không Tên", en: "Nameless Island", year: 2024, min: 133, genres: ["Hành động"], when: "home", providers: ["Netflix", "Prime Video"], c1: "#2BB673", c2: "#123C69", motif: "dune",
    sum: "Nhóm thợ lặn tìm thấy một hòn đảo không có trên bản đồ, cùng một trạm radio vẫn đang phát.",
    sc: { imdb: { v: 7.5, votes: 15000 }, rt: { v: 84 }, mc: { v: 73 }, tmdb: { v: 7.6, votes: 1200 }, trakt: { v: 7.4, votes: 2100 } } },
];

export const getFilm = (id: number) => FILMS.find((f) => f.id === id);
export const total = (f: Film) => totalScore(f.sc);

export type Review = { src: "TMDB" | "Trakt"; who: string; d: string; t: string; spoiler?: boolean };

export const SAMPLE_REVIEWS: Review[] = [
  { src: "TMDB", who: "@popcorn_jun", d: "02/10/2026", t: "Nhịp phim nhanh, nhạc nền hay, xem xong muốn đi xem lại liền." },
  { src: "Trakt", who: "@midnight.reels", d: "05/10/2026", t: "Great chemistry between the leads. The third act drags a bit, but the ending lands." },
  { src: "Trakt", who: "@khoaitay", d: "09/10/2026", spoiler: true, t: "Đoạn cuối hoá ra người gửi thư suốt cả phim chính là đứa bạn thân ngồi cạnh. Mình khóc luôn." },
];

/* Hai người dùng mẫu. Pha 1 lấy từ allowed_users. */
export const ME = { name: "Mây", letter: "M" };
export const PARTNER = { name: "Nắng", letter: "N" };
/* Phim "người ấy" đã quẹt Muốn xem (mẫu). Pha 4 lấy từ swipes qua Realtime. */
export const PARTNER_WANTS = new Set([1, 3, 6, 5, 9, 10, 13]);

export function whereLabel(f: Film) {
  return f.when === "home" ? f.providers!.join(" · ") : f.when === "now" ? "Đang chiếu ngoài rạp" : "Ra rạp " + f.date;
}

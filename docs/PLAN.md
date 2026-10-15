# Fito — Kế hoạch phát triển

Chuyển từ tài liệu gốc "Phim Hai Đứa — Kế hoạch phát triển" (15/10/2026, @MCKMCK), cập nhật theo các quyết định trong [DECISIONS.md](DECISIONS.md). Nếu hai file lệch nhau, DECISIONS.md thắng.

Web app riêng tư cho hai người: gom điểm và bình luận phim từ TMDB, OMDb, Trakt để cùng chọn phim đi rạp hoặc xem ở nhà. Chạy miễn phí trên Vercel + Supabase, chia 5 pha.

## Mục tiêu và phạm vi

Hai người mở app, lọc nhanh ra phim đáng xem, cùng quẹt để tìm phim cả hai thích, xem xong thì ghi lại cảm nhận. Chỉ 2 tài khoản được dùng.

### Có trong bản đầu (MVP)

- Tab **Rạp**: phim đang chiếu và sắp chiếu ở VN.
- Tab **Ở nhà**: phim có trên các nền tảng xem phim ở VN.
- **Chọn phim**: chọn nơi xem (rạp / ở nhà) → thể loại → độ dài, điểm, nền tảng, sắp xếp → ra list phim. Đẩy list đó vào chồng quẹt được. Bản mẫu đã có luồng này.
- **Trang chi tiết**:
  - 5 điểm (IMDb, RT, Metacritic, TMDB, Trakt) và điểm tổng
  - trailer
  - bình luận (che spoiler kiểu vé cào)
- Bộ lọc và sắp xếp, tìm theo tên.
- Đăng nhập, chỉ cho 2 email.
- Quẹt Muốn xem / Bỏ qua, danh sách Match, cập nhật tức thì giữa hai máy.
- **Nhật ký**: đánh dấu đã xem, mỗi người chấm điểm và ghi chú.
- Dùng tốt trên **cả máy tính lẫn điện thoại**, cài lên màn hình chính được (PWA).

### Không có trong bản đầu

- Lịch chiếu và đặt vé theo từng rạp (CGV, Lotte, Galaxy không có API công khai).
- Lấy dữ liệu từ Letterboxd hoặc cào web.
- Thông báo đẩy, chat trong app.
- AI tóm tắt bình luận: để pha 5, tuỳ chọn.

## Nguồn dữ liệu

TMDB là nguồn chính, OMDb và Trakt bổ sung điểm và bình luận. Ba nguồn nối với nhau qua `imdb_id` mà TMDB trả về. Mọi lệnh gọi API chạy trên server, khoá không bao giờ lộ ra trình duyệt.

| Nguồn | Lấy gì | Endpoint chính | Giới hạn | Cache |
|---|---|---|---|---|
| TMDB | Phim đang/sắp chiếu VN, chi tiết, poster, trailer, thể loại, nền tảng xem ở VN, review, điểm TMDB, imdb_id | `/movie/now_playing?region=VN`, `/movie/upcoming?region=VN`, `/discover/movie?watch_region=VN`, `/movie/{id}?append_to_response=videos,reviews,watch/providers,external_ids`, `/search/movie` | ~40–50 lượt/giây, miễn phí phi thương mại, phải ghi nguồn TMDB | Danh sách 6 giờ, chi tiết 24 giờ |
| OMDb | Điểm IMDb, Rotten Tomatoes, Metacritic + số lượt IMDb | `/?i={imdb_id}` | 1.000 lượt/ngày (free) | 24 giờ |
| Trakt | Điểm Trakt, số phiếu, bình luận (có cờ spoiler) | `/movies/{imdb_id}/ratings`, `/movies/{imdb_id}/comments/likes` | Miễn phí, cần client_id, ~1.000 lượt/5 phút | 24 giờ |

Các con số giới hạn là gần đúng, cần kiểm lại khi đăng ký khoá.

### Cách tính điểm tổng (thang 10)

- Quy đổi: IMDb, TMDB, Trakt giữ nguyên; RT và Metacritic chia 10.
- Chỉ lấy trung bình các nguồn có điểm. Nguồn thiếu hiện "—".
- Nguồn có dưới 50 lượt đánh giá bị loại khỏi điểm tổng, để tránh lệch.
- Mức điểm:

  | Điểm tổng | Mức | Chữ trên con dấu |
  |---|---|---|
  | từ 7.5 | tốt | ĐỈNH NÓC |
  | 6 đến 7.4 | tạm | CŨNG ĐƯỢC |
  | dưới 6 | kém | NÉ GẤP |

- Tiết kiệm lượt gọi OMDb:
  - Chỉ gọi khi có người mở trang chi tiết, hoặc khi phim đang hiển thị mà chưa có cache.
  - Mỗi ngày một cron làm mới khoảng 150 phim hot.

## Kiến trúc

App chỉ nói chuyện với server Next.js và Supabase. Server là nơi duy nhất gọi TMDB, OMDb, Trakt, rồi ghi kết quả vào `movie_cache`. Match đi thẳng từ Supabase Realtime xuống hai máy.

## Mô hình dữ liệu (Supabase, mọi bảng bật RLS)

Chỉ 2 user trong `allowed_users` được đọc và ghi. Phim nhận diện bằng `tmdb_id`.

| Bảng | Cột chính | Ghi chú |
|---|---|---|
| `allowed_users` | email (PK), display_name, avatar_letter | 2 dòng, nhập tay. Trigger chặn đăng ký email khác |
| `movie_cache` | tmdb_id (PK), imdb_id, title_vi, title_en, year, runtime, genres[], poster_path, backdrop_path, trailer_key, providers_vn (jsonb), scores (jsonb), score_total, tmdb_fetched_at, omdb_fetched_at, trakt_fetched_at | Mỗi nguồn một mốc thời gian để làm mới riêng |
| `swipes` | user_id, tmdb_id, decision (want / skip), created_at. PK (user_id, tmdb_id) | Quẹt lại thì ghi đè |
| `matches` (view) | tmdb_id, matched_at | Phim có 2 dòng `want` từ 2 user khác nhau. Realtime lắng nghe `swipes` |
| `watch_log` | id, tmdb_id, watched_on, where (cinema / home), user_id, my_score (1–10), note | Mỗi người một dòng cho mỗi lần xem |

Cấu trúc `scores`: `{ imdb: {v, votes}, rt: {v}, mc: {v}, tmdb: {v, votes}, trakt: {v, votes} }`. Giá trị `null` khi nguồn không có.

## Màn hình

Điều hướng có 4 tab: Rạp · Ở nhà · Match · Nhật ký.
- Trên điện thoại: thanh tab nổi ở dưới.
- Trên máy tính: thanh dọc bên trái.

| Màn hình | Đường dẫn | Thành phần chính | Pha |
|---|---|---|---|
| Đăng nhập | `/login` | Ô email, gửi link đăng nhập, báo lỗi khi email không được phép | 1 |
| Rạp | `/` | Bảng đèn chạy chữ, nút "Chưa biết xem gì?", chip lọc, băng poster Đang chiếu, lưới Sắp chiếu | 2 |
| Ở nhà | `/o-nha` | Nút lọc phim trên mạng, chip nền tảng, lưới phim, cuộn vô hạn | 2 |
| Chọn phim | khung trượt | Nơi xem → thể loại → độ dài/điểm/nền tảng/sắp xếp → list, đẩy list vào chồng quẹt | 3 |
| Chi tiết phim | `/phim/[tmdbId]` | Ảnh nền, 5 vòng điểm, con dấu điểm tổng, trailer, nơi xem, bình luận (cào để đọc spoiler), nút Hóng / Xem rồi nha | 2 |
| Tìm kiếm | `/tim` | Ô tìm, kết quả hiện ngay khi gõ | 3 |
| Quẹt | trong tab Match | Chồng thẻ, nút X / tim, dòng "Người ấy cũng đang quẹt" | 4 |
| Match | `/match` | Danh sách phim cả hai muốn xem, lọc Rạp/Ở nhà, màn "Trùng gu rồi!" | 4 |
| Nhật ký | `/nhat-ky` | Dòng thời gian phim đã xem, điểm và ghi chú của từng người | 4 |
| Cài đặt | `/cai-dat` | Chọn bảng màu, nền tảng đang dùng, đăng xuất | 3 |

Mỗi màn có 3 trạng thái bắt buộc:
- **Đang tải:** khung xương giữ chỗ.
- **Trống:** Bắp cùng một lời mời làm gì tiếp.
- **Lỗi:** nói rõ nguồn nào lỗi, phần còn lại của app vẫn chạy.

## Lộ trình

5 pha. Mỗi pha kết thúc bằng một bản chạy được trên Vercel. Ước lượng khoảng 12–15 buổi tối, mỗi buổi ~3 giờ.

### Pha 1 — Nền móng
- [x] Tạo app Next.js + TypeScript + Tailwind trong `D:\Fito`
- [x] Đưa token màu, font, 3 theme từ `prototype/vibe.html` vào `globals.css`
- [x] Khung app: điều hướng 4 tab có ô chọn trượt, responsive cho cả điện thoại và máy tính
- [ ] Tạo project Supabase, chạy migration 5 bảng + RLS
- [ ] Đăng nhập bằng link email, chặn email ngoài `allowed_users`
- [ ] Proxy (middleware): chưa đăng nhập thì chuyển về `/login`
- [ ] `.env.example`, README, deploy lần đầu lên Vercel

> **16/10/2026:** Giao diện của pha 2, 3, 4 đã làm xong với dữ liệu mẫu: Rạp, Ở nhà, Chi tiết, Chọn phim, Quẹt, Match, màn Trùng gu. Các mục bên dưới chỉ được tick khi đã chạy bằng dữ liệu thật hoặc Supabase.

### Pha 2 — Dữ liệu và điểm
- [ ] `lib/tmdb.ts`: now_playing, upcoming, discover theo nền tảng VN, chi tiết, tìm kiếm
- [ ] `lib/omdb.ts`, `lib/trakt.ts`: lấy điểm và bình luận theo imdb_id
- [ ] `lib/score.ts`: chuẩn hoá thang 10, tính điểm tổng, có test Vitest
- [ ] Cache vào `movie_cache` theo mốc thời gian từng nguồn
- [ ] Tab Rạp: băng poster cuộn, nghiêng 3D, nền đổi màu theo poster
- [ ] Tab Ở nhà: lưới phim theo nền tảng, cuộn vô hạn
- [ ] Trang chi tiết: vòng điểm, điểm tổng đếm lên, trailer, nơi xem, bình luận che spoiler
- [ ] Nguồn lỗi thì hiện "—", trang vẫn chạy

### Pha 3 — Lọc, tìm, chọn phim, cài đặt
- [ ] Luồng chọn phim 4 bước như bản mẫu
- [ ] Chip lọc nhanh + khung lọc nâng cao, lưu trên URL
- [ ] Sắp xếp theo điểm tổng, độ hot, ngày ra mắt
- [ ] Tìm theo tên Việt và tên Anh, đợi 300ms sau khi ngừng gõ mới tìm
- [ ] Cài đặt: chọn bảng màu, nền tảng đang dùng

### Pha 4 — Hai người
- [ ] Chồng thẻ quẹt: kéo bằng tay hoặc bấm nút, ghi vào `swipes`
- [ ] Realtime: người kia quẹt trùng thì màn "Trùng gu rồi!" hiện ngay
- [ ] Tab Match: danh sách, lọc Rạp/Ở nhà
- [ ] Nhật ký: đánh dấu đã xem, mỗi người chấm điểm và ghi chú

### Pha 5 — Hoàn thiện
- [ ] PWA: manifest, icon, cài lên màn hình chính, cache poster
- [ ] Vercel Cron làm mới ~150 phim hot mỗi ngày
- [ ] Kiểm tra tương phản, vùng chạm, giảm chuyển động
- [ ] Playwright cho luồng đăng nhập → xem chi tiết → quẹt → match
- [ ] (Tuỳ chọn) AI tóm tắt bình luận sang tiếng Việt

## Tiêu chí nghiệm thu

Mỗi dòng chỉ có hai kết quả: đạt hoặc không đạt.

**Dữ liệu và điểm**
- [ ] Tab Rạp hiện phim đang chiếu và sắp chiếu ở VN từ TMDB
- [ ] Tab Ở nhà hiện phim theo nền tảng xem ở VN
- [ ] Mỗi phim có đủ: poster, tên Việt và tên gốc, năm, thể loại, độ dài, tóm tắt, trailer, nơi xem
- [ ] Hiện đủ 5 điểm kèm số lượt đánh giá; nguồn thiếu hiện "—"
- [ ] Điểm tổng đúng công thức, có test cho trường hợp thiếu nguồn
- [ ] Bình luận TMDB và Trakt có ghi nguồn, tác giả, ngày; spoiler bị che

**Lọc và tìm**
- [ ] Lọc được theo điểm, thể loại, năm, độ dài, nền tảng
- [ ] Đổi bộ lọc thì danh sách cập nhật dưới 1 giây
- [ ] Tìm được bằng tên Việt lẫn tên Anh

**Hai người**
- [ ] Quẹt trùng thì phim vào Match; máy kia thấy trong dưới 2 giây, không cần tải lại
- [ ] Nhật ký lưu điểm và ghi chú riêng của từng người

**Bảo mật**
- [ ] Email thứ 3 không đăng nhập được
- [ ] Chưa đăng nhập thì không xem được trang hay API nào
- [ ] Không có khoá API nào trong mã gửi xuống trình duyệt

**Giao diện và hiệu năng**
- [ ] Hiệu ứng mượt, không giật trên điện thoại tầm trung
- [ ] Không tràn ngang ở 375px; bố cục máy tính dùng tốt từ 1024px trở lên
- [ ] OMDb dưới 1.000 lượt/ngày khi dùng bình thường
- [ ] Một nguồn API hỏng thì app vẫn chạy
- [ ] Cài được như app
- [ ] Tương phản chữ ≥ 4.5:1, vùng chạm ≥ 44px, tắt hiệu ứng khi máy bật giảm chuyển động
- [ ] Chi phí chạy 0đ/tháng

## Rủi ro và cách xử lý

| Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|
| Supabase gói free tạm dừng project sau ~7 ngày không hoạt động | Không đăng nhập được | Vercel Cron chạy hằng ngày có ghi vào DB, nên project luôn có hoạt động |
| OMDb hết 1.000 lượt/ngày | Thiếu điểm IMDb, RT, Metacritic | Cache 24 giờ, chỉ gọi khi cần; hết lượt thì dùng cache cũ và hiện "—" |
| "Đang chiếu VN" của TMDB lệch với rạp thật | Có phim đã rời rạp, hoặc thiếu phim mới | Ghép cả `now_playing` và `upcoming`; ghi rõ "theo TMDB" trên giao diện |
| Thiếu dữ liệu nền tảng FPT Play, Galaxy Play | Tab Ở nhà vắng phim nền tảng nội | Kiểm tra sớm ở pha 2; nếu thiếu thì cho người dùng tự gắn nền tảng cho phim |
| Bình luận chủ yếu tiếng Anh | Khó đọc nhanh | Pha 5: AI tóm tắt sang tiếng Việt (tuỳ chọn) |
| Hiệu ứng nặng trên điện thoại yếu | Giật, tốn pin | Chỉ animate transform và opacity; tắt nghiêng 3D trên máy cảm ứng |
| Điều khoản TMDB và JustWatch | Vi phạm nếu không ghi nguồn | Chân trang ghi nguồn TMDB; phần nơi xem ghi "dữ liệu JustWatch" |

## Nguồn tham khảo

- TMDB API docs, OMDb API, Trakt API docs
- Supabase docs
- Next.js docs (bản đi kèm package: `node_modules/next/dist/docs/`)

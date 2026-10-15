# Fito — Quyết định đã chốt

Nguồn sự thật cho mọi phiên làm việc. Đọc file này trước khi code. Quyết định mới thì thêm vào cuối mục **Nhật ký**, không sửa lặng lẽ dòng cũ.

## Sản phẩm

- **Tên:** Fito (trước đây là "Phim Hai Đứa").
- **Là gì:** **web app** riêng tư cho 2 người, gom điểm và bình luận phim (TMDB, OMDb, Trakt) để chọn phim đi rạp hoặc xem ở nhà.
- **Web app, không chỉ cho điện thoại:** phải dùng tốt trên cả điện thoại lẫn máy tính.
  - Dưới 1024px: bố cục điện thoại, thanh tab dạng viên thuốc nổi ở dưới.
  - Từ 1024px: thanh điều hướng dọc bên trái, nội dung rộng hơn, lưới nhiều cột.
  - Có PWA để cài lên màn hình chính, nhưng chạy trong trình duyệt là cách dùng chính.
- **Ưu tiên số 1:** đẹp, bắt mắt, hiệu ứng mượt. Không cần tối ưu SEO hay tốc độ tải tới mức tối đa.
  - Riêng animation thì vẫn phải đạt 60fps trên điện thoại, vì giật là mất "mượt".
- Kế hoạch đầy đủ (phạm vi, nguồn dữ liệu, mô hình dữ liệu, 5 pha, tiêu chí nghiệm thu): [PLAN.md](PLAN.md).

## Thiết kế: vibe "Sổ Tay Hai Đứa"

- **Bản mẫu gốc:** [`prototype/vibe.html`](../prototype/vibe.html). Mở trực tiếp bằng trình duyệt.
  - Bản publish: https://claude.ai/artifact/LvZ4HywJ2NBjZBePHyYy2R
  - **Giữ nguyên giao diện này khi code app thật.** Người dùng đã duyệt.
- **Nền:** Pop Cinema (nền tối, neon) cộng thêm lớp scrapbook:
  - sticker viền trắng, bóng đổ cứng, nghiêng nhẹ
  - cuống vé có khía hai bên và đường đục lỗ
  - grain tĩnh, halftone trên poster
  - nét vẽ tay (gạch chân, mũi tên)
  - photobooth
- **3 bảng màu**, đổi bằng `data-palette` trên `<html>`. Mặc định Neon.

  | Bảng | `--bg` | `--surface` | `--accent` | `--accent-2` | `--muted` | `--sticker` |
  |---|---|---|---|---|---|---|
  | Neon | #0D0E1A | #171829 | #C6F432 | #8B7CFF | #B3B5CF | #FF6BD6 |
  | Kẹo | #16121F | #211A2E | #FFB4A2 | #B8A6FF | #C3B4CC | #7FE0C4 |
  | Hoàng hôn | #120F0D | #1E1915 | #FF8A3D | #4FD1C5 | #C2B3A6 | #FFD23F |

  Màu ngữ nghĩa dùng chung: tốt `#9BE36A`, tạm `#FFC857`, kém `#FF8080`.
- **Font:**
  - Baloo 2 (700–800): tiêu đề, tên phim, điểm lớn
  - Nunito (500–800): chữ thường
  - Mali (500–600): ghi chú viết tay
  - Số dùng `tabular-nums`. Chữ tối thiểu 12px, bình luận 15px với dãn dòng 1.65.
- **Bo góc to:** thẻ 24px, sticker và chip bo tròn hẳn.
- **Mức điểm tổng (thang 10):**
  - từ 7.5: "ĐỈNH NÓC"
  - 6 đến 7.4: "CŨNG ĐƯỢC"
  - dưới 6: "NÉ GẤP"
  - không có nguồn nào đủ điểm: "CHƯA ĐỦ ĐIỂM"
- **Giọng văn:** thân mật kiểu "tớ/cậu", đôi chút teen ("Hóng", "Chốt đơn", "Thôi né", "Trùng gu rồi!").
  - Toàn bộ chữ tiếng Việt.
  - Gom chữ hiển thị vào một chỗ để dễ thay khi tiếng lóng cũ đi.
- **Linh vật Bắp:** xô bắp rang vẽ bằng SVG, có biểu cảm vui, buồn, ngạc nhiên. Dùng ở màn trống, màn lỗi, màn đang tải.
- **Quy tắc cố định:**
  - Chỉ có chế độ tối.
  - Không dùng emoji làm icon. Icon lấy từ Lucide; bắp, vé, sticker là SVG tự vẽ.
  - Tương phản chữ ≥ 4.5:1. Vùng chạm ≥ 44px.
  - Tắt hết hiệu ứng khi máy bật giảm chuyển động (`prefers-reduced-motion`).
  - Hiệu ứng chủ yếu xuất hiện khi có tương tác. Hiệu ứng nền chạy liên tục chỉ có: dòng chữ bảng đèn rạp, chấm "đang quẹt".
  - Chỉ animate `transform` và `opacity`.

## Tech stack (chốt 15/10/2026)

Chọn **bản ổn định mới nhất đã ra được ít nhất ~1 tuần**, không dùng beta/canary. Version cài đặt cố định trong `package.json` bằng `--save-exact`.

| Lớp | Chọn | Version | Ghi chú |
|---|---|---|---|
| Framework | Next.js App Router + TypeScript | next 16.4.0, react 19.3.0 | `cacheComponents` bật sẵn. Đọc `node_modules/next/dist/docs/` trước khi dùng API (xem AGENTS.md) |
| Style | Tailwind CSS v4 + CSS variables | 4.3.3 | Token nằm trong `src/app/globals.css`. Component đặc thù (`.ticket`, `.sticker`, `.poster`…) giữ dạng CSS class chép từ bản mẫu |
| Hiệu ứng chính | Motion (`motion/react`) | 14.0.0 | Lò xo, kéo thẻ quẹt, `layoutId` (ô chọn của thanh tab, poster bay vào trang chi tiết) |
| Hiệu ứng chuỗi | GSAP + `@gsap/react` | 3.15.0 / 2.1.2 | Chuỗi dài theo nhịp, ví dụ màn Match: vé ghép lại, chữ nảy, bắp bung |
| Cuộn mượt | Lenis | 1.3.26 | Tắt khi giảm chuyển động |
| Chuyển trang | React `<ViewTransition>` | có sẵn trong React 19.3 | Crossfade giữa các tab, sau này morph poster |
| Icon | lucide-react | 1.52.0 | Chỉ dùng ở thanh điều hướng và nút hành động |
| Linh vật động | Rive (`@rive-app/react-canvas`) | chưa cài | Chỉ cài khi có file `.riv`; trước đó Bắp là SVG + Motion |
| Dữ liệu client | TanStack Query | chưa cài | Cài ở pha 2 |
| DB, đăng nhập, realtime | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | @supabase/supabase-js 2.117.3, @supabase/ssr 0.12.7 | Đăng nhập link email (token_hash), RLS theo allowed_users, Realtime cho swipes |
| Hosting | Vercel Hobby + Vercel Cron | | Tự deploy khi push main |
| PWA | Next PWA guide hoặc `@serwist/next` | | Pha 5 |
| Test | Vitest (+ Playwright ở pha 5) | vitest 4.1.11 | Hiện chỉ test hàm parse dòng IMDb (`scripts/`) |

Chi phí mục tiêu: 0đ/tháng.

## Nguồn dữ liệu, ảnh, trailer (chốt 16/10/2026)

**Nguyên tắc:** chỉ lấy dữ liệu qua **API chính thức của các nguồn uy tín**, để thông tin, ảnh và trailer đúng nhất. Không cào web, không lấy ảnh hay trailer từ nguồn không rõ. Mọi lệnh gọi chạy trên server, có cache, và ghi nguồn trên giao diện.

| Cần gì | Lấy từ đâu | Cách lấy cho đúng |
|---|---|---|
| Thông tin phim (tên Việt/gốc, năm, độ dài, thể loại, tóm tắt) | **TMDB API** | `language=vi-VN`; thiếu bản tiếng Việt thì lấy `en-US`. Tên gốc lấy từ `original_title` |
| Phim đang/sắp chiếu ở VN | TMDB `now_playing` / `upcoming` với `region=VN` | Ghi "theo TMDB" vì có thể lệch với rạp thật |
| **Poster, ảnh nền** | **TMDB Images** (`image.tmdb.org`), endpoint `/movie/{id}/images` | Poster ưu tiên tiếng Việt, rồi poster không chữ, rồi tiếng Anh (`include_image_language=vi,null,en`). Cỡ: poster `w500` (list) / `w780` (chi tiết), ảnh nền `w1280`. Qua `next/image`, chỉ cho phép host `image.tmdb.org` |
| **Trailer** | TMDB `/movie/{id}/videos` → **YouTube chính chủ** | Chỉ nhận `site=YouTube`, `type=Trailer`, `official=true`. Ưu tiên bản tiếng Việt (vi), không có thì lấy bản tiếng Anh, rồi lấy bản mới nhất. Không có trailer chính thức thì ẩn khối Trailer, không lấy video khác thay vào |
| Nơi xem ở VN (Netflix, FPT Play…) | TMDB `watch/providers` (dữ liệu **JustWatch**) | Lấy theo `VN`. Bắt buộc ghi "dữ liệu JustWatch" |
| Diễn viên, đạo diễn, ekip (kèm ảnh chân dung) | TMDB `credits` | Ảnh chân dung `w185` từ `image.tmdb.org` |
| Tagline, nước sản xuất, ngôn ngữ, kinh phí, doanh thu, phân loại độ tuổi, ngày ra rạp theo nước, từ khoá, bộ sưu tập, phim tương tự, gợi ý | TMDB (`append_to_response=credits,videos,images,release_dates,keywords,similar,recommendations,reviews,watch/providers,external_ids`) | Một lần gọi lấy đủ cho trang chi tiết |
| Logo chữ tên phim trong suốt | TMDB `images.logos`; thiếu thì **Fanart.tv** (API chính thức, khoá miễn phí) | Dùng cho trang chi tiết và thẻ quẹt |
| **Điểm IMDb + số lượt** | **IMDb Non-Commercial Datasets** (`datasets.imdbws.com/title.ratings.tsv.gz`) | File chính thức, cập nhật hằng ngày, dùng cá nhân phi thương mại. Có điểm của **mọi** phim, không tốn lượt gọi API |
| Rotten Tomatoes, Metacritic | **OMDb API** theo `imdb_id` | Chỉ dùng cho 2 điểm này nên ít tốn lượt (1.000 lượt/ngày). Cache 24 giờ |
| Điểm Trakt, bình luận cộng đồng | **Trakt API** theo `imdb_id` | Bình luận có cờ spoiler thì che bằng vé cào |
| Điểm TMDB, review TMDB | TMDB | |

- Ba nguồn nối với nhau bằng `imdb_id` (lấy từ TMDB `external_ids`).
- **Không dùng:**
  - cào web: Letterboxd, trang rạp CGV/Lotte/Galaxy, IMDb HTML
  - ảnh từ Google Images
  - trailer reup trên YouTube
- Muốn thêm nguồn mới thì phải là API chính thức, có điều khoản cho phép dùng phi thương mại. Thêm vào bảng này trước khi code.
### Độ phủ: lấy đủ phim, kể cả phim niche không chiếu rạp

Yêu cầu: phải tìm và lọc ra được cả những phim ít người biết, không chiếu ở VN. Ví dụ: *Snakes and Earrings* (蛇にピアス, Nhật, 2008).

**Đã kiểm chứng ngày 16/10/2026:**
- File xuất ID hằng ngày của TMDB (`files.tmdb.org/p/exports/movie_ids_MM_DD_YYYY.json.gz`, không cần khoá) có **1.258.757 phim**.
  - Snakes and Earrings có ở đó: TMDB id `38551`, độ phổ biến 3,18.
  - Chỉ khoảng 6.500 phim có độ phổ biến ≥ 10, nên phim kiểu này nằm ngoài nhóm "hot".
- IMDb Datasets có 759.509 phim lẻ. Snakes and Earrings là `tt1254249`: 6,1 điểm, 1.032 lượt.

**Cách làm** (không lưu cả 1,26 triệu phim chi tiết; Supabase free chỉ có 500MB):
1. **Tìm kiếm phủ toàn bộ kho:** `/tim` gọi TMDB `/search/movie`.
   - Tìm theo tên Việt, tên Anh, tên gốc (kể cả chữ Nhật, Hàn, Trung) và tên thay thế (`alternative_titles`).
   - Phim nào trong 1,26 triệu phim cũng tìm ra được.
2. **"Đào sâu" trong Chọn phim và Ở nhà:** dùng TMDB `/discover/movie` với bộ lọc:
   - quốc gia (`with_origin_country`), ngôn ngữ gốc (`with_original_language`), thập niên, từ khoá (`with_keywords`, ví dụ "dựa trên tiểu thuyết")
   - độ phổ biến: **Phổ biến / Ít người biết**
   - "Ít người biết" = độ phổ biến thấp, điểm ≥ 7, số lượt đánh giá trong khoảng 50–2.000 → đào ra phim hay mà ít người xem
   - Discover không bắt buộc phim phải đang chiếu hay có trên nền tảng VN.
3. **Cache theo nhu cầu:** phim chỉ vào `movie_cache` khi có người mở hoặc phim đó hiện trong list.
   - Cron hằng ngày làm nóng sẵn khoảng 150 phim hot và phim đang chiếu ở VN.
4. **Điểm IMDb cho mọi phim:** job hằng tuần chạy bằng **GitHub Actions** (miễn phí; Vercel Hobby giới hạn thời gian chạy function).
   - Tải `title.ratings.tsv.gz` (~9MB), giữ các mục từ 50 lượt trở lên (~623.000 dòng, ~50MB), ghi vào bảng `imdb_ratings`.
   - Phim niche nào cũng có điểm IMDb ngay, không tốn lượt OMDb.
5. **Phim không có ở VN:** `watch/providers` cho VN trống thì ghi rõ "Chưa thấy trên nền tảng nào ở VN (dữ liệu JustWatch)". Không đoán.
6. Luôn để `include_adult=false`.

**Thử thật với token TMDB (16/10/2026), phim 38551:**
- Tìm bằng "snakes and earrings", "蛇にピアス" hay "hebi ni piasu" đều ra đúng phim.
- Dữ liệu trả về: tóm tắt, thể loại, nước, diễn viên, đạo diễn, từ khoá, 20 phim tương tự, 20 gợi ý, tên thay thế, 6 poster, 4 ảnh nền, trailer tiếng Anh chính thức.
- Những chỗ thiếu và cách xử lý:
  - **Tên:** TMDB không có tên tiếng Việt, `title` trả về chính tên gốc tiếng Nhật.
    - Tên hiển thị = tên Việt nếu khác tên gốc; không thì lấy tên tiếng Anh (`en-US`).
    - Tên gốc luôn hiện ở dòng phụ.
  - **Tóm tắt:** không có tiếng Việt → lấy `en-US`, gắn nhãn "EN". Pha 5 có thể dùng AI dịch.
  - **Logo:** không có trên TMDB → thử Fanart.tv; vẫn không có thì dùng tên phim bằng chữ Baloo 2.
  - **Điểm TMDB:** chỉ 41 lượt (dưới 50), nên bị loại khỏi điểm tổng. Điểm IMDb lấy từ IMDb Datasets (1.032 lượt).
  - **Nền tảng ở VN:** không có → hiện "Chưa thấy trên nền tảng nào ở VN".
  - **Trailer:** có một bản tiếng Nhật không chính thức (bỏ) và một bản tiếng Anh chính thức (dùng).

- Poster CSS (`Poster.tsx`) chỉ dùng cho dữ liệu mẫu. Khi có ảnh TMDB thì giữ khung, viền, halftone, chỉ thay phần nền bằng ảnh thật.

## Cấu trúc code

- `src/app/` — các route:
  - Tab: `/` (Rạp), `/o-nha`, `/match`, `/nhat-ky`.
  - Chi tiết phim: `/phim/[id]` là trang riêng. Khi bấm từ list, `@modal/(.)phim/[id]` chặn route và mở dạng sheet (intercepting + parallel routes). Nội dung đọc `params` phải nằm trong `<Suspense>`, vì `cacheComponents` yêu cầu điều hướng tức thì.
- `src/components/`:
  - `film/`: Poster, ScorePill, TicketCard, PosterStrip, RapView, PickCta
  - `detail/`: Sheet, DetailBody, DetailActions, Scratch, DetailSkeleton
  - `picker/`: luồng Chọn phim 4 bước
  - `match/`: Deck, MatchView, MatchOverlay
  - dùng chung: Nav, Providers, Toast…
- `src/lib/`:
  - `films.ts`: **DỮ LIỆU MẪU**, thay ở pha 2
  - `score.ts`: điểm tổng, mức điểm, chữ trên con dấu
  - `store.tsx`: trạng thái hai người trong bộ nhớ, thay bằng Supabase ở pha 4
  - `useMedia.ts`
  - `palette.ts`
  - `supabase/`: `env.ts` (biến public, `hasSupabase`), `client.ts` (trình duyệt), `server.ts` (server, đọc cookie)
- `src/proxy.ts` — làm mới phiên Supabase, chưa đăng nhập thì về `/login`; không có biến Supabase thì cho qua.
- `supabase/migrations/` — SQL chạy tay trong Supabase SQL Editor.
- `scripts/` — script Node chạy ngoài app (nạp IMDb ratings), có test Vitest.
- `src/app/globals.css` — token màu, font, class dùng chung.
- `src/styles/fito.css` — class component chép từ bản mẫu, thêm bố cục máy tính. Import trong `layout.tsx`, không dùng `@import` trong `globals.css` (Turbopack bỏ qua).
- `prototype/vibe.html` — bản mẫu tham chiếu. Không sửa trừ khi người dùng yêu cầu.

### Lưu ý kỹ thuật đã gặp

- Không dùng thuộc tính `hidden` cho những thứ cần hiện lại ở một breakpoint. `!important` của Tailwind preflight nằm trong layer nên thắng `!important` viết ngoài layer. Dùng class `max-lg:hidden` thay thế.
- Script trong `<head>` dùng `InlineScript`, theo docs Next "preventing-flash-before-hydration".
- Khi tab trình duyệt bị ẩn, rAF gần như dừng, nên Motion và GSAP trông như "kẹt". Muốn test animation thì dùng Playwright headless hoặc để tab hiển thị.

## Việc người dùng tự làm (không gửi khoá qua chat)

- Đăng ký khoá TMDB (API Read Access Token), OMDb (gói FREE), Trakt client_id, Fanart.tv (personal API key, miễn phí). IMDb Datasets không cần khoá.
- Tạo tài khoản Supabase và Vercel (đăng nhập bằng GitHub).
- Chọn 2 email được phép dùng app.
- Tự dán khoá vào `.env.local` và biến môi trường trên Vercel.

## Câu hỏi còn mở

- Hai bạn dùng nền tảng nào ở nhà (để chọn sẵn)?
- Có làm AI tóm tắt bình luận ở pha 5 không?
- Có đẩy repo lên GitHub private không (cần cho Vercel tự deploy)?
- Có vẽ Bắp bằng Rive không, hay giữ SVG?

## Nhật ký

- **15/10/2026** — Đọc kế hoạch gốc (Film.docx). Chốt vibe "Sổ Tay Hai Đứa", làm bản mẫu `prototype/vibe.html`: Rạp, Chi tiết, Quẹt, Match, luồng chọn phim 4 bước (nơi xem → thể loại → thêm tiêu chí → list), tab Ở nhà.
- **15/10/2026** — Đổi tên app thành **Fito**.
- **15/10/2026** — Chốt stack ở trên, ưu tiên hiệu ứng (Motion + GSAP + Lenis + ViewTransition; Rive để sau).
- **15/10/2026** — Nhấn mạnh: **web app** dùng tốt trên cả máy tính lẫn điện thoại, không chỉ bố cục điện thoại.
- **15/10/2026** — Bắt đầu pha 1: dựng khung app (Next.js + token + thanh điều hướng responsive).
- **16/10/2026** — Chuyển giao diện Rạp, Ở nhà, Chi tiết, Chọn phim, Quẹt, Match, màn Trùng gu từ bản mẫu vào app thật, chạy với **dữ liệu mẫu** (`src/lib/films.ts`), trong lúc người dùng đăng ký khoá API và Supabase.
  - Chi tiết mở dạng sheet: modal giữa màn từ 768px; mở trực tiếp bằng link thì là trang riêng.
  - Thẻ quẹt dùng Motion drag; màn Trùng gu là một timeline GSAP.
  - Băng poster kéo được bằng chuột trên máy tính.
  - Match trên máy tính chia 2 cột: chồng thẻ bên trái, danh sách bên phải.
- **16/10/2026** — Người dùng nhắc: dữ liệu, ảnh và trailer phải lấy qua API của nguồn uy tín để đúng nhất. Đã chốt bảng "Nguồn dữ liệu, ảnh, trailer" ở trên.
- **16/10/2026** — Thử lấy dữ liệu từ cgv.vn theo yêu cầu.
  - Kết quả: không có API công khai, không có `robots.txt`. Trang phim trả về một **trang thử thách chống bot** bằng JavaScript thay vì dữ liệu.
  - Không vượt lớp chống bot. Vẫn **không cào web rạp**.
  - Lịch chiếu và đặt vé: dùng link mở trang rạp (CGV/Lotte/Galaxy) trong trình duyệt.
- **16/10/2026** — Chốt mục tiêu **lấy đủ phim, kể cả phim niche** (mục "Độ phủ").
  - Thêm IMDb Datasets (điểm IMDb cho mọi phim) và Fanart.tv (logo).
  - OMDb chỉ còn lấy RT và Metacritic.
  - Đã kiểm chứng TMDB và IMDb đều có *Snakes and Earrings*.
- **16/10/2026** — Pha 1B (bản gọn cho 2 người): migration Supabase 0001 (6 bảng/view, RLS, trigger chặn email lạ, swipes vào Realtime), đăng nhập link email + /auth/callback, proxy chuyển về /login (không có biến Supabase thì cho qua), nút Đăng xuất, script nạp IMDb ratings + GitHub Actions hằng tuần. Cột watch_log.where đổi thành place vì where là từ khoá SQL. Cài @supabase/supabase-js 2.117.3 (2.118.0 mới ra 1 ngày), @supabase/ssr 0.12.7, vitest 4.1.11 (không dùng 5.0.3 vì cần peer @types/node ^22, dự án đang dùng ^20).

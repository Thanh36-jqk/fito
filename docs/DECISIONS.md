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
- **5 bảng màu**, đổi bằng `data-palette` trên `<html>`. Mặc định Neon.

  | Bảng | `--bg` | `--surface` | `--accent` | `--accent-2` | `--muted` | `--sticker` |
  |---|---|---|---|---|---|---|
  | Neon | #0D0E1A | #171829 | #C6F432 | #8B7CFF | #B3B5CF | #FF6BD6 |
  | Kẹo | #16121F | #211A2E | #FFB4A2 | #B8A6FF | #C3B4CC | #7FE0C4 |
  | Hoàng hôn | #120F0D | #1E1915 | #FF8A3D | #4FD1C5 | #C2B3A6 | #FFD23F |
  | Bạc Hà | #0B1512 | #13201B | #57E0B0 | #9FB2FF | #A6BBB2 | #FF93C4 |
  | Nho | #140D18 | #201528 | #FFD166 | #B49CFF | #BCA9C7 | #6FE0C9 |

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
| Dữ liệu client | TanStack Query | chưa cài | chưa cần: dữ liệu lấy ở Server Component + `'use cache'` |
| DB, đăng nhập, realtime | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | @supabase/supabase-js 2.117.3, @supabase/ssr 0.12.7 | Đăng nhập link email (token_hash), RLS theo allowed_users, Realtime cho swipes |
| Hosting | Vercel Hobby + Vercel Cron | | Tự deploy khi push main |
| PWA | Next PWA guide (tự làm) | không cài thư viện | Tự làm theo guide Next 16.4: app/manifest.ts + public/sw.js, không cài serwist |
| Test | Vitest (+ Playwright ở pha 5) | 4.1.11 | Hàm chọn trailer, tên/tóm tắt, điểm tổng (`src/`) và hàm parse dòng IMDb (`scripts/`) |

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
  - `films.ts`: **DỮ LIỆU MẪU** cho Chọn phim/Quẹt/Match, id âm (-1..-15) để không trùng id TMDB; `sampleCard`/`sampleDetail` đổi sang kiểu chung
  - `movie.ts`: kiểu chung `MovieCard`/`MovieDetail`, nhãn thể loại/ekip tiếng Việt, hàm định dạng; an toàn cho client
  - `tmdb/`: `client.ts` (server-only, nơi duy nhất đọc token), `api.ts` (server-only, có cache `'use cache'` + `cacheLife`), `pick.ts` (hàm thuần, có test), `types.ts` (JSON thô), `__fixtures__/` (dữ liệu thật phim 38551 cho test)
  - `score.ts`: điểm tổng, mức điểm, chữ trên con dấu
  - `store.tsx`: trạng thái hai người trong bộ nhớ, thay bằng Supabase ở pha 4
  - `useMedia.ts`
  - `palette.ts`
  - `supabase/`: `env.ts` (biến public, `hasSupabase`), `client.ts` (trình duyệt), `server.ts` (server, đọc cookie)
- PWA và chia sẻ link:
  - `src/app/manifest.ts` — manifest (`/manifest.webmanifest`)
  - `public/sw.js` — service worker JS thuần: cache offline.html, icon và poster `/_next/image` của TMDB
  - `public/offline.html` — trang "Mất mạng rồi", CSS và SVG inline
  - `public/icons/` + `scripts/make-icons.mjs` — icon PWA tự vẽ (vé + Bắp), cùng `src/app/icon.svg`, `apple-icon.png`, `favicon.ico`
  - `src/lib/og.ts` + `src/app/opengraph-image.tsx`, `src/app/phim/[id]/opengraph-image.tsx` — ảnh Open Graph (server-only)
  - `src/components/RegisterSW.tsx` — đăng ký service worker, chỉ ở production
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
- **16/10/2026** — Pha 2 nối TMDB (`src/lib/tmdb/`). Cache bằng `'use cache'` + `cacheLife`: danh sách 6 giờ (`LIST_LIFE`), chi tiết 24 giờ (`DETAIL_LIFE`). Lỗi thì throw trong scope có cache để lỗi không bị cache.
  - Cài Vitest 4.1.11 (`--save-exact`, kéo theo Vite 8.3.4). npm 10.9.8 bị crash nội bộ (`Cannot read properties of null (reading 'edgesOut')`, không phải ERESOLVE) khi dựng cây peer của Vite 8, nên chạy lệnh cài bằng `npx npm@11.21.0`, không dùng `--force` hay `--legacy-peer-deps`.
- **16/10/2026** — Đã kiểm chứng TMDB/JustWatch **KHÔNG có vùng VN**: `/watch/providers/regions` (139 vùng) không có VN, `discover` với `watch_region=VN` ra 0 phim. FPT Play, Galaxy Play, VieON không có trong danh mục nền tảng của TMDB.
  - Ở nhà hiện thông báo + "Đang hot trên TMDB", không đoán nền tảng.
  - **Cần người dùng chốt hướng xử lý** (ví dụ tự gắn nền tảng cho phim, như mục Rủi ro trong PLAN.md).
- **16/10/2026** — Phim mẫu đổi sang **id âm** (-1..-15) để không trùng id TMDB. Chọn phim/Quẹt/Match vẫn dùng dữ liệu mẫu; Hóng phim thật chỉ thêm id dương vào danh sách hóng, không thành match.
- **16/10/2026** — Bình luận TMDB gộp bản vi + en (bỏ trùng, mới nhất trước, tối đa 5). Độ tuổi VN lấy từ trường `note` của `release_dates` khi `certification` rỗng (P, K, T13, T16, T18, C).
- **16/10/2026** — `next/image` chỉ cho phép `https://image.tmdb.org/t/p/**`. Logo `.svg` bị bỏ qua.
- **16/10/2026** — Pha 1B (bản gọn cho 2 người): migration Supabase 0001 (6 bảng/view, RLS, trigger chặn email lạ, swipes vào Realtime), đăng nhập link email + /auth/callback, proxy chuyển về /login (không có biến Supabase thì cho qua), nút Đăng xuất, script nạp IMDb ratings + GitHub Actions hằng tuần. Cột watch_log.where đổi thành place vì where là từ khoá SQL. Cài @supabase/supabase-js 2.117.3 (2.118.0 mới ra 1 ngày), @supabase/ssr 0.12.7, vitest 4.1.11 (không dùng 5.0.3 vì cần peer @types/node ^22, dự án đang dùng ^20).
- **16/10/2026** — Pha 3: Chọn phim, Đào sâu, Ở nhà lọc trên URL, Cài đặt.
  - Ở nhà là kho phim TMDB discover lọc theo gu, không lọc nền tảng. Nền tảng hai đứa tự đánh dấu ở /cai-dat (localStorage `fito-platforms`), pha 4 lưu theo tài khoản.
  - Ra rạp trong Chọn phim dùng discover với `region=VN`, `with_release_type=2|3`, `release_date` trong khoảng `dates` của now_playing. Kiểm 19/10/2026: ra 33 phim, trùng now_playing.
  - Tham số URL: `noi`, `theloai`, `dai`, `diem`, `sx`, `quocgia`, `ngonngu`, `thapnien`, `noitieng`, `trang` (`src/lib/discover.ts`).
  - Ít người biết = `vote_average ≥ 7`, `vote_count` 50–2000, sort `vote_average.desc`. Phổ biến = `vote_count ≥ 1000`. Ở nhà luôn có sàn 20 lượt; "Điểm cao nhất" sàn 300; lọc điểm sàn 50 (khớp `MIN_VOTES`).
  - Bỏ sắp xếp "Ngắn nhất" vì TMDB discover không sắp theo độ dài, thay bằng "Hot nhất".
  - Thể loại: id theo `/genre/movie/list?language=vi-VN` (19 id khớp `GENRE_VI`, kiểm 19/10). Nhãn TMDB có chữ "Phim " ở đầu nên giữ nhãn ngắn của app; bỏ "Phim truyền hình" khỏi chip.
  - `GET /api/discover` (route handler) phục vụ Chọn phim và "Xem thêm"; token chỉ ở server.
  - Store giữ snapshot `MovieCard` (`cards`) cho phim thật trong chồng quẹt. Phim thật chưa thành match tới pha 4.
  - `tab-swap` chỉ chạy với `transitionTypes` "tab".
  - Poster đầu mỗi danh sách dùng `loading="eager"` + `fetchPriority="high"` (docs Next 16 khuyên dùng thay `preload`).
  - Điểm tổng không đủ nguồn: ô lớn hiện chữ "Chưa đủ điểm", không đóng dấu.
  - Phim mẫu: bình luận gắn nhãn "Mẫu", không ghi TMDB/JustWatch.
  - `total_results` của discover bị TMDB chặn trên, nên từ 10.000 trở lên hiện "10.000+".
  - Bảng màu xem trước dùng `.pal-preview[data-palette]`.
  - Trang Ở nhà bỏ JustWatch và chip nền tảng. Bộ lọc nằm trên URL (cùng khoá với `/api/discover`), trang 1 render ở server, "Xem thêm" gọi `/api/discover`. Đã xoá `getHomeVN`, `getWatchRegions`, `HomeData`.
  - Cài đặt lưu nền tảng ở localStorage `fito-platforms` theo từng máy; pha sau mới lưu theo tài khoản. Header điện thoại ẩn Online dưới 480px vì có thêm nút Cài đặt.
  - List có `region=VN` (now_playing, upcoming, Ra rạp) trả `release_date` là ngày ra rạp ở VN, nên phim cũ chiếu lại bị ra năm sai (Laputa 1986 thành 2026). Các list này để `year = null`, giữ `releaseDate` để sắp "Mới nhất". Dòng Ra rạp trong Chọn phim hiện "RA RẠP dd/mm" thay cho "NĂM"; thẻ quẹt phim rạp hiện "ra rạp dd/mm".
  - Eager cho 6 poster đầu mỗi lưới/băng (`EAGER_N` trong `Poster.tsx`), vì poster thứ 2 cùng hàng cũng có thể là LCP và Next cảnh báo khi nó lazy.
  - Chọn phim bước 0–1: `/api/discover` lỗi thì hiện "TMDB đang trục trặc" + "Thử lại". Bước 1 Ra rạp lỗi thì hiện đủ chip thể loại, không có số, vẫn bấm Tiếp được.
  - Phim mẫu (id âm) không có điểm TMDB nữa (`sc.tmdb = null` trong `films.ts`) và chi tiết phim mẫu ẩn ô điểm TMDB, để không ghi điểm giả là của TMDB. Điểm tổng phim mẫu tính từ 4 nguồn còn lại.
- **19/10/2026** — Pha 5A (PWA, đánh bóng, chuẩn bị deploy, chưa cần Supabase).
  - Manifest và icon tự vẽ (vé + Bắp) bằng ImageResponse trong `scripts/make-icons.mjs`, không tải ảnh ngoài.
  - Service worker chỉ đăng ký ở production. Cache `fito-shell-v1` giữ offline.html và icon; `fito-posters-v1` giữ tối đa 150 ảnh `/_next/image` của image.tmdb.org theo kiểu cache-first. Không cache HTML, `/api`, `/auth`, `/login`. Điều hướng lúc mất mạng thì hiện offline.html "Mất mạng rồi".
  - OG cho `/` và `/phim/[id]`: poster TMDB w500 tải ở server qua `'use cache'` 24 giờ, lỗi thì vẽ khung thay thế. Font là Geist mặc định của ImageResponse vì repo không có file ttf Baloo 2. Tên phim CJK có thể khiến ImageResponse tải font dự phòng từ Google Fonts lúc render.
  - Noindex qua metadata `robots`, không có robots.txt, để bot xem trước link đọc được thẻ OG.
  - `metadataBase` lấy từ `VERCEL_PROJECT_PRODUCTION_URL`, ở máy là http://localhost:3000.
  - proxy matcher bỏ qua sw.js, offline.html, opengraph-image, vì khi bật Supabase các file này phải công khai.
  - Không có vercel.json, chưa có Cron.
  - Kết quả đánh bóng (rà 390x844 và 1366x768: 10 URL, mở sheet từ poster, Chọn phim đủ 4 bước, quẹt ở /match, 3 bảng màu; Tab qua từng trang; giảm chuyển động):
    - Lỗi thật: không có. Không tràn ngang, không có vùng chạm dưới 44px, không lỗi console, không cảnh báo LCP của next/image. Focus thấy rõ ở mọi phần tử (`.search-box input` và `.login-input` đã có quầng `box-shadow` khi `:focus-visible`; placeholder `.login-input` không còn opacity, đo 7.72:1).
    - Báo nhầm đã xác minh: link đang chọn của Nav (hàm audit đo 1.00 vì viên `layoutId` là phần tử anh em, không phải tổ tiên). Màu thật `--on-accent` trên `--accent`: Neon 14.97, Kẹo 10.79, Hoàng hôn 8.14. `span.pill.lv-*` ở /match đo lại khi đứng yên: 7.99–12.17:1 (số thấp lần trước do đo lúc đang animate opacity).
    - `overflow` = -15 ở trang có thanh cuộn dọc là bề rộng thanh cuộn của Chromium; `scrollWidth - clientWidth` = 0 ở cả 375, 390 và 1366px.
    - Giảm chuyển động: marquee đứng yên, html không có class lenis, sheet mở không lò xo, màn Trùng gu không chạy timeline, `document.getAnimations().length === 0` sau 1 giây trên /, /match và các tab. Motion in một cảnh báo dev "You have Reduced Motion enabled" khi bật giảm chuyển động, không phải lỗi.
  - Production (`next build` + `next start -p 3100`): build qua không cần sửa; 8 trang và các URL PWA/OG trả 200; SW điều khiển trang, poster cache 19 mục đều là `/_next/image?url=https%3A%2F%2Fimage.tmdb.org…`; tắt server rồi mở /o-nha thấy "Mất mạng rồi"; quét `.next/static` không thấy token TMDB.
- **19/10/2026** — Đưa code lên GitHub private `Thanh36-jqk/fito` (đã quét lịch sử: không có khoá). Thêm `.mcp.json` với MCP chính thức của Supabase (`https://mcp.supabase.com/mcp`) và Vercel (`https://mcp.vercel.com`). Người dùng tự đăng nhập/cho phép (OAuth), sau đó Claude dùng MCP để tạo project Supabase, chạy migration, lấy khoá vào `.env.local`, và deploy.
- **19/10/2026** — Đã tạo project Supabase `fito` (ref `sckefkrgknmebzokkmcq`, Singapore, org Thanh36-jqk's Org) và chạy migration 0001 + 0002 qua MCP: 5 bảng, RLS bật hết. `is_allowed` và `is_email_allowed` còn cảnh báo "SECURITY DEFINER" của advisor, giữ có chủ ý. URL và khoá publishable đã nằm trong `.env.local`. **Chưa có**: 2 email trong `allowed_users` (nên chưa ai đăng nhập được), khoá secret/service_role (chỉ cần cho job nạp điểm IMDb), project Vercel (MCP Vercel báo 403 khi tạo project nên cần tạo từ dashboard hoặc CLI sau khi `vercel login`).
- **19/10/2026** — Đã deploy production lên Vercel: project `fito` (team thanh36-jqks-projects), địa chỉ https://fito-gamma.vercel.app, trạng thái Ready. Deploy bằng CLI (`npx vercel deploy --prod --scope thanh36-jqks-projects`) vì MCP Vercel bị 403 khi tạo project. Đã đặt 3 biến Production: `TMDB_READ_TOKEN` (Secret), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Chưa nối GitHub với Vercel nên push chưa tự deploy (nối ở Vercel dashboard → Settings → Git). Còn phải làm trong Supabase dashboard: thêm `https://fito-gamma.vercel.app/auth/callback` vào Redirect URLs, đặt Site URL, và sửa mẫu email Magic Link/Confirm signup theo README (bước 4–5).
- **19/10/2026** — Đổi đăng nhập sang **email + mật khẩu** (thay link/mã qua email). Lý do: dịch vụ email mặc định của Supabase chỉ gửi vài thư mỗi giờ và chỉ tới email thành viên tổ chức, nên thư tới người thứ hai có thể không bao giờ tới. Hai tài khoản tạo sẵn trong Supabase (đã xác nhận email), mật khẩu ngẫu nhiên lưu ở `.env.accounts` (git bỏ qua). `/auth/callback` giữ lại, chưa dùng. Muốn thêm tài khoản: thêm email vào `allowed_users` rồi Authentication → Users → Add user (bật Auto Confirm).
- **19/10/2026** — Vercel chặn deploy khi người commit không khớp tài khoản Git ("couldn't find a Git account for the commit author"). Commit bằng email noreply của GitHub: `207840032+Thanh36-jqk@users.noreply.github.com`.
- **24/10/2026** — Pha 2 (điểm): nối 4 nguồn điểm còn thiếu vào **vòng điểm trang chi tiết** (trước đó chỉ có TMDB). Module mới `src/lib/ratings/`:
  - `parse.ts` (hàm thuần, có test `parse.test.ts`): `parseOmdb` (RT "92%"→92, MC "74/100"→74, imdb kèm lượt), `parseTrakt` (thang 10 + lượt, 0 lượt → null), `parseImdbRow`.
  - `sources.ts` (server-only): `getOmdbScores` (RT+MC) và `getTraktScore` cache 24h bằng `'use cache'` + `cacheTag("ratings", …)`; `getImdbScore` đọc bảng `imdb_ratings` qua Supabase (KHÔNG cache vì phụ thuộc cookie phiên). Lỗi tạm thời (mạng, OMDb "Request limit") throw trong scope cache để không bị cache; không-có-dữ-liệu trả null (cache được).
  - `getMovieDetail` (tmdb/api.ts) gọi 3 nguồn song song theo `imdbId`, mỗi nguồn bọc `settle`, gộp vào `detail.sc`. TMDB vẫn lấy từ scope cache riêng.
  - **Quyết định:** điểm IMDb lấy từ dataset Supabase (đúng mục "Nguồn dữ liệu"), KHÔNG dùng `imdbRating` của OMDb; OMDb chỉ RT + MC. `imdb_ratings` còn trống tới khi chạy job nạp (cần `SUPABASE_SERVICE_ROLE_KEY`) nên IMDb hiện "—" tới lúc đó.
  - Tránh phụ thuộc vòng: `sources.ts` tự định nghĩa `RATING_LIFE` (24h) thay vì import `DETAIL_LIFE` từ `tmdb/api.ts`.
  - **Phạm vi:** chỉ vòng điểm trang chi tiết. Điểm tổng trên thẻ list vẫn chỉ TMDB (cần `movie_cache` + cron, để pha sau). Bình luận Trakt chưa làm.
  - Cần `OMDB_API_KEY` + `TRAKT_CLIENT_ID` trong `.env.local` + Vercel thì RT/MC/Trakt mới hiện; thiếu khoá → nguồn đó "—", app vẫn chạy.
  - Đã verify: `tsc` sạch, `eslint` sạch, `vitest` 65/65, `next build` qua.
- **26/10/2026** — Cron làm nóng `movie_cache` + điểm tổng lên thẻ list.
  - `vercel.json`: cron `/api/cron/warm` chạy 19:00 UTC (02:00 VN) mỗi ngày. Giữ Supabase free khỏi ngủ (có ghi DB hằng ngày).
  - `src/app/api/cron/warm/route.ts`: chặn bằng `Authorization: Bearer $CRON_SECRET` (Vercel tự gắn header này khi có env). Gom ~100 phim (now_playing + upcoming + popular, bỏ trùng, id dương), `getMovieDetail` song song (concurrency 10), ghi `writeMovieCache` theo mẻ 20. `maxDuration=60`. KHÔNG dùng `export const dynamic` (xung đột `cacheComponents`); route đọc header nên đã tự động dynamic.
  - `proxy.ts`: thêm `/api/cron/` vào nhánh public — Vercel Cron không có cookie Supabase, nếu không sẽ bị đẩy về `/login` và cron không chạy. Secret tự bảo vệ route.
  - Đọc: `overlayScores(cards)` (trong `src/lib/movie-cache.ts`) đọc `movie_cache.scores` qua client đã đăng nhập (RLS "đăng nhập là đọc"), phủ điểm đủ nguồn (imdb/rt/mc/trakt) lên thẻ list vốn chỉ có tmdb. Thiếu Supabase/ngoài request → no-op, list vẫn chạy. Nối ở trang Rạp (`/`, bọc `<Suspense>` vì đọc cookie dưới `cacheComponents`), Ở nhà (`/o-nha`, đã trong Suspense), `/api/discover` (Xem thêm + Chọn phim). Trang `/` chuyển thành Partial Prerender (shell tĩnh + section động).
  - Gộp vào `src/lib/movie-cache.ts` sẵn có (cạnh `snapshotMovie` của Nhật ký/Match), không tạo module song song. `writeMovieCache(MovieDetail[])` ghi thêm `providers_vn`, `trailer_key`, 3 mốc `*_fetched_at`; upsert merge nên không đạp cột của `snapshotMovie`.
  - **Phát hiện:** trang chi tiết (`DetailBody`) + `getMovieDetail` thực ra ĐÃ render đủ cast/crew/tagline/facts/similar/recommendations/logo/5 vòng điểm từ trước — mục "chi tiết đầy đủ" trong PLAN là tick cũ. Chỉ sửa 1 dòng footer chữ cũ (điểm đã nối chứ không còn "chưa nối").
  - **Cần người dùng:** đặt `CRON_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` trên Vercel (và `.env.local` nếu test local). Thiếu service key → cron throw, overlay no-op. IMDb trong cache vẫn "—" tới khi chạy `npm run imdb:import` (job nạp `imdb_ratings`).
  - Verify: `eslint` sạch, `vitest` 65/65, `next build` qua (`/` ◐, `/o-nha` ◐, `/api/cron/warm` ƒ). Smoke `next start`: cron no-auth/sai-secret → 401, `/` chưa đăng nhập → 307 `/login`, không rò khoá client. (Chạy thật cron 200 cần service key — verify khi deploy.)
  - **Lưu ý:** `next build` của Next 16.4.0 in cảnh báo advisory bảo mật và đôi lúc ném `SecurityFatalError` ở cuối (nudge nâng cấp), chạy lại là qua. Nên cân nhắc nâng Next (theo quy tắc version pin), nhưng là quyết định riêng của người dùng.
- **27/10/2026** — Kiểm hiệu năng + nâng cao hiệu ứng (Tầng 1).
  - **Đo 60fps** (Playwright + CDP CPU throttle 4× ≈ điện thoại tầm trung, 390px): idle marquee/băng poster p95 17ms, quẹt fly-out p95 9ms (đều mượt). **Mở sheet chi tiết giật**: long task ~208ms lúc `DetailBody` mount (nhiều Motion + rail 24 `TicketCard` + ~23 ảnh). Màn "Trùng gu" GSAP không ép được match bằng sample nên chưa đo.
  - **Fix 60fps:** `content-visibility: auto` + `contain-intrinsic-size` cho `.people` và `.rail` (detail.css) → khối dưới màn không layout/paint tới khi cuộn gần. Kết quả: worst frame 392→200ms, p95 75→42ms, jank 23→16. (cv:auto bỏ layout/paint offscreen chứ không bỏ reconcile React nên long task còn ~184ms; muốn hơn phải defer render rail — để sau.)
  - **Tap feedback:** nút/chip/round đã có `:active scale` từ trước; thêm cho **thẻ `a.ticket`** (`:active scale .98` + transition). **Neon flicker** nhẹ cho chữ marquee đèn rạp (`@keyframes neon-flicker`, chỉ opacity + text-shadow; marquee là surface được phép chạy liên tục). Cả hai tự tắt dưới `prefers-reduced-motion` (block global zero duration + thêm `.marquee .track span { animation: none }`). Đã verify bằng Playwright: reduced-motion → flicker tắt, marquee dừng.
  - **Đo perf tải** (cùng dịp): CLS = 0 mọi trang; LCP `/` cold ~1.6s, Ở nhà warm ~0.5s; ~1–1.2MB/trang (ảnh + JS animation). Lành mạnh; không sửa (DECISIONS dòng 13: không tối ưu tải tới mức tối đa; giảm chất ảnh nghịch ưu tiên đẹp).
  - Cách đo: build local strip biến Supabase (`grep -v NEXT_PUBLIC_SUPABASE`) → proxy mở hết, không đụng mật khẩu `.env.accounts`; `next start`; Playwright `newCDPSession` + `Emulation.setCPUThrottlingRate`. Khôi phục `.env.local` sau khi đo.
  - **Còn lại (đã chốt làm, chưa làm):** #2 parallax hero, #3 tilt+spotlight thẻ lưới, #1 poster morph list→sheet (`layoutId` xuyên route intercept — khó nhất, gộp với defer rail).
- **27/10/2026** — Nâng cao hiệu ứng Tầng 2 + 3.
  - **Tầng 3 — tilt+spotlight thẻ lưới:** `TicketCard` thành `"use client"`, thêm `onPointerMove`/`onPointerLeave` nghiêng 3D `.poster` (±12°) + đặt `--gx/--gy` cho vệt sáng `.glare` (đã có sẵn trong Poster). CSS gated `@media (hover:hover) and (pointer:fine)`: `.ticket { perspective }`, `.ticket .poster { transition + preserve-3d }`, `.ticket:hover .poster .glare { opacity:1 }`. JS guard `(pointer:fine)` + reduced-motion. TicketCard dùng ở cả server (tim, nhat-ky) lẫn client nên `"use client"` biến nó thành boundary ở 2 trang đó (chấp nhận).
  - **Tầng 2 — parallax hero:** `DetailBody` thêm listener cuộn trên `.sheet-scroll` set `--py = min(scrollTop*0.12, 14px)` (rAF, passive); `.d-bd { transform: scale(1.15) translateY(var(--py)) }` — scale 1.15 cho headroom nên translate 14px không hở mép. Chỉ chạy trong **sheet** (modal) vì trang riêng `/phim/[id]` cuộn bằng window, không phải `.sheet-scroll`. Tắt khi reduced-motion (`--py` không set, backdrop chỉ còn scale tĩnh).
  - Verify (Playwright + build open): lint sạch, build qua. Tilt: media gate true → poster `rotateY(3°)rotateX(3°)` + `--gx:75%`. Parallax trong sheet: cuộn 240px → `--py=14px`; reduced-motion → `--py` unset. Ảnh chụp home + sheet: không vỡ, backdrop không hở mép, điểm/stamp hiển thị đúng.
  - **Chưa làm:** #1 poster morph list→sheet (`layoutId`) + defer render rail (cắt nốt long task 184ms) — để lượt riêng.
- **27/10/2026** — Thêm palette Bạc Hà, Nho + hiệu ứng sóng loang đổi màu (View Transition clip-path, tôn trọng giảm chuyển động).

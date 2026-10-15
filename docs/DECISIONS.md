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
| DB, đăng nhập, realtime | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | chưa cài | Cài cuối pha 1, khi người dùng đã có project Supabase |
| Hosting | Vercel Hobby + Vercel Cron | | Tự deploy khi push main |
| PWA | Next PWA guide hoặc `@serwist/next` | | Pha 5 |
| Test | Vitest + Playwright | chưa cài | Pha 2 (hàm tính điểm) và pha 5 (luồng chính) |

Chi phí mục tiêu: 0đ/tháng.

## Cấu trúc code

- `src/app/` — route. Các tab: `/` (Rạp), `/o-nha`, `/match`, `/nhat-ky`.
- `src/components/` — `AppShell`, `Nav`, `PaletteToggle`, `Bap`, `SmoothScroll`…
- `src/app/globals.css` — token màu, font, class component chép từ bản mẫu.
- `prototype/vibe.html` — bản mẫu tham chiếu. Không sửa trừ khi người dùng yêu cầu.

## Việc người dùng tự làm (không gửi khoá qua chat)

- Đăng ký khoá TMDB (API Read Access Token), OMDb (gói FREE), Trakt client_id.
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

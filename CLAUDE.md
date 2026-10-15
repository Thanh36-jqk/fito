@AGENTS.md

# Fito

Web app riêng tư cho 2 người chọn phim (rạp / ở nhà). Toàn bộ chữ trong UI là tiếng Việt.

**Đọc trước khi làm bất cứ gì:**
- [docs/DECISIONS.md](docs/DECISIONS.md): các quyết định đã chốt (tên, vibe, stack, version, quy tắc thiết kế). Có quyết định mới thì ghi thêm vào mục Nhật ký.
- [docs/PLAN.md](docs/PLAN.md): phạm vi, dữ liệu, 5 pha, tiêu chí nghiệm thu. Xong việc nào thì tick việc đó.
- [prototype/vibe.html](prototype/vibe.html): giao diện đã duyệt. App thật phải giữ đúng giao diện này.

**Quy tắc ngắn:**
- Là web app, không chỉ dành cho điện thoại. Phải đẹp ở 375px và ở từ 1024px trở lên (điều hướng dọc bên trái).
- Màu, font, bo góc lấy từ token trong `src/app/globals.css`. Không đặt màu cứng trong component.
- Hiệu ứng: dùng Motion cho lò xo, kéo thả, `layoutId`; GSAP cho các chuỗi dài; Lenis cho cuộn; `<ViewTransition>` cho chuyển trang. Chỉ animate transform và opacity. Tôn trọng `prefers-reduced-motion`.
- Không dùng emoji làm icon, chỉ dùng lucide-react. Không có chế độ sáng.
- Khoá API chỉ dùng ở server. Không đưa khoá vào chat hay vào code client.
- Cài thêm thư viện: chọn bản ổn định đã ra được ít nhất ~1 tuần, cài bằng `--save-exact`, rồi ghi vào bảng stack trong DECISIONS.md.

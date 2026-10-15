# Fito

Web app riêng tư cho hai đứa chọn phim: đi rạp hay xem ở nhà.

- Quyết định đã chốt: [docs/DECISIONS.md](docs/DECISIONS.md)
- Kế hoạch 5 pha và tiêu chí nghiệm thu: [docs/PLAN.md](docs/PLAN.md)
- Giao diện đã duyệt: [prototype/vibe.html](prototype/vibe.html) (mở trực tiếp bằng trình duyệt)

## Chạy ở máy

```bash
npm install
npm run dev
```

Mở http://localhost:3000.

## Lệnh khác

- `npm run build`: build bản production
- `npm run lint`: kiểm tra code
- `npm test`: chạy test

## Thiết lập Supabase

Chưa có biến Supabase thì app vẫn chạy bình thường, không bắt đăng nhập.

1. Tạo project ở [supabase.com](https://supabase.com) (miễn phí, region Singapore).
2. SQL Editor → dán toàn bộ `supabase/migrations/0001_init.sql` → Run.
3. Sửa và chạy câu `insert` ở cuối file đó để thêm 2 email được phép.
4. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: thêm `http://localhost:3000/auth/callback`, `http://localhost:3001/auth/callback` (khi deploy thêm `https://<tên-app>.vercel.app/auth/callback`).
5. Authentication → Emails → Templates: ở **cả hai** mẫu "Magic Link" và "Confirm signup", đổi link thành
   `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`
   (nhờ vậy mở link trên máy hay app mail nào cũng đăng nhập được, không cần cùng trình duyệt đã gửi).
6. Project Settings → API Keys: chép vào `.env.local` 3 biến Supabase trong `.env.example`.
7. Chạy lại `npm run dev`, mở `/login`.
8. Điểm IMDb: GitHub repo → Settings → Secrets and variables → Actions → thêm `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` → tab Actions → "Nạp điểm IMDb" → Run workflow (sau đó tự chạy hằng tuần). Nạp lần đầu ở máy: thêm `SUPABASE_SERVICE_ROLE_KEY` vào `.env.local` (Project Settings → API Keys → Secret key) rồi chạy `npm run imdb:import` (hoặc bấm Run workflow như trên). Chạy thử, chỉ tải và đếm, không ghi gì: `node scripts/import-imdb-ratings.mjs --dry`.

Lưu ý: email mặc định của Supabase chỉ gửi được vài thư mỗi giờ, đủ cho 2 người.

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
- `node scripts/make-icons.mjs`: vẽ lại icon app

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

## Deploy lên Vercel

1. Đẩy lên GitHub private:
   - Tạo repo private trên github.com, không tick README.
   - Chạy `git status` trước để chắc `.env.local` không bị đưa lên (`.gitignore` đã chặn `.env*`), rồi chạy lần lượt:
     ```bash
     git init
     git add .
     git commit -m "Fito"
     git branch -M main
     git remote add origin https://github.com/<tài-khoản>/fito.git
     git push -u origin main
     ```
2. Vào [vercel.com](https://vercel.com), đăng nhập bằng GitHub → Add New… → Project → Import repo `fito`. Framework tự nhận Next.js, để nguyên lệnh build.
3. Environment Variables:
   - `TMDB_READ_TOKEN` (bắt buộc).
   - Khi đã có Supabase: thêm `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - KHÔNG đặt `SUPABASE_SERVICE_ROLE_KEY` trên Vercel; khoá này chỉ dùng ở `scripts/` và GitHub Actions.
   - `OMDB_API_KEY`, `TRAKT_CLIENT_ID`, `FANART_API_KEY` chưa dùng, để sau.
   - Cảnh báo: chưa có biến Supabase thì app không bắt đăng nhập, ai có link cũng vào được. Chỉ chia sẻ link khi đã bật Supabase.
4. Bấm Deploy, nhận URL `https://<tên-app>.vercel.app`. Ảnh OG tự lấy domain này qua biến hệ thống `VERCEL_PROJECT_PRODUCTION_URL`, không cần đặt tay.
5. Khi có Supabase: Authentication → URL Configuration → Site URL đổi thành `https://<tên-app>.vercel.app`; Redirect URLs thêm `https://<tên-app>.vercel.app/auth/callback`.
6. Mỗi lần push lên `main`, Vercel tự deploy lại. Đổi biến môi trường xong phải vào Deployments → Redeploy.
7. Cài lên màn hình chính:
   - iPhone: Safari → nút Chia sẻ → "Thêm vào MH chính".
   - Android: Chrome → menu ⋮ → "Cài đặt ứng dụng".
   - Máy tính: Chrome/Edge → biểu tượng cài trên thanh địa chỉ.
8. Thử bản production ở máy: `npm run build && npm run start -- -p 3100` rồi mở http://localhost:3100. Service worker chỉ chạy ở bản production.
9. Ghi chú: site đặt noindex (app riêng tư), không cần `vercel.json`, chưa có Vercel Cron (cần DB).

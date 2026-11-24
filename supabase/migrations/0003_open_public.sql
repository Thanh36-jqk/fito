-- Fito: MỞ CÔNG KHAI. Bỏ allow-list, cho ai cũng đăng ký, mọi người đọc chung 1 pool.
-- ĐẢO NGƯỢC thiết kế "riêng tư 2 người" trong 0001. Chạy 1 lần.
-- ⚠ Sau migration này, bất kỳ ai đăng nhập đều đọc được toàn bộ swipes/watch_log của 2 người cũ.

-- 1) Cho email lạ tạo tài khoản: gỡ trigger chặn + hàm của nó.
drop trigger if exists block_unknown_signup on auth.users;
drop function if exists public.block_unknown_signup();

-- 2) RLS: chuyển từ "hai đứa đọc" (is_allowed) sang "ai đăng nhập đọc tất".
drop policy if exists "hai đứa đọc" on public.swipes;
create policy "ai đăng nhập đọc" on public.swipes for select to authenticated using (true);

drop policy if exists "hai đứa đọc" on public.watch_log;
create policy "ai đăng nhập đọc" on public.watch_log for select to authenticated using (true);

drop policy if exists "hai đứa đọc" on public.allowed_users;
create policy "ai đăng nhập đọc" on public.allowed_users for select to authenticated using (true);

-- 3) Ghi: bỏ điều kiện is_allowed(), chỉ cần tự ghi dòng của mình.
drop policy if exists "tự ghi của mình" on public.swipes;
create policy "tự ghi của mình" on public.swipes for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "tự ghi của mình" on public.watch_log;
create policy "tự ghi của mình" on public.watch_log for insert to authenticated with check (user_id = (select auth.uid()));

-- Ghi chú: is_allowed()/is_email_allowed() giữ lại (không còn ai gọi), matches view tự chạy đúng
-- vì security_invoker + swipes giờ đọc được hết. "Confirm email" phải TẮT tay ở Supabase Dashboard
-- (Authentication → Providers → Email) nếu muốn đăng ký xong vào luôn, không chờ mail xác nhận.

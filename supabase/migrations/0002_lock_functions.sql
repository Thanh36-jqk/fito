-- Thu hồi quyền gọi trực tiếp (qua /rest/v1/rpc) của các hàm SECURITY DEFINER không cần công khai.
-- block_unknown_signup chỉ là hàm của trigger. is_allowed chỉ cần cho người đã đăng nhập (RLS dùng).
-- is_email_allowed GIỮ công khai có chủ ý: trang /login hỏi trước để báo lỗi rõ (app riêng của 2 người).
revoke execute on function public.block_unknown_signup() from public, anon, authenticated;
revoke execute on function public.is_allowed() from public, anon;
grant execute on function public.is_allowed() to authenticated;

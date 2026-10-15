import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/* Link trong email đăng nhập trỏ về đây: token_hash (mẫu email đã sửa) hoặc code (PKCE). */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (!hasSupabase) return NextResponse.redirect(new URL("/", origin));

  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");

  const supabase = await createClient();
  let ok = false;
  if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  return NextResponse.redirect(new URL(ok ? "/" : "/login?loi=link", origin));
}

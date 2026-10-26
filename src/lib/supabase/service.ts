import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

// Client service_role: BỎ QUA RLS, chỉ dùng ở server để ghi movie_cache (bảng chỉ service_role ghi được).
// Thiếu khoá thì trả null, nơi gọi tự bỏ qua bước snapshot.
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasServiceRole = Boolean(SUPABASE_URL && KEY);

export function createServiceClient(): SupabaseClient | null {
  if (!hasServiceRole) return null;
  return createClient(SUPABASE_URL, KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

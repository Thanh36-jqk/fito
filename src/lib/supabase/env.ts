// Truy cập tĩnh để Next nhúng giá trị NEXT_PUBLIC_* vào code client.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

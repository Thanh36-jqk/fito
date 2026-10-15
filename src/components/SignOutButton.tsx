"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { hasSupabase } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

/* Chưa nối Supabase thì không có đăng nhập, nên không hiện nút. */
export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  if (!hasSupabase) return null;

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      aria-label="Đăng xuất"
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border-2 border-line bg-surface px-3 text-[14px] font-extrabold text-muted transition-colors hover:text-fg ${className}`}
    >
      <LogOut className="size-[18px]" aria-hidden />
      <span className="max-lg:sr-only">Đăng xuất</span>
    </button>
  );
}

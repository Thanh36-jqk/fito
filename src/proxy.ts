import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, hasSupabase } from "@/lib/supabase/env";

/* Làm mới phiên Supabase và đưa người chưa đăng nhập về /login. Chưa có biến Supabase thì cho qua. */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (!hasSupabase) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list, headers) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const path = request.nextUrl.pathname;
  const isPublic = path === "/login" || path.startsWith("/auth/");

  if (!signedIn && !isPublic) return redirect(request, "/login", response);
  if (signedIn && path === "/login") return redirect(request, "/", response);
  return response;
}

function redirect(request: NextRequest, to: string, from: NextResponse) {
  const res = NextResponse.redirect(new URL(to, request.url));
  from.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|webmanifest)$).*)"],
};

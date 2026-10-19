"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CircleAlert, Eye, EyeOff, LogIn } from "lucide-react";
import { Bap } from "@/components/Bap";
import { hasSupabase } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

const ERRORS = {
  INVALID: "Email chưa đúng, cậu xem lại giúp tớ nha.",
  EMPTY: "Cậu nhập đủ email và mật khẩu giúp tớ nha.",
  WRONG: "Email hoặc mật khẩu chưa đúng. Cậu thử lại nha.",
  RATE: "Thử nhiều lần quá rồi, đợi một lát rồi thử lại nha.",
  GENERIC: "Chưa đăng nhập được. Thử lại sau chút nha.",
  NOT_CONNECTED: "Fito chưa nối Supabase nên chưa đăng nhập được. Làm theo mục “Thiết lập Supabase” trong README nha.",
  LINK: "Link đăng nhập cũ không dùng được nữa. Cậu đăng nhập bằng email và mật khẩu nha.",
};
type ErrKey = keyof typeof ERRORS;

const SPRING = { type: "spring", stiffness: 420, damping: 32 } as const;

async function signIn(email: string, password: string): Promise<ErrKey | null> {
  if (!hasSupabase) return "NOT_CONNECTED";
  if (!email || !password) return "EMPTY";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "INVALID";
  try {
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (!error) return null;
    if (error.status === 429 || error.code?.includes("rate_limit")) return "RATE";
    if (error.status === 400) return "WRONG"; // sai email hoặc mật khẩu, không nói rõ cái nào
    return "GENERIC";
  } catch {
    return "GENERIC";
  }
}

export function LoginForm({ linkError = false }: { linkError?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<ErrKey | null>(linkError ? "LINK" : null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const result = await signIn(email.trim().toLowerCase(), password);
    if (result) {
      setBusy(false);
      setErr(result);
      return;
    }
    router.replace("/");
    router.refresh(); // giữ trạng thái "đang vào" cho tới khi chuyển trang
  }

  const mood = busy ? "wow" : err ? "sad" : "happy";

  return (
    <div className="login-card">
      <span className="sticker login-sticker">Chỉ dành cho hai đứa</span>
      <motion.div
        key={mood}
        className="login-bap"
        initial={{ scale: 0.85, rotate: 0 }}
        animate={{ scale: 1, rotate: 8 }}
        transition={SPRING}
      >
        <Bap mood={mood} />
      </motion.div>

      <div className="ticket login-ticket">
        <div className="login-head">
          <small>VÉ VÀO CỬA</small>
          <h2>Đăng nhập</h2>
        </div>
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <label htmlFor="login-email">Email của cậu</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            required
            placeholder="ten@email.com"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? "login-err" : undefined}
          />
          <label htmlFor="login-password">Mật khẩu</label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Mật khẩu"
              className="login-input w-full pr-14"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? "login-err" : undefined}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-fg"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={show}
            >
              {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
            </button>
          </div>
          <button type="submit" className="btn btn-main w-full" disabled={busy} aria-busy={busy}>
            <LogIn className="size-5" aria-hidden />
            {busy ? "Đang vào…" : "Vào Fito"}
          </button>
          {/* role="alert" = aria-live="assertive" */}
          {err && (
            <p id="login-err" className="login-err" role="alert">
              <CircleAlert className="mt-px size-[18px] flex-none" aria-hidden />
              {ERRORS[err]}
            </p>
          )}
        </form>

        <div className="perf login-perf" />
        <p className="login-stub num">
          <span>Ghế: 2</span>
          <span aria-hidden>·</span>
          <span>Suất: lúc nào cũng được</span>
          <span aria-hidden>·</span>
          <span>Giá: 0đ</span>
        </p>
      </div>
      <p className="src login-src">Đăng nhập một lần là ở lại · Supabase Auth</p>
    </div>
  );
}

export function LoginFromUrl() {
  const loi = useSearchParams().get("loi");
  return <LoginForm linkError={loi === "link"} />;
}

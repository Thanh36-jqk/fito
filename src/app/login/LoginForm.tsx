"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CircleAlert, Send } from "lucide-react";
import { Bap } from "@/components/Bap";
import { hasSupabase } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

const ERRORS = {
  NOT_ALLOWED: "Email này không có trong danh sách của hai đứa. Cậu thử email khác nha.",
  INVALID: "Email chưa đúng, cậu xem lại giúp tớ nha.",
  RATE: "Gửi nhiều quá rồi, đợi một lát rồi thử lại nha.",
  GENERIC: "Chưa gửi được link. Thử lại sau chút nha.",
  NOT_CONNECTED: "Fito chưa nối Supabase nên chưa gửi link được. Làm theo mục “Thiết lập Supabase” trong README nha.",
  LINK: "Link đăng nhập hết hạn hoặc đã dùng rồi. Gửi link mới nha.",
};
type ErrKey = keyof typeof ERRORS;

const SPRING = { type: "spring", stiffness: 420, damping: 32 } as const;

async function sendLink(email: string): Promise<ErrKey | null> {
  if (!hasSupabase) return "NOT_CONNECTED";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "INVALID";
  try {
    const supabase = createClient();
    const { data: allowed } = await supabase.rpc("is_email_allowed", { p_email: email });
    if (allowed === false) return "NOT_ALLOWED";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback`, shouldCreateUser: true },
    });
    if (!error) return null;
    if (error.status === 429 || error.code?.includes("rate_limit")) return "RATE";
    if (error.message.includes("Database error")) return "NOT_ALLOWED";
    return "GENERIC";
  } catch {
    return "GENERIC";
  }
}

export function LoginForm({ linkError = false }: { linkError?: boolean }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<ErrKey | null>(linkError ? "LINK" : null);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    setSending(true);
    setErr(null);
    const result = await sendLink(clean);
    setSending(false);
    if (result) setErr(result);
    else setSentTo(clean);
  }

  const mood = sentTo ? "wow" : err ? "sad" : "happy";

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
        <AnimatePresence mode="wait" initial={false}>
          {sentTo ? (
            <motion.div
              key="sent"
              className="login-sent"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={SPRING}
            >
              <h2>Kiểm tra email nha!</h2>
              <p>
                Tớ vừa gửi link đăng nhập tới <b>{sentTo}</b>. Mở thư, bấm link là vào thẳng Fito.
              </p>
              <span className="login-hand">không thấy thư thì ngó thử mục Spam nha</span>
              <button type="button" className="btn btn-ghost login-back" onClick={() => setSentTo(null)}>
                <ArrowLeft className="size-5" aria-hidden />
                Nhập email khác
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={SPRING}
            >
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
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="ten@email.com"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={err ? true : undefined}
                  aria-describedby={err ? "login-err" : undefined}
                />
                <button type="submit" className="btn btn-main w-full" disabled={sending} aria-busy={sending}>
                  <Send className="size-5" aria-hidden />
                  {sending ? "Đang gửi…" : "Gửi link đăng nhập"}
                </button>
                {/* role="alert" = aria-live="assertive" */}
                {err && (
                  <p id="login-err" className="login-err" role="alert">
                    <CircleAlert className="mt-px size-[18px] flex-none" aria-hidden />
                    {ERRORS[err]}
                  </p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="perf login-perf" />
        <p className="login-stub num">
          <span>Ghế: 2</span>
          <span aria-hidden>·</span>
          <span>Suất: lúc nào cũng được</span>
          <span aria-hidden>·</span>
          <span>Giá: 0đ</span>
        </p>
      </div>
      <p className="src login-src">Đăng nhập bằng link qua email · Supabase Auth</p>
    </div>
  );
}

export function LoginFromUrl() {
  const loi = useSearchParams().get("loi");
  return <LoginForm linkError={loi === "link"} />;
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CircleAlert, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { Bap } from "@/components/Bap";
import { hasSupabase } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

const ERRORS = {
  INVALID: "Email chưa đúng, cậu xem lại giúp tớ nha.",
  EMPTY: "Cậu nhập đủ email và mật khẩu giúp tớ nha.",
  WEAK: "Mật khẩu cần ít nhất 6 ký tự nha.",
  WRONG: "Email hoặc mật khẩu chưa đúng. Cậu thử lại nha.",
  EXISTS: "Email này đăng ký rồi. Cậu bấm Đăng nhập nha.",
  RATE: "Thử nhiều lần quá rồi, đợi một lát rồi thử lại nha.",
  GENERIC: "Chưa xong được. Thử lại sau chút nha.",
  NOT_CONNECTED: "Fito chưa nối Supabase nên chưa đăng nhập được. Làm theo mục “Thiết lập Supabase” trong README nha.",
  LINK: "Link đăng nhập cũ không dùng được nữa. Cậu đăng nhập bằng email và mật khẩu nha.",
};
type ErrKey = keyof typeof ERRORS;
type Mode = "in" | "up";

// ok + session: vào thẳng. ok + !session: đăng ký cần xác nhận email (hiếm, khi bật Confirm email).
type AuthResult = { ok: true; session: boolean } | { ok: false; err: ErrKey };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPRING = { type: "spring", stiffness: 420, damping: 32 } as const;

async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!hasSupabase) return { ok: false, err: "NOT_CONNECTED" };
  if (!email || !password) return { ok: false, err: "EMPTY" };
  if (!EMAIL_RE.test(email)) return { ok: false, err: "INVALID" };
  try {
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (!error) return { ok: true, session: true };
    if (error.status === 429 || error.code?.includes("rate_limit")) return { ok: false, err: "RATE" };
    if (error.status === 400) return { ok: false, err: "WRONG" }; // sai email hoặc mật khẩu, không nói rõ cái nào
    return { ok: false, err: "GENERIC" };
  } catch {
    return { ok: false, err: "GENERIC" };
  }
}

async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!hasSupabase) return { ok: false, err: "NOT_CONNECTED" };
  if (!email || !password) return { ok: false, err: "EMPTY" };
  if (!EMAIL_RE.test(email)) return { ok: false, err: "INVALID" };
  if (password.length < 6) return { ok: false, err: "WEAK" };
  try {
    const { data, error } = await createClient().auth.signUp({ email, password });
    if (error) {
      if (error.status === 429 || error.code?.includes("rate_limit")) return { ok: false, err: "RATE" };
      if (error.code === "user_already_exists" || error.message?.toLowerCase().includes("already")) return { ok: false, err: "EXISTS" };
      if (error.code === "weak_password") return { ok: false, err: "WEAK" };
      return { ok: false, err: "GENERIC" };
    }
    // Chống dò email: Supabase trả user với identities rỗng khi email đã tồn tại, không báo lỗi.
    if (data.user && (data.user.identities?.length ?? 0) === 0) return { ok: false, err: "EXISTS" };
    return { ok: true, session: Boolean(data.session) };
  } catch {
    return { ok: false, err: "GENERIC" };
  }
}

export function LoginForm({ linkError = false }: { linkError?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<ErrKey | null>(linkError ? "LINK" : null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const clean = email.trim().toLowerCase();
    const res = await (mode === "up" ? signUp : signIn)(clean, password);
    if (!res.ok) {
      setBusy(false);
      setErr(res.err);
      return;
    }
    if (!res.session) {
      // Đăng ký thành công nhưng cần xác nhận email trước khi vào (khi Supabase bật Confirm email).
      setBusy(false);
      setSentTo(clean);
      return;
    }
    router.replace("/");
    router.refresh(); // giữ trạng thái "đang vào" cho tới khi chuyển trang
  }

  function switchMode() {
    setMode((m) => (m === "in" ? "up" : "in"));
    setErr(null);
  }

  const mood = busy ? "wow" : err ? "sad" : "happy";

  if (sentTo) {
    return (
      <div className="login-card">
        <motion.div className="login-bap" initial={{ scale: 0.85 }} animate={{ scale: 1, rotate: 8 }} transition={SPRING}>
          <Bap mood="happy" />
        </motion.div>
        <div className="ticket login-ticket">
          <div className="login-sent">
            <h2>Kiểm tra email nha</h2>
            <p>
              Tớ gửi link xác nhận tới <b>{sentTo}</b> rồi. Cậu bấm vào link đó rồi quay lại đăng nhập nha.
            </p>
            <span className="login-hand">hẹn gặp trong rạp!</span>
            <button type="button" className="btn btn-ghost login-back" onClick={() => { setSentTo(null); setMode("in"); }}>
              Về đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  const up = mode === "up";

  return (
    <div className="login-card">
      <span className="sticker login-sticker">Vé cho mọi người</span>
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
          <h2>{up ? "Đăng ký" : "Đăng nhập"}</h2>
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
              autoComplete={up ? "new-password" : "current-password"}
              required
              placeholder={up ? "Ít nhất 6 ký tự" : "Mật khẩu"}
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
            {up ? <UserPlus className="size-5" aria-hidden /> : <LogIn className="size-5" aria-hidden />}
            {up ? (busy ? "Đang tạo vé…" : "Tạo vé Fito") : busy ? "Đang vào…" : "Vào Fito"}
          </button>
          {/* role="alert" = aria-live="assertive" */}
          {err && (
            <p id="login-err" className="login-err" role="alert">
              <CircleAlert className="mt-px size-[18px] flex-none" aria-hidden />
              {ERRORS[err]}
            </p>
          )}
        </form>

        <button type="button" className="login-switch" onClick={switchMode}>
          {up ? "Có vé rồi? Đăng nhập" : "Chưa có vé? Đăng ký"}
        </button>

        <div className="perf login-perf" />
        <p className="login-stub num">
          <span>Ghế: thoải mái</span>
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

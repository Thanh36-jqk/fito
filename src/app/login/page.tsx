import type { Metadata } from "next";
import { Suspense } from "react";
import { Hello } from "@/components/Hello";
import { LoginForm, LoginFromUrl } from "./LoginForm";
import "@/styles/login.css";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <section className="login">
      <div className="login-intro">
        <Hello lead="Xé vé vào" highlight="Fito" />
        <p>Sổ tay chọn phim của riêng hai đứa. Nhập email, tớ gửi link đăng nhập qua thư, khỏi cần mật khẩu.</p>
        <span className="note">
          chỉ hai đứa mình thôi nha
          <svg viewBox="0 0 40 22" aria-hidden className="login-arrow">
            <path d="M2 14 C 12 4, 24 20, 36 8" />
            <path d="M30 6 L37 7 L35 14" />
          </svg>
        </span>
      </div>
      {/* useSearchParams cần Suspense; fallback là form không lỗi */}
      <Suspense fallback={<LoginForm />}>
        <LoginFromUrl />
      </Suspense>
    </section>
  );
}

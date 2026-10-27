import type { Metadata, Viewport } from "next";
import { Baloo_2, Mali, Nunito } from "next/font/google";
import { Suspense, ViewTransition } from "react";
import { InlineScript } from "@/components/InlineScript";
import { Nav } from "@/components/Nav";
import { MobileHeader } from "@/components/MobileHeader";
import { Providers } from "@/components/Providers";
import { RegisterSW } from "@/components/RegisterSW";
import { PALETTE_SCRIPT } from "@/lib/palette";
import { MOTION_SCRIPT } from "@/lib/motion";
import "./globals.css";
import "@/styles/fito.css";
import "@/styles/home.css";
import "@/styles/detail.css";
import "@/styles/search.css";
import "@/styles/picker.css";
import "@/styles/settings.css";
// Nạp sau cùng để !important của công tắc giảm chuyển động thắng cascade
import "@/styles/motion.css";

const baloo = Baloo_2({ variable: "--font-baloo", subsets: ["latin", "vietnamese"], weight: ["600", "700", "800"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "vietnamese"], weight: ["500", "600", "700", "800"] });
const mali = Mali({ variable: "--font-mali", subsets: ["latin", "vietnamese"], weight: ["500", "600"] });

const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
const DESC = "Sổ tay chọn phim của hai đứa: đi rạp hay xem ở nhà.";

/* Noindex chỉ đặt ở đây (không có robots.txt) để bot xem trước link vẫn đọc được thẻ OG. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Fito",
  title: { default: "Fito", template: "%s · Fito" },
  description: DESC,
  appleWebApp: { capable: true, title: "Fito", statusBarStyle: "black" },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: { type: "website", locale: "vi_VN", siteName: "Fito", title: "Fito", description: DESC },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0D0E1A",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-palette="neon"
      suppressHydrationWarning
      className={`${baloo.variable} ${nunito.variable} ${mali.variable}`}
    >
      <head>
        {/* Đặt bảng màu đã lưu trước khi vẽ để không nháy màu */}
        <InlineScript html={PALETTE_SCRIPT} />
        {/* Đặt data-motion đã lưu trước khi vẽ để không nháy chuyển động */}
        <InlineScript html={MOTION_SCRIPT} />
      </head>
      <body>
        <Providers>
          <div className="shell">
            <Suspense>
              <Nav />
            </Suspense>
            <main className="main">
              <MobileHeader />
              {/* Chỉ điều hướng có type "tab" (link thanh điều hướng/header) mới chạy tab-swap; gõ tìm, lọc, Suspense hiện nội dung thì không */}
              <ViewTransition default={{ tab: "tab-swap", default: "none" }}>{children}</ViewTransition>
            </main>
          </div>
          {modal}
        </Providers>
        <RegisterSW />
      </body>
    </html>
  );
}

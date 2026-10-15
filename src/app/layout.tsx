import type { Metadata, Viewport } from "next";
import { Baloo_2, Mali, Nunito } from "next/font/google";
import { Suspense, ViewTransition } from "react";
import { Nav } from "@/components/Nav";
import { MobileHeader } from "@/components/MobileHeader";
import { Providers } from "@/components/Providers";
import { PALETTE_SCRIPT } from "@/lib/palette";
import "./globals.css";

const baloo = Baloo_2({ variable: "--font-baloo", subsets: ["latin", "vietnamese"], weight: ["600", "700", "800"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "vietnamese"], weight: ["500", "600", "700", "800"] });
const mali = Mali({ variable: "--font-mali", subsets: ["latin", "vietnamese"], weight: ["500", "600"] });

export const metadata: Metadata = {
  title: { default: "Fito", template: "%s · Fito" },
  description: "Sổ tay chọn phim của hai đứa: đi rạp hay xem ở nhà.",
};

export const viewport: Viewport = {
  themeColor: "#0D0E1A",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-palette="neon"
      suppressHydrationWarning
      className={`${baloo.variable} ${nunito.variable} ${mali.variable}`}
    >
      <head>
        {/* Đặt bảng màu đã lưu trước khi vẽ để không nháy màu */}
        <script dangerouslySetInnerHTML={{ __html: PALETTE_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <div className="shell">
            <Suspense>
              <Nav />
            </Suspense>
            <main className="main">
              <MobileHeader />
              <ViewTransition default="tab-swap">{children}</ViewTransition>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

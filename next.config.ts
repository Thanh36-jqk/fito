import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // partialPrefetching (Next 16.3, thử nghiệm) prefetch nhầm App Shell trang thật /phim/[id]
  // thay vì interceptor @modal/(.)phim ở prod → bấm thẻ nhảy sang trang thật thay vì mở modal.
  // Tắt để giữ prefetch đủ cây route (interception fire đúng như ở dev). Dev không lộ lỗi này.
  partialPrefetching: false,
  // Tắt nhắc nâng cấp của Next: khi chạy dưới agent/CI, reminder "dừng lệnh" làm
  // `next build` thoát khác 0 → fail deploy/CI gián đoạn. Nâng Next là quyết định riêng.
  experimental: { agentUpgrade: false },
  images: {
    // Vercel Hobby hết quota tối ưu ảnh → /_next/image trả 402, poster vỡ.
    // TMDB đã phục vụ sẵn các cỡ w185/w500/w780/w1280 nên bỏ optimizer, dùng ảnh gốc.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" }],
  },
  // sw.js không được cache để bản mới tới ngay
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          // CSP của file SW chi phối cả fetch() BÊN TRONG service worker. posterFirst fetch thẳng
          // image.tmdb.org (cross-origin) → phải cho qua connect-src, nếu không mọi poster "Failed to fetch".
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'; connect-src 'self' https://image.tmdb.org" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

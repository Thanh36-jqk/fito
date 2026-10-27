import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // partialPrefetching (Next 16.3, thử nghiệm) prefetch nhầm App Shell trang thật /phim/[id]
  // thay vì interceptor @modal/(.)phim ở prod → bấm thẻ nhảy sang trang thật thay vì mở modal.
  // Tắt để giữ prefetch đủ cây route (interception fire đúng như ở dev). Dev không lộ lỗi này.
  partialPrefetching: false,
  images: {
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
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
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

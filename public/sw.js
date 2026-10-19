// Service worker của Fito: trang offline khi mất mạng + cache poster TMDB. Không cache HTML (có dữ liệu riêng).
const VERSION = "v1";
const SHELL = "fito-shell-" + VERSION;
const POSTERS = "fito-posters-" + VERSION;
const OFFLINE_URL = "/offline.html";
const MAX_POSTERS = 150;
const PRIVATE = [/^\/api\//, /^\/auth\//, /^\/login(\/|$)/];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll([OFFLINE_URL, "/icons/icon-192.png"]))
      .then(() => self.skipWaiting()),
  );
});

// Xoá cache của bản cũ rồi nhận quyền các tab đang mở
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith("fito-") && k !== SHELL && k !== POSTERS).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

// Giữ tối đa MAX_POSTERS ảnh, xoá ảnh cũ nhất trước
async function trimPosters() {
  const cache = await caches.open(POSTERS);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_POSTERS; i++) await cache.delete(keys[i]);
}

async function posterFirst(req) {
  const cache = await caches.open(POSTERS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) {
    await cache.put(req, res.clone());
    await trimPosters();
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (PRIVATE.some((re) => re.test(url.pathname))) return;

  // Trang: luôn đi mạng, mất mạng thì trả trang offline
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Poster TMDB qua /_next/image: cache trước, mạng sau
  if (url.pathname === "/_next/image" && (url.searchParams.get("url") || "").startsWith("https://image.tmdb.org/")) {
    event.respondWith(posterFirst(req));
  }
  // Còn lại để trình duyệt tự xử lý (HTTP cache)
});

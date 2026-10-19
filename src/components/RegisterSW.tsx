"use client";

import { useEffect } from "react";

/* Chỉ đăng ký service worker ở production; dev không có SW để khỏi dính cache cũ. */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);
  return null;
}

"use client";

import { useSyncExternalStore } from "react";
import { PALETTES, PALETTE_KEY, type PaletteId } from "@/lib/palette";

// Nguồn sự thật là data-palette trên <html> (script trong <head> đặt từ localStorage).
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });
  return () => mo.disconnect();
}
const getSnapshot = () => (document.documentElement.dataset.palette as PaletteId) || "neon";
const getServerSnapshot = (): PaletteId => "neon";

export function usePalette(): PaletteId {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Bắt điểm con trỏ gần nhất để sóng màu loang ra từ chỗ bấm.
let lastX = -1, lastY = -1;
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  });
}

export function setPalette(id: PaletteId) {
  const apply = () => {
    document.documentElement.dataset.palette = id;
    try {
      localStorage.setItem(PALETTE_KEY, id);
    } catch {}
  };

  // Tôn trọng cả công tắc "Tắt hiệu ứng" trong Cài đặt (data-motion="off") lẫn reduced-motion của máy.
  const off = document.documentElement.dataset.motion === "off";
  const reduce = off || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !document.startViewTransition) {
    apply();
    return;
  }

  // Loang tròn từ điểm bấm bằng clip-path (View Transition).
  const el = document.documentElement;
  const x = lastX >= 0 ? `${lastX}px` : "50%";
  const y = lastY >= 0 ? `${lastY}px` : "50%";
  el.style.setProperty("--wave-x", x);
  el.style.setProperty("--wave-y", y);
  el.classList.add("pal-wave");
  const vt = document.startViewTransition(apply);
  vt.finished.finally(() => el.classList.remove("pal-wave"));
}

export function PaletteToggle({ className = "" }: { className?: string }) {
  const current = usePalette();

  function next() {
    const i = PALETTES.findIndex((p) => p.id === current);
    setPalette(PALETTES[(i + 1) % PALETTES.length].id);
  }

  const label = PALETTES.find((p) => p.id === current)?.label;
  return (
    <button type="button" className={`sticker ${className}`} onClick={next} aria-label={`Bảng màu: ${label}. Bấm để đổi`}>
      {label}
    </button>
  );
}

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

export function setPalette(id: PaletteId) {
  document.documentElement.dataset.palette = id;
  try {
    localStorage.setItem(PALETTE_KEY, id);
  } catch {}
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

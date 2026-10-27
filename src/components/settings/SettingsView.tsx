"use client";

import { useMemo, useSyncExternalStore } from "react";
import { PALETTES } from "@/lib/palette";
import { PLATFORMS } from "@/lib/movie";
import { hasSupabase } from "@/lib/supabase/env";
import { setMotionPref, useMotionPref } from "@/lib/useMedia";
import type { MotionPref } from "@/lib/motion";
import { setPalette, usePalette } from "../PaletteToggle";
import { SignOutButton } from "../SignOutButton";

const MOTIONS: { id: MotionPref; label: string }[] = [
  { id: "auto", label: "Theo máy" },
  { id: "on", label: "Bật" },
  { id: "off", label: "Tắt" },
];

const UNDERLINE = "M2 9 C 20 3, 35 13, 52 7 S 85 4, 98 8";
const PLAT_KEY = "fito-platforms";
const PLAT_EVENT = "fito-platforms";
const KEYS = new Set(PLATFORMS.map((p) => p.key));

// Nền tảng lưu localStorage dạng chuỗi JSON; đổi ở tab khác ("storage") hoặc tab này (sự kiện tự phát) đều cập nhật.
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(PLAT_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(PLAT_EVENT, cb);
  };
}
function getSnapshot() {
  try {
    return localStorage.getItem(PLAT_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
const getServerSnapshot = () => "[]";

function parsePlats(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((k): k is string => typeof k === "string" && KEYS.has(k)) : [];
  } catch {
    return [];
  }
}

function savePlats(keys: string[]) {
  try {
    localStorage.setItem(PLAT_KEY, JSON.stringify(keys));
  } catch {}
  window.dispatchEvent(new Event(PLAT_EVENT));
}

export function SettingsView() {
  const current = usePalette();
  const motion = useMotionPref();
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const plats = useMemo(() => parsePlats(raw), [raw]);

  function toggle(key: string) {
    savePlats(plats.includes(key) ? plats.filter((k) => k !== key) : [...plats, key]);
  }

  return (
    <>
      <div className="sec-h">
        <h2>Bảng màu</h2>
        <small>lưu trên máy này</small>
      </div>
      <div className="pal-grid">
        {PALETTES.map(({ id, label }) => {
          const on = current === id;
          return (
            <button
              key={id}
              type="button"
              className="ticket pal-card"
              aria-pressed={on}
              aria-label={`Bảng màu ${label}`}
              onClick={() => setPalette(id)}
            >
              {/* Cảnh thu nhỏ: biến màu của bảng được đặt lại trên chính .pal-preview */}
              <div className="pal-preview" data-palette={id} aria-hidden>
                <div className="pv-card">
                  <i />
                  <i />
                </div>
                <span className="pv-chip">Chốt đơn</span>
                <svg className="pv-line" viewBox="0 0 100 14" preserveAspectRatio="none">
                  <path d={UNDERLINE} />
                </svg>
                <span className="pv-dot" />
              </div>
              <b>{label}</b>
              {on && <span className="sticker pal-on">Đang dùng</span>}
            </button>
          );
        })}
      </div>

      <div className="sec-h">
        <h2>Hiệu ứng</h2>
        <small>lưu trên máy này</small>
      </div>
      <div className="chips set-motion" role="group" aria-label="Hiệu ứng">
        {MOTIONS.map(({ id, label }) => (
          <button key={id} type="button" className="chip" aria-pressed={motion === id} onClick={() => setMotionPref(id)}>
            {label}
          </button>
        ))}
      </div>
      <p className="set-note">
        Tắt để đỡ chóng mặt hoặc tiết kiệm pin. ‘Theo máy’ nghe theo cài đặt giảm chuyển động của thiết bị.
      </p>

      <div className="sec-h">
        <h2>Nền tảng hai đứa dùng</h2>
        <small className="num">{plats.length} đã chọn</small>
      </div>
      <div className="chips set-plats" role="group" aria-label="Nền tảng hai đứa dùng">
        {PLATFORMS.map((p) => (
          <button key={p.key} type="button" className="chip" aria-pressed={plats.includes(p.key)} onClick={() => toggle(p.key)}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="set-note">Lưu trên máy này. Pha sau sẽ lưu theo tài khoản để hai máy giống nhau.</p>
      <p className="set-note">TMDB chưa có dữ liệu nền tảng ở VN, nên Ở nhà lọc theo gu chứ không lọc theo nền tảng.</p>

      <div className="sec-h">
        <h2>Tài khoản</h2>
      </div>
      {hasSupabase ? <SignOutButton showLabel /> : <p className="set-note">Chưa bật đăng nhập nên chưa cần đăng xuất.</p>}

      <p className="foot">Fito · sổ tay xem phim của hai đứa</p>
    </>
  );
}

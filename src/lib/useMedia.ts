"use client";

import { useSyncExternalStore } from "react";
import { effectiveReduced, MOTION_EVENT, MOTION_KEY, type MotionPref } from "./motion";

export function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => serverValue,
  );
}

// Lựa chọn hiệu ứng lưu localStorage; đổi ở tab khác ("storage") hoặc tab này (sự kiện tự phát) đều cập nhật.
function subscribeMotion(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(MOTION_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(MOTION_EVENT, cb);
  };
}
function getMotionSnapshot(): MotionPref {
  try {
    const v = localStorage.getItem(MOTION_KEY);
    return v === "on" || v === "off" ? v : "auto";
  } catch {
    return "auto";
  }
}
const getMotionServerSnapshot = (): MotionPref => "auto";

export const useMotionPref = () => useSyncExternalStore(subscribeMotion, getMotionSnapshot, getMotionServerSnapshot);

export function setMotionPref(p: MotionPref) {
  try {
    localStorage.setItem(MOTION_KEY, p);
  } catch {}
  window.dispatchEvent(new Event(MOTION_EVENT));
}

export const useReducedMotionPref = () =>
  effectiveReduced(useMotionPref(), useMedia("(prefers-reduced-motion: reduce)"));

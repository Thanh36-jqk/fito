"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { ReactLenis } from "lenis/react";
import { FitoProvider } from "@/lib/store";
import { useMotionPref, useReducedMotionPref } from "@/lib/useMedia";
import { Picker } from "./picker/Picker";
import { MatchOverlay } from "./match/MatchOverlay";
import { Toast } from "./Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const pref = useMotionPref();
  const calm = useReducedMotionPref();
  // off → ép giảm; on → ép bật (đè OS); auto → nghe theo OS
  const reducedMotion = pref === "off" ? "always" : pref === "on" ? "never" : "user";

  // Giữ data-motion đồng bộ (InlineScript đặt lần đầu; đây cập nhật khi đổi lựa chọn)
  useEffect(() => {
    document.documentElement.dataset.motion = calm ? "off" : "on";
  }, [calm]);

  return (
    // Giảm chuyển động: bỏ hẳn cả hiệu ứng mờ dần của Motion, không chỉ transform
    <MotionConfig reducedMotion={reducedMotion} skipAnimations={calm}>
      <FitoProvider>
        {!calm && <ReactLenis root options={{ lerp: 0.12, autoRaf: true }} />}
        {children}
        <Picker />
        <MatchOverlay />
        <Toast />
      </FitoProvider>
    </MotionConfig>
  );
}

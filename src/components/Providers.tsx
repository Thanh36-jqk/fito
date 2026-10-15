"use client";

import { MotionConfig } from "motion/react";
import { ReactLenis } from "lenis/react";
import { FitoProvider } from "@/lib/store";
import { useReducedMotionPref } from "@/lib/useMedia";
import { Picker } from "./picker/Picker";
import { MatchOverlay } from "./match/MatchOverlay";
import { Toast } from "./Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const calm = useReducedMotionPref();
  return (
    <MotionConfig reducedMotion="user">
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

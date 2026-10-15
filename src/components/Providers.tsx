"use client";

import { MotionConfig } from "motion/react";
import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [smooth, setSmooth] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSmooth(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {smooth && <ReactLenis root options={{ lerp: 0.12, autoRaf: true }} />}
      {children}
    </MotionConfig>
  );
}

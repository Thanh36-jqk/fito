"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMedia } from "@/lib/useMedia";

/*
  Khung trượt lên (điện thoại) / modal giữa màn (từ 768px).
  Dùng cho route bị chặn @modal/(.)phim/[id]: đóng = router.back().
*/
export function Sheet({ children, label = "dTitle" }: { children: React.ReactNode; label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const wide = useMedia("(min-width: 768px)");

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.querySelector(".mo") && setOpen(false);
    addEventListener("keydown", onKey);
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      root.style.overflow = prev;
    };
  }, []);

  const from = wide ? { opacity: 0, y: 40, scale: 0.96 } : { y: "105%" };
  const to = wide ? { opacity: 1, y: 0, scale: 1 } : { y: 0 };

  return (
    <AnimatePresence onExitComplete={() => router.back()}>
      {open && (
        <div className="layer" data-lenis-prevent>
          <motion.div className="scrim" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={label}
            initial={from}
            animate={to}
            exit={from}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <span className="grab" />
            <button ref={closeBtn} type="button" className="icon-btn absolute right-3 top-3 z-[3]" aria-label="Đóng" onClick={() => setOpen(false)}>
              <ChevronDown className="size-6" aria-hidden />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

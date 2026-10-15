"use client";

import { AnimatePresence, motion } from "motion/react";
import { useFito } from "@/lib/store";

export function Toast() {
  const { toastMsg } = useFito();
  return (
    <div role="status" aria-live="polite">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            key={toastMsg.id}
            className="toast"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
          >
            {toastMsg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "motion/react";

interface Props {
  isStreaming: boolean;
}

export function StreamingProgress({ isStreaming }: Props) {
  return (
    <AnimatePresence>
      {isStreaming && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--cyber-cyan)] via-[var(--cyber-magenta)] to-[var(--cyber-cyan)]"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{
            scaleX: [0, 1, 1, 0],
            originX: [0, 0, 1, 1],
          }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </AnimatePresence>
  );
}

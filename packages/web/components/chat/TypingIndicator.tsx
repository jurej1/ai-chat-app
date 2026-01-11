"use client";

import { motion } from "motion/react";

export function TypingIndicator() {
  return (
    <div className="flex gap-4 p-4 bg-foreground/5">
      <div className="w-8 h-8 rounded-full bg-(--cyber-purple)/20 border-2 border-(--cyber-magenta) flex items-center justify-center">
        <span className="text-xs font-mono">AI</span>
      </div>

      <div className="flex items-center gap-1 pt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-(--cyber-cyan)"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";

export function CyberpunkBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(var(--cyber-cyan) / 0.15 1px, transparent 1px),
            linear-gradient(90deg, var(--cyber-cyan) / 0.15 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scanline Effect */}
      <motion.div
        className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-[var(--cyber-cyan)] to-transparent opacity-5"
        animate={{ y: ["-100%", "100vh"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

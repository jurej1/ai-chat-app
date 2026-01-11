"use client";

import { Button } from "../ui/button";
import { HiOutlineCpuChip } from "react-icons/hi2";
import { useSelectedChatStore } from "@/lib/store/selectedChatStore";
import { useModelSelectionStore } from "@/lib/store/useModelSelectionStore";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function ChatHeader() {
  const chatTitle = useSelectedChatStore((s) => s.selectedChat?.title);

  const selectedModel = useModelSelectionStore((s) => s.selectedModel);

  const setDialogOpen = useModelSelectionStore((s) => s.setDialogOpen);

  return (
    <header className="border-b border-[var(--cyber-cyan)]/20 p-4 glass-panel relative z-10">
      <div className="flex items-center justify-between">
        <motion.h1
          className="text-xl font-semibold cyber-text-gradient relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {chatTitle || "New Chat"}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[var(--cyber-cyan)] to-[var(--cyber-magenta)]"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.h1>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setDialogOpen(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-foreground/5 border transition-all",
              selectedModel
                ? "border-[var(--cyber-cyan)]/50 hover:border-[var(--cyber-cyan)] hover:shadow-[0_0_15px_rgba(0,230,255,0.3)]"
                : "border-[var(--cyber-magenta)]/50 hover:border-[var(--cyber-magenta)] hover:shadow-[0_0_15px_rgba(255,0,200,0.3)]"
            )}
          >
            <HiOutlineCpuChip />
            {selectedModel ? (
              <span className="max-w-50 truncate">{selectedModel.name}</span>
            ) : (
              <span className="text-foreground/60">Select Model</span>
            )}
          </Button>
        </motion.div>
      </div>
    </header>
  );
}

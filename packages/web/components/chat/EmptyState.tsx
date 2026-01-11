"use client";

import { motion } from "motion/react";
import { MessageSquare, Sparkles, Zap } from "lucide-react";

export function EmptyState() {
  const features = [
    { icon: Sparkles, text: "AI-powered responses" },
    { icon: MessageSquare, text: "Natural conversations" },
    { icon: Zap, text: "Real-time streaming" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <motion.div
        className="w-20 h-20 rounded-full bg-linear-to-br from-(--cyber-cyan) to-(--cyber-magenta) flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: [
            "0 0 20px rgba(0,230,255,0.3)",
            "0 0 40px rgba(255,0,200,0.5)",
            "0 0 20px rgba(0,230,255,0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageSquare className="w-10 h-10 text-black" />
      </motion.div>

      <motion.h2
        className="text-2xl font-semibold cyber-text-gradient"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Start a Conversation
      </motion.h2>

      <motion.div
        className="flex gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {features.map((feature, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-2"
            whileHover={{ scale: 1.1, y: -5 }}
          >
            <div className="w-12 h-12 rounded-full bg-foreground/5 border border-(--cyber-cyan)/30 flex items-center justify-center">
              <feature.icon className="w-6 h-6 text-(--cyber-cyan)" />
            </div>
            <span className="text-xs text-foreground/60">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        className="text-sm text-foreground/50 max-w-md text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Select a model above and type your message below to begin
      </motion.p>
    </div>
  );
}

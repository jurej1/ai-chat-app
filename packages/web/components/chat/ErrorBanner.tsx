"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  WifiOff,
  Clock,
  Key,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatError, ChatErrorType } from "@/lib/errors/chat-errors";

interface Props {
  error: ChatError;
  onRetry: () => void;
  onDismiss: () => void;
}

const ERROR_ICONS = {
  [ChatErrorType.NETWORK]: WifiOff,
  [ChatErrorType.API]: AlertTriangle,
  [ChatErrorType.RATE_LIMIT]: Clock,
  [ChatErrorType.API_KEY]: Key,
  [ChatErrorType.MODEL_UNAVAILABLE]: AlertCircle,
  [ChatErrorType.TIMEOUT]: Clock,
  [ChatErrorType.UNKNOWN]: AlertTriangle,
};

export function ErrorBanner({ error, onRetry, onDismiss }: Props) {
  const Icon = ERROR_ICONS[error.type];

  return (
    <AnimatePresence>
      <motion.div
        className="mx-auto max-w-4xl px-4 py-2"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border-2 border-destructive/50 rounded-lg backdrop-blur-sm relative">
          <Icon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-destructive">
              {error.message}
            </p>
            {error.details && (
              <p className="text-xs text-destructive/70 mt-1">
                {error.details}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {error.retryable && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="border-destructive/50 hover:bg-destructive/20"
              >
                Retry
              </Button>
            )}
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-destructive/20 rounded transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { useAllChats } from "@/lib/hooks/useAllChats";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { motion, AnimatePresence } from "motion/react";

type Props = { show: boolean };

export function UserChatsSidebarList({ show }: Props) {
  const { data: chats, isLoading } = useAllChats();

  const opacityAnimation = cn("duration-100 transition-opacity", {
    "opacity-100": show,
    "opacity-0": !show,
  });

  return (
    <div className="grow w-full pr-2">
      <div className="flex items-center justify-between pb-2">
        <p className={cn("text-md text-gray-400", opacityAnimation)}>Chats</p>
        {isLoading && <Spinner />}
      </div>
      {chats && (
        <ul className="overflow-hidden flex flex-col gap-1">
          <AnimatePresence>
            {show &&
              chats.map((chat, index) => (
                <motion.li
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className="text-gray-700 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  {chat.title}
                </motion.li>
              ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

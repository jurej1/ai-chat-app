"use client";

import { useEffect, useState } from "react";
import { useAllChats } from "@/lib/hooks/useAllChats";
import { useSelectedChatStore } from "@/lib/store/selectedChatStore";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

type Props = { show: boolean };

export function UserChatsSidebarList({ show }: Props) {
  const { data: chats, isLoading } = useAllChats();
  const { selectedChat, setSelectedChat } = useSelectedChatStore();
  const [showDelayed, setShowDelayed] = useState(show);
  const [fadeIn, setFadeIn] = useState(show);

  useEffect(() => {
    if (show) {
      // When opening, wait 100ms then start rendering (for opacity animation)
      const showTimeout = setTimeout(() => setShowDelayed(true), 100);
      // Then trigger opacity fade-in immediately after
      const fadeTimeout = setTimeout(() => setFadeIn(true), 100);
      return () => {
        clearTimeout(showTimeout);
        clearTimeout(fadeTimeout);
      };
    } else {
      // When closing, hide immediately
      setShowDelayed(false);
      setFadeIn(false);
    }
  }, [show]);

  return (
    <div className="grow w-full pr-2">
      <div className="flex items-center justify-between pb-2">
        <p
          className={cn(
            "text-md text-gray-400 transition-opacity duration-150",
            fadeIn ? "opacity-100" : "opacity-0"
          )}
        >
          Chats
        </p>
        {isLoading && <Spinner />}
      </div>
      {chats && showDelayed && (
        <ul
          className={cn(
            "overflow-hidden flex flex-col gap-1 transition-opacity duration-150",
            fadeIn ? "opacity-100" : "opacity-0"
          )}
        >
          {chats.map((chat) => {
            const isSelected = selectedChat?.id === chat.id;
            return (
              <li
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={cn(
                  "text-gray-700 py-1 px-2 rounded cursor-pointer transition-colors",
                  isSelected
                    ? "bg-gray-200 hover:bg-gray-200"
                    : "hover:bg-gray-100"
                )}
              >
                {chat.title}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

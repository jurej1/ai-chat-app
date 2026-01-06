"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { HiOutlineCog } from "react-icons/hi2";
import { ApiKeyDialog } from "../settings/ApiKeyDialog";

import { UserTile } from "./UserTile";
import { OpenCloseSidebarButton } from "./OpenCloseSidebarButton";
import { UserChatsSidebarList } from "./UserChatsSidebarList";
import { Separator } from "../ui/separator";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        " bg-gray-200/30 h-screen flex py-3 px-3 transition-all duration-250 border-r flex-col items-start justify-between gap-2",
        {
          "w-72": isOpen,
          "w-16 ": !isOpen,
        }
      )}
    >
      <OpenCloseSidebarButton
        isHovering={isHovering}
        onClick={() => setIsOpen((prev) => !prev)}
      />

      <AnimatedSeparator isOpen={isOpen} />

      <div className="h-50" />

      <AnimatedSeparator isOpen={isOpen} />

      <UserChatsSidebarList show={isOpen} />

      <AnimatedSeparator isOpen={isOpen} />

      <div className="flex flex-col gap-2">
        <Button onClick={() => setDialogOpen(true)}>
          <HiOutlineCog />
        </Button>
        <UserTile />
      </div>

      <ApiKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

function AnimatedSeparator({ isOpen }: { isOpen: boolean }) {
  return (
    <Separator
      className={cn(
        "h-px bg-black/10 transition-all duration-400 ease-in-out overflow-hidden",
        {
          "w-0 opacity-0": !isOpen,
          "w-full opacity-100": isOpen,
        }
      )}
    />
  );
}

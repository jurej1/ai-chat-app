"use client";

import { FiSidebar } from "react-icons/fi";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { HiOutlineCpuChip, HiOutlineCog } from "react-icons/hi2";
import { ApiKeyDialog } from "./settings/ApiKeyDialog";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div
      // onMouseEnter={() => setIsHovering(true)}
      // onMouseLeave={() => setIsHovering(false)}
      className={cn(
        " bg-gray-200/30 h-screen flex py-3 px-3 transition-all duration-300 border-r flex-col items-start justify-between",
        {
          "w-72": isOpen,
          "w-16 ": !isOpen,
        }
      )}
    >
      <OpenCloseSidebarButton
        isHovering={isHovering}
        // onClick={() => setIsOpen((prev) => !prev)}
        onClick={() => {}}
      />
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

function OpenCloseSidebarButton({
  isHovering,
  onClick,
}: {
  isHovering: boolean;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick}>
      <FiSidebar
        className={cn("transition-opacity duration-200", {
          "opacity-100": isHovering,
          "opacity-0": !isHovering,
        })}
      />
      <HiOutlineCpuChip
        className={cn("absolute  transition-opacity duration-200", {
          "opacity-0": isHovering,
          "opacity-100": !isHovering,
        })}
      />
    </Button>
  );
}

function UserTile() {
  return (
    <div className="bg-green-900 flex justify-center items-center rounded-full w-10 h-10 text-white">
      JJ
    </div>
  );
}

"use client";

import { FiSidebar } from "react-icons/fi";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { HiOutlineCpuChip } from "react-icons/hi2";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        " bg-gray-200/30 h-screen flex py-3 px-3 transition-all duration-300 border-r",
        {
          "w-72": isOpen,
          "w-16 ": !isOpen,
        }
      )}
    >
      <Button onClick={() => setIsOpen((prev) => !prev)} className="relative">
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
    </div>
  );
}

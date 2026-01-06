import { FiSidebar } from "react-icons/fi";
import { Button } from "../ui/button";
import { HiOutlineCpuChip } from "react-icons/hi2";
import { cn } from "@/lib/utils";

export function OpenCloseSidebarButton({
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

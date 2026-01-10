import { HiOutlineCpuChip } from "react-icons/hi2";
import { Button } from "../ui/button";
import { useModelSelectionStore } from "@/lib/store/useModelSelectionStore";

export function NoModalSelected() {
  const setDialogOpen = useModelSelectionStore((s) => s.setDialogOpen);

  return (
    <>
      <HiOutlineCpuChip className="object-fill w-14 h-14" />
      <p>Please select a model to start chatting</p>
      <Button
        onClick={() => setDialogOpen(true)}
        className="px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
      >
        Select Model
      </Button>
    </>
  );
}

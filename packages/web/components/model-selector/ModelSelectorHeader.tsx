import { DialogHeader, DialogTitle } from "../ui/dialog";
import { Switch } from "../ui/switch";

type Props = {
  showFreeOnly: boolean;
  setShowFreeOnly: (show: boolean) => void;
};

export function ModelSelectorHeader({ showFreeOnly, setShowFreeOnly }: Props) {
  return (
    <DialogHeader className="flex justify-between items-center p-4 border-b border-foreground/10">
      <DialogTitle className="text-xl font-semibold flex w-full justify-between">
        Select Model
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground/60">Free only</span>
          <Switch
            checked={showFreeOnly}
            onCheckedChange={setShowFreeOnly}
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
        </div>
      </DialogTitle>
    </DialogHeader>
  );
}

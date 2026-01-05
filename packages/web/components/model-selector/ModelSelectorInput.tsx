import { forwardRef } from "react";
import { Input } from "../ui/input";

type Props = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export const ModelSelectorInput = forwardRef<HTMLInputElement, Props>(
  ({ searchQuery, setSearchQuery }, ref) => {
    return (
      <div className="p-4 border-b border-foreground/10">
        <Input
          ref={ref}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search models by name, ID, or description..."
          className="w-full"
        />
      </div>
    );
  }
);

ModelSelectorInput.displayName = "ModelSelectorInput";

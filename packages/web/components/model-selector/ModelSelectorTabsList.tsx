import { TabsList, TabsTrigger } from "../ui/tabs";

export function ModelSelectorTabsList() {
  return (
    <div className="px-4 border-b border-foreground/10">
      <TabsList className="w-full">
        <TabsTrigger value="default" className="flex-1">
          Default
        </TabsTrigger>
        <TabsTrigger value="saved" className="flex-1">
          Saved
        </TabsTrigger>
      </TabsList>
    </div>
  );
}

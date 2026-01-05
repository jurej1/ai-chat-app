import { AppSidebar } from "@/components/AppSidebar";
import { ChatUI } from "@/components/chat/ChatUI";

export default function ChatPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="grow">
        <ChatUI />
      </div>
    </div>
  );
}

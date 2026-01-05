import { ChatUI } from "@/components/ChatUI";
import { env } from "@/lib/env";

export default function ChatPage() {
  return <ChatUI apiUrl={env.NEXT_PUBLIC_API_URL} />;
}

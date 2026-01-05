import { ChatUI } from "@/components/ChatUI";

export default function ChatPage() {
  return <ChatUI apiUrl={process.env.NEXT_PUBLIC_API_URL!} />;
}

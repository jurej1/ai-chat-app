import { useQuery } from "@tanstack/react-query";
import { env } from "../env";
import { Message } from "@ai-chat-app/db";

const fetchMessages = async (id: string) => {
  const url = `${env.NEXT_PUBLIC_API_URL}/messages/${id}`;

  const response = await fetch(url, { method: "GET" });

  const data = await response.json();

  return data as Message[];
};

export const useChatMessages = (id?: string) =>
  useQuery<Message[]>({
    queryFn: () => fetchMessages(id!),
    queryKey: ["messages", id],
    enabled: !!id,
  });

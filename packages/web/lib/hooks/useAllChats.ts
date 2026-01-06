import { Chat } from "@ai-chat-app/db";
import { env } from "../env";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchAllChats = async () => {
  const url = `${env.NEXT_PUBLIC_API_URL}/chats`;
  return (await fetch(url, { method: "GET" })).json();
};

export const useAllChats = () =>
  useQuery<Chat[]>({
    queryFn: fetchAllChats,
    queryKey: ["chats"],
  });

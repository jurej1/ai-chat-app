import { InsertChat } from "@ai-chat-app/db";
import { env } from "../env";

type CreateMessageResponse = {
  id: string;
};

export const createMessage = async (
  data: InsertChat
): Promise<CreateMessageResponse> => {
  const url = `${env.NEXT_PUBLIC_API_URL}/messages/new`;

  const response = await fetch(url, {
    body: JSON.stringify(data),
    method: "POST",
  });

  const jsonData = await response.json();

  return jsonData as CreateMessageResponse;
};

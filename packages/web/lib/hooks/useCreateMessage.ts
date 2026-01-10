import { InsertMessage } from "@ai-chat-app/db";
import { useMutation } from "@tanstack/react-query";
import { env } from "../env";

type CreateMessageResponse = {
  id: string;
};

export const createMessage = async (
  data: InsertMessage
): Promise<CreateMessageResponse> => {
  const url = `${env.NEXT_PUBLIC_API_URL}/messages/new`;

  const response = await fetch(url, {
    body: JSON.stringify(data),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to create message: ${response.statusText}`);
  }

  const jsonData = await response.json();

  return jsonData as CreateMessageResponse;
};

export const useCreateMessage = () => {
  return useMutation({
    mutationFn: createMessage,
  });
};

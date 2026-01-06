import { desc, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { messagesTable } from "../schemas";

export const getMessagesByChatId = (id: string) =>
  db().query.messagesTable.findMany({
    where: eq(messagesTable.chatId, id),
    orderBy: desc(messagesTable.createdAt),
  });

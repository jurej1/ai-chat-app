import { desc, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { messagesTable } from "../schemas";
import { InsertMessage } from "../types";

export const getMessagesByChatId = (id: string) =>
  db().query.messagesTable.findMany({
    where: eq(messagesTable.chatId, id),
    orderBy: desc(messagesTable.createdAt),
  });

export const insertMessage = (data: InsertMessage) =>
  db().insert(messagesTable).values(data).returning({
    id: messagesTable.id,
  });

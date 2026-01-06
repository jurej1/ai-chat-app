import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { chatsTable } from "../schemas";
import { InsertChat } from "../types";

export const getChatById = (id: string) =>
  db().query.chatsTable.findFirst({
    where: eq(chatsTable.id, id),
  });

//TODO: later add support to get all chats for user.
export const getAllChats = () => db().query.chatsTable.findMany();

export const deleteChatById = (id: string) =>
  db().delete(chatsTable).where(eq(chatsTable.id, id));

export const insertChat = (data: InsertChat) =>
  db().insert(chatsTable).values(data).returning();

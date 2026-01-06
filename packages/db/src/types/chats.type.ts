import { chatsTable } from "../schemas";

export type InsertChat = typeof chatsTable.$inferInsert;
export type Chat = typeof chatsTable.$inferSelect;

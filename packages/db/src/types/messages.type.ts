import { messagesTable } from "../schemas";

export type InsertMessage = typeof messagesTable.$inferInsert;
export type Message = typeof messagesTable.$inferSelect;

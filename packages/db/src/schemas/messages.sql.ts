import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { chatsTable } from "./chats.sql";
import { relations } from "drizzle-orm";

export const messageRolesEnum = pgEnum("roles", [
  "user",
  "assistant",
  "system",
]);

export const messagesTable = pgTable(
  "messages",
  {
    id: uuid("id").notNull().primaryKey(),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chatsTable.id, { onDelete: "cascade" }),
    role: messageRolesEnum(),
    content: text("content"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    createdAt: timestamp("created", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index().on(table.chatId)]
);

export const messagesTableRelations = relations(messagesTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [messagesTable.chatId],
    references: [chatsTable.id],
  }),
}));

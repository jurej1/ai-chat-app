import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { messagesTable } from "./messages.sql";

export const chatsTable = pgTable("chats", {
  id: uuid("id").notNull().primaryKey(),
  title: text("title"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const chatsTableRelations = relations(chatsTable, ({ many }) => ({
  messages: many(messagesTable),
}));

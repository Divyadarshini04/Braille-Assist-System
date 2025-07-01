import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const brailleWords = pgTable("braille_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  braillePattern: text("braille_pattern").notNull(),
  frequency: integer("frequency").default(1),
  language: text("language").default("en"),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  sessionData: text("session_data").notNull(),
  accuracy: real("accuracy"),
  wordsTyped: integer("words_typed"),
  avgResponseTime: real("avg_response_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBrailleWordSchema = createInsertSchema(brailleWords).omit({
  id: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BrailleWord = typeof brailleWords.$inferSelect;
export type InsertBrailleWord = z.infer<typeof insertBrailleWordSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

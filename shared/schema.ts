import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  fb: text("fb"),
  status: text("status").notNull().default("Active"),
  walletDeposited: integer("wallet_deposited").notNull().default(0),
  walletSpent: integer("wallet_spent").notNull().default(0),
  scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
  portalKey: text("portal_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const spendLogs = pgTable("spend_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  date: text("date").notNull(),
  amount: integer("amount").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  title: text("title").notNull(),
  datetime: timestamp("datetime").notNull(),
  location: text("location").notNull(),
  reminders: jsonb("reminders").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  portalKey: true,
});

export const insertSpendLogSchema = createInsertSchema(spendLogs).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type SpendLog = typeof spendLogs.$inferSelect;
export type InsertSpendLog = z.infer<typeof insertSpendLogSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;

export interface ClientWithLogs extends Client {
  logs: SpendLog[];
}

export interface DashboardMetrics {
  totalDeposited: number;
  totalSpent: number;
  balance: number;
  activeClients: number;
}

export interface AIQueryResult {
  columns: { key: string; label: string }[];
  results: any[];
  summary: string;
}

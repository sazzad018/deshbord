import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  fb: text("fb"),
  profilePicture: text("profile_picture"),
  status: text("status").notNull().default("Active"),
  walletDeposited: integer("wallet_deposited").notNull().default(0),
  walletSpent: integer("wallet_spent").notNull().default(0),
  scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
  portalKey: text("portal_key").notNull(),
  adminNotes: text("admin_notes"),
  deleted: boolean("deleted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const spendLogs = pgTable("spend_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  date: text("date").notNull(),
  amount: integer("amount").notNull(),
  note: text("note"),
  balanceAfter: integer("balance_after").notNull().default(0), // Balance after this transaction
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceScopes = pgTable("service_scopes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  serviceName: text("service_name").notNull(), // e.g., "ওয়েবসাইট", "ল্যান্ডিং পেজ"
  scope: text("scope").notNull(), // Custom scope description
  status: text("status").notNull().default("Active"), // "Active", "Completed", "Paused"
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  notes: text("notes"),
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



export const todos = pgTable("todos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("Medium"), // "High", "Medium", "Low"
  status: text("status").notNull().default("Pending"), // "Completed", "Pending"
  dueDate: timestamp("due_date"),
  clientId: varchar("client_id").references(() => clients.id), // optional: link to client
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const whatsappTemplates = pgTable("whatsapp_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  message: text("message").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull().default("Agent CRM + Ops"),
  companyEmail: text("company_email"),
  companyPhone: text("company_phone"),
  companyWebsite: text("company_website"),
  companyAddress: text("company_address"),
  logoUrl: text("logo_url"),
  brandColor: text("brand_color").notNull().default("#A576FF"),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const insertServiceScopeSchema = createInsertSchema(serviceScopes).omit({
  id: true,
  createdAt: true,
});

// Website Projects Table for Portal Links
export const websiteProjects = pgTable("website_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  projectName: varchar("project_name").notNull(),
  portalKey: varchar("portal_key").notNull().unique(),
  projectStatus: varchar("project_status").notNull().default("In Progress"),
  websiteUrl: varchar("website_url"),
  notes: text("notes"),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWebsiteProjectSchema = createInsertSchema(websiteProjects).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});



export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
  createdAt: true,
});

export const insertWhatsappTemplateSchema = createInsertSchema(whatsappTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type SpendLog = typeof spendLogs.$inferSelect;
export type InsertSpendLog = z.infer<typeof insertSpendLogSchema>;
export type ServiceScope = typeof serviceScopes.$inferSelect;
export type InsertServiceScope = z.infer<typeof insertServiceScopeSchema>;
export type WebsiteProject = typeof websiteProjects.$inferSelect;
export type InsertWebsiteProject = z.infer<typeof insertWebsiteProjectSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type WhatsappTemplate = typeof whatsappTemplates.$inferSelect;
export type InsertWhatsappTemplate = z.infer<typeof insertWhatsappTemplateSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;

export interface ClientWithLogs extends Client {
  logs: SpendLog[];
}

export interface ClientWithDetails extends Client {
  logs: SpendLog[];
  serviceScopes: ServiceScope[];
  websiteProjects: WebsiteProject[];
}

export interface ServiceAnalytics {
  serviceName: string;
  totalClients: number;
  activeScopes: number;
  last7DaysSpending: {
    date: string;
    amount: number;
  }[];
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


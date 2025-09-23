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

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  status: text("status").notNull().default("Due"), // "Paid" or "Due"
  discount: integer("discount").notNull().default(0), // percentage
  vat: integer("vat").notNull().default(0), // percentage
  subtotal: integer("subtotal").notNull().default(0),
  totalAmount: integer("total_amount").notNull().default(0),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  rate: integer("rate").notNull(),
  amount: integer("amount").notNull(), // quantity * rate
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

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  invoiceNumber: true, // auto-generated
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
  invoiceId: true, // auto-set by server
  amount: true, // calculated by server (quantity * rate)
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
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
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

export interface InvoiceWithLineItems extends Invoice {
  lineItems: InvoiceLineItem[];
  client: Client;
}

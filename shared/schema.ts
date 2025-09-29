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
  isActive: boolean("is_active").notNull().default(true),
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
  companyName: text("company_name").notNull().default("Social Ads Expert"),
  companyEmail: text("company_email"),
  companyPhone: text("company_phone"),
  companyWebsite: text("company_website"),
  companyAddress: text("company_address"),
  logoUrl: text("logo_url"),
  brandColor: text("brand_color").notNull().default("#A576FF"),
  usdExchangeRate: integer("usd_exchange_rate").notNull().default(14500), // USD to BDT rate in paisa (145.00 BDT = 1 USD)
  baseCurrency: text("base_currency").notNull().default("USD"), // Base currency for calculations
  displayCurrency: text("display_currency").notNull().default("BDT"), // Display currency for users
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

// Custom Control Panel Buttons Table
export const customButtons = pgTable("custom_buttons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(), // Button text/label
  description: text("description"), // Optional description
  url: text("url").notNull(), // Link URL
  icon: text("icon").default("ExternalLink"), // Lucide icon name
  color: text("color").default("primary"), // Button color theme
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0), // For ordering buttons
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomButtonSchema = createInsertSchema(customButtons).omit({
  id: true,
  createdAt: true,
});

// Invoice Management Tables
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNo: text("invoice_no").notNull().unique(),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  companyId: varchar("company_id").references(() => companySettings.id), // Optional: multiple companies
  issueDate: text("issue_date").notNull(), // YYYY-MM-DD format
  startDate: text("start_date"), // Service period start
  endDate: text("end_date"), // Service period end
  currency: text("currency").notNull().default("BDT"),
  subTotal: integer("sub_total").notNull().default(0), // In paisa/cents
  discountPct: integer("discount_pct").notNull().default(0), // Percentage * 100 (e.g., 1500 = 15.00%)
  discountAmt: integer("discount_amt").notNull().default(0), // In paisa/cents
  vatPct: integer("vat_pct").notNull().default(0), // Percentage * 100
  vatAmt: integer("vat_amt").notNull().default(0), // In paisa/cents
  grandTotal: integer("grand_total").notNull().default(0), // In paisa/cents
  notes: text("notes"),
  status: text("status").notNull().default("Draft"), // "Draft", "Sent", "Paid", "Cancelled"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  rate: integer("rate").notNull().default(0), // In paisa/cents
  amount: integer("amount").notNull().default(0), // quantity * rate (in paisa/cents)
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  createdAt: true,
});

// File uploads table for managing uploaded files (images, documents)
export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // File size in bytes
  data: text("data").notNull(), // Base64 encoded file data
  uploadedBy: text("uploaded_by"), // Optional: track who uploaded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved Invoice PDFs table for tracking generated invoices
export const invoicePdfs = pgTable("invoice_pdfs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNo: text("invoice_no").notNull(),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull().default("application/pdf"),
  size: integer("size").notNull(), // PDF file size in bytes
  data: text("data").notNull(), // Base64 encoded PDF data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  createdAt: true,
});

export const insertInvoicePdfSchema = createInsertSchema(invoicePdfs).omit({
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

// Quick Messages Table for Control Panel
export const quickMessages = pgTable("quick_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(), // Message title/name
  message: text("message").notNull(), // The actual message content
  category: text("category").default("general"), // Optional categorization
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0), // For ordering messages
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment Requests Table - Client portal payment requests
export const paymentRequests = pgTable("payment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  amount: integer("amount").notNull(), // Amount in paisa/cents
  paymentMethod: text("payment_method").notNull(), // "Bank", "bKash", "Nagad"
  accountNumber: text("account_number"), // Bank account, bKash/Nagad number
  transactionId: text("transaction_id"), // Transaction/Reference ID from payment
  status: text("status").notNull().default("Pending"), // "Pending", "Approved", "Rejected"
  note: text("note"), // Client's note/message
  adminNote: text("admin_note"), // Admin's note when approving/rejecting
  requestDate: timestamp("request_date").defaultNow().notNull(),
  processedDate: timestamp("processed_date"), // When admin approved/rejected
  processedBy: text("processed_by"), // Admin who processed the request
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuickMessageSchema = createInsertSchema(quickMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentRequestSchema = createInsertSchema(paymentRequests).omit({
  id: true,
  createdAt: true,
  requestDate: true,
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
export type CustomButton = typeof customButtons.$inferSelect;
export type InsertCustomButton = z.infer<typeof insertCustomButtonSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type InvoicePdf = typeof invoicePdfs.$inferSelect;
export type InsertInvoicePdf = z.infer<typeof insertInvoicePdfSchema>;
export type QuickMessage = typeof quickMessages.$inferSelect;
export type InsertQuickMessage = z.infer<typeof insertQuickMessageSchema>;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;

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

// Project Management Tables
export const projectTypes = pgTable("project_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "website" or "landing_page"
  clientId: varchar("client_id").references(() => clients.id),
  description: text("description"),
  totalAmount: integer("total_amount").notNull().default(0), // Total project cost
  advanceReceived: integer("advance_received").notNull().default(0), // Advance from client
  dueAmount: integer("due_amount").notNull().default(0), // Remaining amount
  status: text("status").notNull().default("pending"), // "pending", "in_progress", "completed", "cancelled"
  progress: integer("progress").notNull().default(0), // Progress percentage (0-100)
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  publicUrl: text("public_url"), // Live project URL
  features: jsonb("features").$type<string[]>().notNull().default([]), // List of features
  completedFeatures: jsonb("completed_features").$type<string[]>().notNull().default([]), // Completed features
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull().default("developer"), // "developer", "designer", "manager"
  totalIncome: integer("total_income").notNull().default(0), // Total earned
  totalAdvance: integer("total_advance").notNull().default(0), // Total advance taken
  totalDue: integer("total_due").notNull().default(0), // Amount due to them
  isActive: boolean("is_active").notNull().default(true),
  portalKey: text("portal_key").notNull(), // For employee portal access
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectAssignments = pgTable("project_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  assignedFeatures: jsonb("assigned_features").$type<string[]>().notNull().default([]), // Features assigned to this employee
  completedFeatures: jsonb("completed_features").$type<string[]>().notNull().default([]), // Features completed by this employee
  hourlyRate: integer("hourly_rate").notNull().default(0), // Payment per hour/feature
  totalEarned: integer("total_earned").notNull().default(0), // Total earned from this project
  status: text("status").notNull().default("assigned"), // "assigned", "working", "completed"
  assignedDate: timestamp("assigned_date").defaultNow().notNull(),
  completedDate: timestamp("completed_date"),
});

export const projectPayments = pgTable("project_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method"), // "bKash", "Nagad", "Bank", etc.
  transactionId: text("transaction_id"),
  paymentDate: timestamp("payment_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salaryPayments = pgTable("salary_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  projectId: varchar("project_id").references(() => projects.id), // Optional: for project-specific payments
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // "salary", "advance", "bonus", "project_payment"
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  paymentDate: timestamp("payment_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for the new tables
export type ProjectType = typeof projectTypes.$inferSelect;
export type InsertProjectType = typeof projectTypes.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type InsertProjectAssignment = typeof projectAssignments.$inferInsert;

export type ProjectPayment = typeof projectPayments.$inferSelect;
export type InsertProjectPayment = typeof projectPayments.$inferInsert;

export type SalaryPayment = typeof salaryPayments.$inferSelect;
export type InsertSalaryPayment = typeof salaryPayments.$inferInsert;

// Insert schemas for validation
export const insertProjectTypeSchema = createInsertSchema(projectTypes).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true });
export const insertProjectAssignmentSchema = createInsertSchema(projectAssignments).omit({ id: true, assignedDate: true });
export const insertProjectPaymentSchema = createInsertSchema(projectPayments).omit({ id: true, createdAt: true });
export const insertSalaryPaymentSchema = createInsertSchema(salaryPayments).omit({ id: true, createdAt: true }).extend({
  paymentDate: z.union([z.date(), z.string().datetime()]).transform((val) => new Date(val))
});

// Extended types with relations
export interface ProjectWithDetails extends Project {
  client?: Client;
  assignments?: (ProjectAssignment & { employee: Employee })[];
  payments?: ProjectPayment[];
}

export interface EmployeeWithDetails extends Employee {
  assignments?: (ProjectAssignment & { project: Project })[];
  salaryPayments?: SalaryPayment[];
}

export interface AIQueryResult {
  columns: { key: string; label: string }[];
  results: any[];
  summary: string;
}


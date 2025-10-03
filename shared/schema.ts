import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, int, json, timestamp, boolean, datetime } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const adminUsers = mysqlTable("admin_users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  fb: text("fb"),
  profilePicture: text("profile_picture"),
  status: text("status").notNull().default("Active"),
  isActive: boolean("is_active").notNull().default(true),
  walletDeposited: int("wallet_deposited").notNull().default(0),
  walletSpent: int("wallet_spent").notNull().default(0),
  scopes: json("scopes").$type<string[]>().notNull().default([]),
  portalKey: text("portal_key").notNull(),
  adminNotes: text("admin_notes"),
  category: text("category").notNull().default("general"),
  deleted: boolean("deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const spendLogs = mysqlTable("spend_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
  date: text("date").notNull(),
  amount: int("amount").notNull(),
  note: text("note"),
  balanceAfter: int("balance_after").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serviceScopes = mysqlTable("service_scopes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
  serviceName: text("service_name").notNull(),
  scope: text("scope").notNull(),
  status: text("status").notNull().default("Active"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const meetings = mysqlTable("meetings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
  title: text("title").notNull(),
  datetime: datetime("datetime").notNull(),
  location: text("location").notNull(),
  reminders: json("reminders").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const todos = mysqlTable("todos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("Medium"),
  status: text("status").notNull().default("Pending"),
  dueDate: datetime("due_date"),
  clientId: varchar("client_id", { length: 36 }).references(() => clients.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const whatsappTemplates = mysqlTable("whatsapp_templates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const companySettings = mysqlTable("company_settings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  companyName: text("company_name").notNull().default("Social Ads Expert"),
  companyEmail: text("company_email"),
  companyPhone: text("company_phone"),
  companyWebsite: text("company_website"),
  companyAddress: text("company_address"),
  logoUrl: text("logo_url"),
  brandColor: text("brand_color").notNull().default("#A576FF"),
  usdExchangeRate: int("usd_exchange_rate").notNull().default(14500),
  baseCurrency: text("base_currency").notNull().default("USD"),
  displayCurrency: text("display_currency").notNull().default("BDT"),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

export const websiteProjects = mysqlTable("website_projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  portalKey: varchar("portal_key", { length: 255 }).notNull().unique(),
  projectStatus: varchar("project_status", { length: 50 }).notNull().default("In Progress"),
  websiteUrl: varchar("website_url", { length: 255 }),
  websiteUsername: text("website_username"),
  websitePassword: text("website_password"),
  cpanelUsername: text("cpanel_username"),
  cpanelPassword: text("cpanel_password"),
  nameserver1: text("nameserver1"),
  nameserver2: text("nameserver2"),
  serviceProvider: text("service_provider"),
  notes: text("notes"),
  completedDate: datetime("completed_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWebsiteProjectSchema = createInsertSchema(websiteProjects).omit({
  id: true,
  createdAt: true,
  portalKey: true,
}).extend({
  completedDate: z.coerce.date().optional().nullable(),
});

export const customButtons = mysqlTable("custom_buttons", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  icon: text("icon").default("ExternalLink"),
  color: text("color").default("primary"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomButtonSchema = createInsertSchema(customButtons).omit({
  id: true,
  createdAt: true,
});

export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  invoiceNo: text("invoice_no").notNull().unique(),
  clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
  companyId: varchar("company_id", { length: 36 }).references(() => companySettings.id),
  issueDate: text("issue_date").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  currency: text("currency").notNull().default("BDT"),
  subTotal: int("sub_total").notNull().default(0),
  discountPct: int("discount_pct").notNull().default(0),
  discountAmt: int("discount_amt").notNull().default(0),
  vatPct: int("vat_pct").notNull().default(0),
  vatAmt: int("vat_amt").notNull().default(0),
  grandTotal: int("grand_total").notNull().default(0),
  notes: text("notes"),
  status: text("status").notNull().default("Draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoiceItems = mysqlTable("invoice_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  invoiceId: varchar("invoice_id", { length: 36 }).notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: int("quantity").notNull().default(1),
  rate: int("rate").notNull().default(0),
  amount: int("amount").notNull().default(0),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const uploads = mysqlTable("uploads", {
  id: varchar("id", { length: 36 }).primaryKey(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: int("size").notNull(),
  data: text("data").notNull(),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoicePdfs = mysqlTable("invoice_pdfs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  invoiceNo: text("invoice_no").notNull(),
  clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull().default("application/pdf"),
  size: int("size").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const quickMessages = mysqlTable("quick_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  category: text("category").default("general"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentRequests = mysqlTable("payment_requests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
  amount: int("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  accountNumber: text("account_number"),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("Pending"),
  note: text("note"),
  adminNote: text("admin_note"),
  requestDate: timestamp("request_date").notNull().defaultNow(),
  processedDate: datetime("processed_date"),
  processedBy: text("processed_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const projectTypes = mysqlTable("project_types", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  clientId: varchar("client_id", { length: 36 }).references(() => clients.id),
  description: text("description"),
  totalAmount: int("total_amount").notNull().default(0),
  advanceReceived: int("advance_received").notNull().default(0),
  dueAmount: int("due_amount").notNull().default(0),
  status: text("status").notNull().default("pending"),
  progress: int("progress").notNull().default(0),
  startDate: datetime("start_date"),
  endDate: datetime("end_date"),
  publicUrl: text("public_url"),
  features: json("features").$type<string[]>().notNull().default([]),
  completedFeatures: json("completed_features").$type<string[]>().notNull().default([]),
  adminNotes: text("admin_notes"),
  secondPaymentDate: datetime("second_payment_date"),
  thirdPaymentDate: datetime("third_payment_date"),
  paymentCompleted: boolean("payment_completed").notNull().default(false),
  wpUsername: text("wp_username"),
  wpPassword: text("wp_password"),
  cpanelUsername: text("cpanel_username"),
  cpanelPassword: text("cpanel_password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const employees = mysqlTable("employees", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull().default("developer"),
  totalIncome: int("total_income").notNull().default(0),
  totalAdvance: int("total_advance").notNull().default(0),
  totalDue: int("total_due").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  portalKey: text("portal_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectAssignments = mysqlTable("project_assignments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id),
  employeeId: varchar("employee_id", { length: 36 }).notNull().references(() => employees.id),
  assignedFeatures: json("assigned_features").$type<string[]>().notNull().default([]),
  completedFeatures: json("completed_features").$type<string[]>().notNull().default([]),
  hourlyRate: int("hourly_rate").notNull().default(0),
  totalEarned: int("total_earned").notNull().default(0),
  status: text("status").notNull().default("assigned"),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  completedDate: datetime("completed_date"),
});

export const projectPayments = mysqlTable("project_payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id),
  amount: int("amount").notNull(),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  paymentDate: datetime("payment_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const salaryPayments = mysqlTable("salary_payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  employeeId: varchar("employee_id", { length: 36 }).notNull().references(() => employees.id),
  projectId: varchar("project_id", { length: 36 }).references(() => projects.id),
  amount: int("amount").notNull(),
  type: text("type").notNull(),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  paymentDate: datetime("payment_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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

export const insertProjectTypeSchema = createInsertSchema(projectTypes).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true }).extend({
  startDate: z.union([z.date(), z.string().datetime(), z.null()]).transform((val) => val ? new Date(val) : null).optional(),
  endDate: z.union([z.date(), z.string().datetime(), z.null()]).transform((val) => val ? new Date(val) : null).optional(),
  secondPaymentDate: z.union([z.date(), z.string().datetime(), z.null()]).transform((val) => val ? new Date(val) : null).optional(),
  thirdPaymentDate: z.union([z.date(), z.string().datetime(), z.null()]).transform((val) => val ? new Date(val) : null).optional()
});
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true });
export const insertProjectAssignmentSchema = createInsertSchema(projectAssignments).omit({ id: true, assignedDate: true });
export const insertProjectPaymentSchema = createInsertSchema(projectPayments).omit({ id: true, createdAt: true });
export const insertSalaryPaymentSchema = createInsertSchema(salaryPayments).omit({ id: true, createdAt: true }).extend({
  paymentDate: z.union([z.date(), z.string().datetime()]).transform((val) => new Date(val))
});

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

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

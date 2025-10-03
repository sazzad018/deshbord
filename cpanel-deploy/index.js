var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminUsers: () => adminUsers,
  clients: () => clients,
  companySettings: () => companySettings,
  customButtons: () => customButtons,
  employees: () => employees,
  insertAdminUserSchema: () => insertAdminUserSchema,
  insertClientSchema: () => insertClientSchema,
  insertCompanySettingsSchema: () => insertCompanySettingsSchema,
  insertCustomButtonSchema: () => insertCustomButtonSchema,
  insertEmployeeSchema: () => insertEmployeeSchema,
  insertInvoiceItemSchema: () => insertInvoiceItemSchema,
  insertInvoicePdfSchema: () => insertInvoicePdfSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertMeetingSchema: () => insertMeetingSchema,
  insertPaymentRequestSchema: () => insertPaymentRequestSchema,
  insertProjectAssignmentSchema: () => insertProjectAssignmentSchema,
  insertProjectPaymentSchema: () => insertProjectPaymentSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertProjectTypeSchema: () => insertProjectTypeSchema,
  insertQuickMessageSchema: () => insertQuickMessageSchema,
  insertSalaryPaymentSchema: () => insertSalaryPaymentSchema,
  insertServiceScopeSchema: () => insertServiceScopeSchema,
  insertSpendLogSchema: () => insertSpendLogSchema,
  insertTodoSchema: () => insertTodoSchema,
  insertUploadSchema: () => insertUploadSchema,
  insertWebsiteProjectSchema: () => insertWebsiteProjectSchema,
  insertWhatsappTemplateSchema: () => insertWhatsappTemplateSchema,
  invoiceItems: () => invoiceItems,
  invoicePdfs: () => invoicePdfs,
  invoices: () => invoices,
  loginSchema: () => loginSchema,
  meetings: () => meetings,
  paymentRequests: () => paymentRequests,
  projectAssignments: () => projectAssignments,
  projectPayments: () => projectPayments,
  projectTypes: () => projectTypes,
  projects: () => projects,
  quickMessages: () => quickMessages,
  salaryPayments: () => salaryPayments,
  serviceScopes: () => serviceScopes,
  spendLogs: () => spendLogs,
  todos: () => todos,
  uploads: () => uploads,
  websiteProjects: () => websiteProjects,
  whatsappTemplates: () => whatsappTemplates
});
import { mysqlTable, varchar, text, int, json, timestamp, boolean, datetime } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var adminUsers, clients, spendLogs, serviceScopes, meetings, todos, whatsappTemplates, companySettings, insertClientSchema, insertSpendLogSchema, insertServiceScopeSchema, websiteProjects, insertWebsiteProjectSchema, customButtons, insertCustomButtonSchema, invoices, invoiceItems, insertInvoiceSchema, insertInvoiceItemSchema, uploads, invoicePdfs, insertUploadSchema, insertInvoicePdfSchema, insertMeetingSchema, insertTodoSchema, insertWhatsappTemplateSchema, quickMessages, paymentRequests, insertQuickMessageSchema, insertPaymentRequestSchema, insertCompanySettingsSchema, projectTypes, projects, employees, projectAssignments, projectPayments, salaryPayments, insertProjectTypeSchema, insertProjectSchema, insertEmployeeSchema, insertProjectAssignmentSchema, insertProjectPaymentSchema, insertSalaryPaymentSchema, insertAdminUserSchema, loginSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    adminUsers = mysqlTable("admin_users", {
      id: varchar("id", { length: 36 }).primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      fullName: text("full_name").notNull(),
      email: text("email"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    clients = mysqlTable("clients", {
      id: varchar("id", { length: 36 }).primaryKey(),
      name: text("name").notNull(),
      phone: text("phone").notNull(),
      fb: text("fb"),
      profilePicture: text("profile_picture"),
      status: text("status").notNull().default("Active"),
      isActive: boolean("is_active").notNull().default(true),
      walletDeposited: int("wallet_deposited").notNull().default(0),
      walletSpent: int("wallet_spent").notNull().default(0),
      scopes: json("scopes").$type().notNull().default([]),
      portalKey: text("portal_key").notNull(),
      adminNotes: text("admin_notes"),
      category: text("category").notNull().default("general"),
      deleted: boolean("deleted").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    spendLogs = mysqlTable("spend_logs", {
      id: varchar("id", { length: 36 }).primaryKey(),
      clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
      date: text("date").notNull(),
      amount: int("amount").notNull(),
      note: text("note"),
      balanceAfter: int("balance_after").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    serviceScopes = mysqlTable("service_scopes", {
      id: varchar("id", { length: 36 }).primaryKey(),
      clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
      serviceName: text("service_name").notNull(),
      scope: text("scope").notNull(),
      status: text("status").notNull().default("Active"),
      startDate: timestamp("start_date").notNull().defaultNow(),
      endDate: timestamp("end_date"),
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    meetings = mysqlTable("meetings", {
      id: varchar("id", { length: 36 }).primaryKey(),
      clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
      title: text("title").notNull(),
      datetime: datetime("datetime").notNull(),
      location: text("location").notNull(),
      reminders: json("reminders").$type().notNull().default([]),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    todos = mysqlTable("todos", {
      id: varchar("id", { length: 36 }).primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      priority: text("priority").notNull().default("Medium"),
      status: text("status").notNull().default("Pending"),
      dueDate: datetime("due_date"),
      clientId: varchar("client_id", { length: 36 }).references(() => clients.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    whatsappTemplates = mysqlTable("whatsapp_templates", {
      id: varchar("id", { length: 36 }).primaryKey(),
      name: text("name").notNull(),
      message: text("message").notNull(),
      isDefault: boolean("is_default").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    companySettings = mysqlTable("company_settings", {
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
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertClientSchema = createInsertSchema(clients).omit({
      id: true,
      createdAt: true,
      portalKey: true
    });
    insertSpendLogSchema = createInsertSchema(spendLogs).omit({
      id: true,
      createdAt: true
    });
    insertServiceScopeSchema = createInsertSchema(serviceScopes).omit({
      id: true,
      createdAt: true
    });
    websiteProjects = mysqlTable("website_projects", {
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
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertWebsiteProjectSchema = createInsertSchema(websiteProjects).omit({
      id: true,
      createdAt: true,
      portalKey: true
    }).extend({
      completedDate: z.coerce.date().optional().nullable()
    });
    customButtons = mysqlTable("custom_buttons", {
      id: varchar("id", { length: 36 }).primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      url: text("url").notNull(),
      icon: text("icon").default("ExternalLink"),
      color: text("color").default("primary"),
      isActive: boolean("is_active").notNull().default(true),
      sortOrder: int("sort_order").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertCustomButtonSchema = createInsertSchema(customButtons).omit({
      id: true,
      createdAt: true
    });
    invoices = mysqlTable("invoices", {
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
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    invoiceItems = mysqlTable("invoice_items", {
      id: varchar("id", { length: 36 }).primaryKey(),
      invoiceId: varchar("invoice_id", { length: 36 }).notNull().references(() => invoices.id, { onDelete: "cascade" }),
      description: text("description").notNull(),
      quantity: int("quantity").notNull().default(1),
      rate: int("rate").notNull().default(0),
      amount: int("amount").notNull().default(0),
      sortOrder: int("sort_order").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertInvoiceSchema = createInsertSchema(invoices).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
      id: true,
      createdAt: true
    });
    uploads = mysqlTable("uploads", {
      id: varchar("id", { length: 36 }).primaryKey(),
      fileName: text("file_name").notNull(),
      mimeType: text("mime_type").notNull(),
      size: int("size").notNull(),
      data: text("data").notNull(),
      uploadedBy: text("uploaded_by"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    invoicePdfs = mysqlTable("invoice_pdfs", {
      id: varchar("id", { length: 36 }).primaryKey(),
      invoiceNo: text("invoice_no").notNull(),
      clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id),
      fileName: text("file_name").notNull(),
      mimeType: text("mime_type").notNull().default("application/pdf"),
      size: int("size").notNull(),
      data: text("data").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertUploadSchema = createInsertSchema(uploads).omit({
      id: true,
      createdAt: true
    });
    insertInvoicePdfSchema = createInsertSchema(invoicePdfs).omit({
      id: true,
      createdAt: true
    });
    insertMeetingSchema = createInsertSchema(meetings).omit({
      id: true,
      createdAt: true
    });
    insertTodoSchema = createInsertSchema(todos).omit({
      id: true,
      createdAt: true
    });
    insertWhatsappTemplateSchema = createInsertSchema(whatsappTemplates).omit({
      id: true,
      createdAt: true
    });
    quickMessages = mysqlTable("quick_messages", {
      id: varchar("id", { length: 36 }).primaryKey(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      category: text("category").default("general"),
      isActive: boolean("is_active").notNull().default(true),
      sortOrder: int("sort_order").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    paymentRequests = mysqlTable("payment_requests", {
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
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertQuickMessageSchema = createInsertSchema(quickMessages).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPaymentRequestSchema = createInsertSchema(paymentRequests).omit({
      id: true,
      createdAt: true,
      requestDate: true
    });
    insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    projectTypes = mysqlTable("project_types", {
      id: varchar("id", { length: 36 }).primaryKey(),
      name: text("name").notNull().unique(),
      displayName: text("display_name").notNull(),
      description: text("description"),
      isDefault: boolean("is_default").notNull().default(false),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    projects = mysqlTable("projects", {
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
      features: json("features").$type().notNull().default([]),
      completedFeatures: json("completed_features").$type().notNull().default([]),
      adminNotes: text("admin_notes"),
      secondPaymentDate: datetime("second_payment_date"),
      thirdPaymentDate: datetime("third_payment_date"),
      paymentCompleted: boolean("payment_completed").notNull().default(false),
      wpUsername: text("wp_username"),
      wpPassword: text("wp_password"),
      cpanelUsername: text("cpanel_username"),
      cpanelPassword: text("cpanel_password"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    employees = mysqlTable("employees", {
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
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    projectAssignments = mysqlTable("project_assignments", {
      id: varchar("id", { length: 36 }).primaryKey(),
      projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id),
      employeeId: varchar("employee_id", { length: 36 }).notNull().references(() => employees.id),
      assignedFeatures: json("assigned_features").$type().notNull().default([]),
      completedFeatures: json("completed_features").$type().notNull().default([]),
      hourlyRate: int("hourly_rate").notNull().default(0),
      totalEarned: int("total_earned").notNull().default(0),
      status: text("status").notNull().default("assigned"),
      assignedDate: timestamp("assigned_date").notNull().defaultNow(),
      completedDate: datetime("completed_date")
    });
    projectPayments = mysqlTable("project_payments", {
      id: varchar("id", { length: 36 }).primaryKey(),
      projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id),
      amount: int("amount").notNull(),
      paymentMethod: text("payment_method"),
      transactionId: text("transaction_id"),
      paymentDate: datetime("payment_date").notNull(),
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    salaryPayments = mysqlTable("salary_payments", {
      id: varchar("id", { length: 36 }).primaryKey(),
      employeeId: varchar("employee_id", { length: 36 }).notNull().references(() => employees.id),
      projectId: varchar("project_id", { length: 36 }).references(() => projects.id),
      amount: int("amount").notNull(),
      type: text("type").notNull(),
      paymentMethod: text("payment_method"),
      transactionId: text("transaction_id"),
      paymentDate: datetime("payment_date").notNull(),
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertProjectTypeSchema = createInsertSchema(projectTypes).omit({ id: true, createdAt: true });
    insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true }).extend({
      startDate: z.union([z.date(), z.string().datetime(), z.null()]).transform((val) => val ? new Date(val) : null).optional(),
      endDate: z.union([z.date(), z.string().datetime(), z.null()]).transform((val) => val ? new Date(val) : null).optional(),
      secondPaymentDate: z.union([z.date(), z.string().datetime(), z.null()]).transform((val) => val ? new Date(val) : null).optional(),
      thirdPaymentDate: z.union([z.date(), z.string().datetime(), z.null()]).transform((val) => val ? new Date(val) : null).optional()
    });
    insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true });
    insertProjectAssignmentSchema = createInsertSchema(projectAssignments).omit({ id: true, assignedDate: true });
    insertProjectPaymentSchema = createInsertSchema(projectPayments).omit({ id: true, createdAt: true });
    insertSalaryPaymentSchema = createInsertSchema(salaryPayments).omit({ id: true, createdAt: true }).extend({
      paymentDate: z.union([z.date(), z.string().datetime()]).transform((val) => new Date(val))
    });
    insertAdminUserSchema = createInsertSchema(adminUsers).omit({
      id: true,
      createdAt: true
    });
    loginSchema = z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required")
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  generateId: () => generateId,
  initializeDatabase: () => initializeDatabase
});
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { randomUUID } from "crypto";
function generateId() {
  return randomUUID();
}
async function initializeDatabase() {
  try {
    const existingClients = await db.select().from(clients).limit(1);
    if (existingClients.length > 0) {
      console.log("Database already has data, skipping initialization");
      return;
    }
    console.log("Initializing database with sample data...");
    const client1Id = generateId();
    const client2Id = generateId();
    await db.insert(clients).values([
      {
        id: client1Id,
        name: "\u09B0\u09BF\u09AF\u09BC\u09BE\u09A6 \u099F\u09CD\u09B0\u09C7\u09A1\u09BE\u09B0\u09CD\u09B8",
        phone: "+8801XXXXXXXXX",
        fb: "https://fb.com/riyadtraders",
        status: "Active",
        walletDeposited: 5e4,
        walletSpent: 1e4,
        scopes: ["Facebook Marketing", "Landing Page Design"],
        portalKey: "rt-8x1"
      },
      {
        id: client2Id,
        name: "\u09AE\u09C0\u09B0\u09BE \u09AB\u09C1\u09A1\u09B8",
        phone: "+8801YYYYYYYYY",
        fb: "https://fb.com/mirafoods",
        status: "Active",
        walletDeposited: 12e4,
        walletSpent: 92e3,
        scopes: ["Facebook Marketing", "Business Consultancy"],
        portalKey: "mf-3k9"
      }
    ]);
    await db.insert(spendLogs).values([
      {
        id: generateId(),
        clientId: client1Id,
        date: "2024-01-15",
        amount: 5e3,
        note: "Ad spend"
      },
      {
        id: generateId(),
        clientId: client1Id,
        date: "2024-01-16",
        amount: 5e3,
        note: "Boost post"
      },
      {
        id: generateId(),
        clientId: client2Id,
        date: "2024-01-14",
        amount: 4e4,
        note: "Campaign boost"
      },
      {
        id: generateId(),
        clientId: client2Id,
        date: "2024-01-15",
        amount: 52e3,
        note: "Lead generation"
      }
    ]);
    await db.insert(meetings).values([
      {
        id: generateId(),
        clientId: client1Id,
        title: "Kickoff Call",
        datetime: /* @__PURE__ */ new Date("2024-12-25T11:30:00"),
        location: "Google Meet",
        reminders: ["1 day before", "3 hours before", "30 min before"]
      }
    ]);
    await db.insert(todos).values([
      {
        id: generateId(),
        title: "\u0995\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u099F \u09AA\u09CD\u09B0\u09C7\u099C\u09C7\u09A8\u09CD\u099F\u09C7\u09B6\u09A8 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
        description: "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09B2\u099E\u09CD\u099A\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09C7\u099C\u09C7\u09A8\u09CD\u099F\u09C7\u09B6\u09A8 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
        priority: "High",
        status: "Pending",
        dueDate: /* @__PURE__ */ new Date("2024-01-25"),
        clientId: client1Id
      },
      {
        id: generateId(),
        title: "\u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2 \u09AE\u09BF\u09A1\u09BF\u09AF\u09BC\u09BE \u0995\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09C7\u0987\u09A8 \u09B0\u09BF\u09AD\u09BF\u0989",
        description: "\u0997\u09A4 \u09B8\u09AA\u09CD\u09A4\u09BE\u09B9\u09C7\u09B0 \u0995\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09C7\u0987\u09A8\u09C7\u09B0 \u09AA\u09BE\u09B0\u09AB\u09B0\u09AE\u09CD\u09AF\u09BE\u09A8\u09CD\u09B8 \u09B0\u09BF\u09AD\u09BF\u0989 \u0995\u09B0\u09C1\u09A8",
        priority: "Medium",
        status: "Completed",
        dueDate: /* @__PURE__ */ new Date("2024-01-20"),
        clientId: client2Id
      },
      {
        id: generateId(),
        title: "\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8 \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u0995\u09B0\u09C1\u09A8",
        description: "\u09A1\u09BF\u09B8\u09C7\u09AE\u09CD\u09AC\u09B0\u09C7\u09B0 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
        priority: "High",
        status: "Pending",
        dueDate: /* @__PURE__ */ new Date("2024-01-31")
      }
    ]);
    await db.insert(whatsappTemplates).values([
      {
        id: generateId(),
        name: "\u09AB\u09B2\u09CB\u0986\u09AA \u09AE\u09C7\u09B8\u09C7\u099C",
        message: "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE {client_name}, \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09CB\u099C\u09C7\u0995\u09CD\u099F\u09C7\u09B0 \u0986\u09AA\u09A1\u09C7\u099F \u09A6\u09BF\u09A4\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09B2\u09BE\u09AE\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u09AE\u09A4 \u09B8\u09AE\u09AF\u09BC\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF \u0995\u09BF?",
        isDefault: true
      },
      {
        id: generateId(),
        name: "\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B0\u09BF\u09AE\u09BE\u0987\u09A8\u09CD\u09A1\u09BE\u09B0",
        message: "\u09AA\u09CD\u09B0\u09BF\u09AF\u09BC {client_name}, \u0986\u09AA\u09A8\u09BE\u09B0 \u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8 #{invoice_number} \u098F\u09B0 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09C7\u09A8\u09CD\u09A1\u09BF\u0982 \u09B0\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09AF\u09A4 \u09A6\u09CD\u09B0\u09C1\u09A4 \u09B8\u09AE\u09CD\u09AD\u09AC \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09C1\u09A8\u0964",
        isDefault: false
      },
      {
        id: generateId(),
        name: "\u09AA\u09CD\u09B0\u09CB\u099C\u09C7\u0995\u09CD\u099F \u0995\u09AE\u09AA\u09CD\u09B2\u09BF\u099F",
        message: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09CB\u099C\u09C7\u0995\u09CD\u099F \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u09AB\u09BF\u09A1\u09AC\u09CD\u09AF\u09BE\u0995 \u09A6\u09BF\u09A4\u09C7 \u098F\u0987 \u09B2\u09BF\u0982\u0995\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C1\u09A8\u0964",
        isDefault: false
      }
    ]);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }
    pool = mysql.createPool(process.env.DATABASE_URL);
    db = drizzle(pool);
  }
});

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default;
var init_vite_config = __esm({
  async "vite.config.ts"() {
    "use strict";
    vite_config_default = defineConfig({
      plugins: [
        react(),
        runtimeErrorOverlay(),
        ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
          await import("@replit/vite-plugin-cartographer").then(
            (m) => m.cartographer()
          ),
          await import("@replit/vite-plugin-dev-banner").then(
            (m) => m.devBanner()
          )
        ] : []
      ],
      resolve: {
        alias: {
          "@": path2.resolve(import.meta.dirname, "client", "src"),
          "@shared": path2.resolve(import.meta.dirname, "shared"),
          "@assets": path2.resolve(import.meta.dirname, "attached_assets")
        }
      },
      root: path2.resolve(import.meta.dirname, "client"),
      build: {
        outDir: path2.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  log: () => log2,
  serveStatic: () => serveStatic2,
  setupVite: () => setupVite
});
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
function log2(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic2(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}
var viteLogger;
var init_vite = __esm({
  async "server/vite.ts"() {
    "use strict";
    await init_vite_config();
    viteLogger = createLogger();
  }
});

// server/index.ts
import express3 from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";

// server/db-storage.ts
init_schema();
init_db();
import { eq, desc, sum, sql, and, gte } from "drizzle-orm";
var DatabaseStorage = class {
  async getClients() {
    return await db.select().from(clients).where(eq(clients.deleted, false)).orderBy(desc(clients.createdAt));
  }
  async getClient(id) {
    const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result[0];
  }
  async getClientWithLogs(id) {
    const client = await this.getClient(id);
    if (!client) return void 0;
    const logs = await this.getSpendLogs(id);
    return { ...client, logs };
  }
  async getClientWithDetails(id) {
    const client = await this.getClient(id);
    if (!client) return void 0;
    const [logs, serviceScopes2, websiteProjects2] = await Promise.all([
      this.getSpendLogs(id),
      this.getServiceScopes(id),
      this.getWebsiteProjects(id)
    ]);
    return { ...client, logs, serviceScopes: serviceScopes2, websiteProjects: websiteProjects2 };
  }
  async createClient(insertClient) {
    const portalKey = Math.random().toString(36).slice(2, 7);
    const insertData = {
      name: insertClient.name,
      phone: insertClient.phone,
      fb: insertClient.fb || null,
      profilePicture: insertClient.profilePicture || null,
      adminNotes: insertClient.adminNotes || null,
      status: insertClient.status || "Active",
      walletDeposited: 0,
      walletSpent: 0,
      scopes: insertClient.scopes || ["Facebook Marketing"],
      category: insertClient.category || "general",
      // Add category field
      portalKey
    };
    const [client] = await db.insert(clients).values(insertData).returning();
    return client;
  }
  async updateClient(id, updates) {
    const [updated] = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
    return updated;
  }
  async deleteClient(id) {
    try {
      const [spendLogsCount, meetingsCount, serviceScopesCount] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(spendLogs).where(eq(spendLogs.clientId, id)),
        db.select({ count: sql`count(*)` }).from(meetings).where(eq(meetings.clientId, id)),
        db.select({ count: sql`count(*)` }).from(serviceScopes).where(eq(serviceScopes.clientId, id))
      ]);
      const dependencies = [];
      if (spendLogsCount[0].count > 0) dependencies.push(`${spendLogsCount[0].count} spend logs`);
      if (meetingsCount[0].count > 0) dependencies.push(`${meetingsCount[0].count} meetings`);
      if (serviceScopesCount[0].count > 0) dependencies.push(`${serviceScopesCount[0].count} service scopes`);
      if (dependencies.length > 0) {
        throw new Error(`Cannot permanently delete client with existing ${dependencies.join(", ")}. Please remove them first or use soft delete (trash) instead.`);
      }
      const result = await db.delete(clients).where(eq(clients.id, id));
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }
  async getSpendLogs(clientId) {
    return await db.select().from(spendLogs).where(eq(spendLogs.clientId, clientId)).orderBy(spendLogs.date);
  }
  async getAllSpendLogs() {
    return await db.select().from(spendLogs).orderBy(spendLogs.date);
  }
  async createSpendLog(insertSpendLog) {
    const client = await this.getClient(insertSpendLog.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    const newWalletSpent = client.walletSpent + insertSpendLog.amount;
    const balanceAfter = client.walletDeposited - newWalletSpent;
    const [spendLog] = await db.insert(spendLogs).values({
      clientId: insertSpendLog.clientId,
      date: insertSpendLog.date,
      amount: insertSpendLog.amount,
      note: insertSpendLog.note || null,
      balanceAfter
    }).returning();
    await db.update(clients).set({
      walletSpent: sql`${clients.walletSpent} + ${insertSpendLog.amount}`
    }).where(eq(clients.id, insertSpendLog.clientId));
    return spendLog;
  }
  async getMeetings() {
    return await db.select().from(meetings).orderBy(meetings.datetime);
  }
  async getMeeting(id) {
    const result = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
    return result[0];
  }
  async createMeeting(insertMeeting) {
    const meetingData = {
      clientId: insertMeeting.clientId,
      title: insertMeeting.title,
      datetime: new Date(insertMeeting.datetime),
      location: insertMeeting.location,
      reminders: insertMeeting.reminders || ["1 day before", "3 hours before", "30 min before"]
    };
    const [meeting] = await db.insert(meetings).values(meetingData).returning();
    return meeting;
  }
  async updateMeeting(id, updates) {
    const [updated] = await db.update(meetings).set(updates).where(eq(meetings.id, id)).returning();
    return updated;
  }
  async deleteMeeting(id) {
    const result = await db.delete(meetings).where(eq(meetings.id, id));
    return result.rowCount > 0;
  }
  // Todo operations
  async getTodos() {
    return await db.select().from(todos).orderBy(desc(todos.createdAt));
  }
  async getTodo(id) {
    const result = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
    return result[0];
  }
  async createTodo(insertTodo) {
    const [todo] = await db.insert(todos).values(insertTodo).returning();
    return todo;
  }
  async updateTodo(id, updates) {
    const [updated] = await db.update(todos).set(updates).where(eq(todos.id, id)).returning();
    return updated;
  }
  async deleteTodo(id) {
    const result = await db.delete(todos).where(eq(todos.id, id));
    return result.rowCount > 0;
  }
  // WhatsApp template operations
  async getWhatsappTemplates() {
    return await db.select().from(whatsappTemplates).orderBy(desc(whatsappTemplates.createdAt));
  }
  async getWhatsappTemplate(id) {
    const result = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.id, id)).limit(1);
    return result[0];
  }
  async createWhatsappTemplate(insertTemplate) {
    const [template] = await db.insert(whatsappTemplates).values(insertTemplate).returning();
    return template;
  }
  async updateWhatsappTemplate(id, updates) {
    const [updated] = await db.update(whatsappTemplates).set(updates).where(eq(whatsappTemplates.id, id)).returning();
    return updated;
  }
  async deleteWhatsappTemplate(id) {
    const result = await db.delete(whatsappTemplates).where(eq(whatsappTemplates.id, id));
    return result.rowCount > 0;
  }
  async getDashboardMetrics() {
    const allClients = await this.getClients();
    const activeClients = allClients.filter((c) => c.status === "Active").length;
    const totals = allClients.reduce(
      (acc, client) => {
        acc.totalDeposited += client.walletDeposited;
        acc.totalSpent += client.walletSpent;
        return acc;
      },
      { totalDeposited: 0, totalSpent: 0 }
    );
    return {
      ...totals,
      balance: totals.totalDeposited - totals.totalSpent,
      activeClients
    };
  }
  // Company settings operations
  async getCompanySettings() {
    const result = await db.select().from(companySettings).where(eq(companySettings.isDefault, true)).limit(1);
    return result[0];
  }
  async createCompanySettings(insertCompanySettings) {
    await db.update(companySettings).set({ isDefault: false });
    const [settings] = await db.insert(companySettings).values({
      ...insertCompanySettings,
      isDefault: true
    }).returning();
    return settings;
  }
  async updateCompanySettings(id, updates) {
    const [updated] = await db.update(companySettings).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(companySettings.id, id)).returning();
    return updated;
  }
  // Service scope operations
  async getServiceScopes(clientId) {
    return await db.select().from(serviceScopes).where(eq(serviceScopes.clientId, clientId)).orderBy(desc(serviceScopes.createdAt));
  }
  async getServiceScope(id) {
    const result = await db.select().from(serviceScopes).where(eq(serviceScopes.id, id)).limit(1);
    return result[0];
  }
  async createServiceScope(insertServiceScope) {
    const [serviceScope] = await db.insert(serviceScopes).values(insertServiceScope).returning();
    return serviceScope;
  }
  async updateServiceScope(id, updates) {
    const [updated] = await db.update(serviceScopes).set(updates).where(eq(serviceScopes.id, id)).returning();
    return updated;
  }
  async deleteServiceScope(id) {
    const result = await db.delete(serviceScopes).where(eq(serviceScopes.id, id));
    return result.rowCount > 0;
  }
  async getServiceAnalytics(serviceName) {
    const clientsWithService = await db.select().from(serviceScopes).where(eq(serviceScopes.serviceName, serviceName));
    const totalClients = clientsWithService.length;
    const activeScopes = clientsWithService.filter((s) => s.status === "Active").length;
    const sevenDaysAgo = /* @__PURE__ */ new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const clientIds = clientsWithService.map((s) => s.clientId);
    const spendingData = await db.select({
      date: spendLogs.date,
      amount: sum(spendLogs.amount).as("amount")
    }).from(spendLogs).where(and(
      sql`${spendLogs.clientId} = ANY(${clientIds})`,
      gte(sql`DATE(${spendLogs.date})`, sevenDaysAgo.toISOString().split("T")[0])
    )).groupBy(spendLogs.date).orderBy(spendLogs.date);
    return {
      serviceName,
      totalClients,
      activeScopes,
      last7DaysSpending: spendingData.map((d) => ({
        date: d.date,
        amount: Number(d.amount) || 0
      }))
    };
  }
  async softDeleteClient(id) {
    const [updated] = await db.update(clients).set({ deleted: true }).where(eq(clients.id, id)).returning({ id: clients.id });
    return !!updated;
  }
  async restoreClient(id) {
    const [updated] = await db.update(clients).set({ deleted: false }).where(eq(clients.id, id)).returning({ id: clients.id });
    return !!updated;
  }
  async getDeletedClients() {
    return await db.select().from(clients).where(eq(clients.deleted, true)).orderBy(desc(clients.createdAt));
  }
  // Custom Button CRUD Operations
  async getCustomButtons() {
    return await db.select().from(customButtons).where(eq(customButtons.isActive, true)).orderBy(customButtons.sortOrder, customButtons.createdAt);
  }
  async createCustomButton(insertButton) {
    const maxOrder = await db.select({ max: sql`max(${customButtons.sortOrder})` }).from(customButtons);
    const nextOrder = (maxOrder[0]?.max || 0) + 1;
    const [button] = await db.insert(customButtons).values({
      ...insertButton,
      sortOrder: nextOrder
    }).returning();
    return button;
  }
  async updateCustomButton(id, updates) {
    const [updated] = await db.update(customButtons).set(updates).where(eq(customButtons.id, id)).returning();
    return updated;
  }
  async deleteCustomButton(id) {
    const [deleted] = await db.delete(customButtons).where(eq(customButtons.id, id)).returning({ id: customButtons.id });
    return !!deleted;
  }
  async reorderCustomButtons(buttonIds) {
    try {
      for (let i = 0; i < buttonIds.length; i++) {
        await db.update(customButtons).set({ sortOrder: i }).where(eq(customButtons.id, buttonIds[i]));
      }
      return true;
    } catch (error) {
      console.error("Error reordering custom buttons:", error);
      return false;
    }
  }
  async getWebsiteProjects(clientId) {
    return await db.select().from(websiteProjects).where(eq(websiteProjects.clientId, clientId)).orderBy(desc(websiteProjects.createdAt));
  }
  async getAllWebsiteProjects() {
    return await db.select().from(websiteProjects).orderBy(desc(websiteProjects.createdAt));
  }
  async getWebsiteProject(id) {
    const [project] = await db.select().from(websiteProjects).where(eq(websiteProjects.id, id));
    return project;
  }
  async createWebsiteProject(insertProject) {
    const portalKey = `${insertProject.projectName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const [project] = await db.insert(websiteProjects).values({ ...insertProject, portalKey }).returning();
    return project;
  }
  async updateWebsiteProject(id, updates) {
    const [project] = await db.update(websiteProjects).set(updates).where(eq(websiteProjects.id, id)).returning();
    return project;
  }
  async deleteWebsiteProject(id) {
    const [deleted] = await db.delete(websiteProjects).where(eq(websiteProjects.id, id)).returning({ id: websiteProjects.id });
    return !!deleted;
  }
  // File upload operations
  async saveUpload(insertUpload) {
    const [upload] = await db.insert(uploads).values(insertUpload).returning();
    return upload;
  }
  async getUpload(id) {
    const result = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
    return result[0];
  }
  async deleteUpload(id) {
    const [deleted] = await db.delete(uploads).where(eq(uploads.id, id)).returning({ id: uploads.id });
    return !!deleted;
  }
  // Invoice PDF operations
  async saveInvoicePdf(insertInvoicePdf) {
    const [invoicePdf] = await db.insert(invoicePdfs).values(insertInvoicePdf).returning();
    return invoicePdf;
  }
  async getInvoicePdfs() {
    return await db.select().from(invoicePdfs).orderBy(desc(invoicePdfs.createdAt));
  }
  async getInvoicePdf(id) {
    const result = await db.select().from(invoicePdfs).where(eq(invoicePdfs.id, id)).limit(1);
    return result[0];
  }
  async deleteInvoicePdf(id) {
    const [deleted] = await db.delete(invoicePdfs).where(eq(invoicePdfs.id, id)).returning({ id: invoicePdfs.id });
    return !!deleted;
  }
  // Quick Message operations
  async getQuickMessages() {
    return await db.select().from(quickMessages).where(eq(quickMessages.isActive, true)).orderBy(desc(quickMessages.sortOrder), desc(quickMessages.createdAt));
  }
  async getQuickMessage(id) {
    const result = await db.select().from(quickMessages).where(eq(quickMessages.id, id)).limit(1);
    return result[0];
  }
  async createQuickMessage(insertQuickMessage) {
    const [quickMessage] = await db.insert(quickMessages).values(insertQuickMessage).returning();
    return quickMessage;
  }
  async updateQuickMessage(id, updates) {
    const [updated] = await db.update(quickMessages).set({
      ...updates,
      updatedAt: sql`now()`
    }).where(eq(quickMessages.id, id)).returning();
    return updated;
  }
  async deleteQuickMessage(id) {
    const [deleted] = await db.delete(quickMessages).where(eq(quickMessages.id, id)).returning({ id: quickMessages.id });
    return !!deleted;
  }
  // Payment Request operations
  async getPaymentRequests() {
    return await db.select().from(paymentRequests).orderBy(desc(paymentRequests.requestDate));
  }
  async getPaymentRequest(id) {
    const result = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
    return result[0];
  }
  async getClientPaymentRequests(clientId) {
    return await db.select().from(paymentRequests).where(eq(paymentRequests.clientId, clientId)).orderBy(desc(paymentRequests.requestDate));
  }
  async createPaymentRequest(insertPaymentRequest) {
    const [paymentRequest] = await db.insert(paymentRequests).values(insertPaymentRequest).returning();
    return paymentRequest;
  }
  async updatePaymentRequest(id, updates) {
    const [updated] = await db.update(paymentRequests).set(updates).where(eq(paymentRequests.id, id)).returning();
    return updated;
  }
  async approvePaymentRequest(id, adminNote, processedBy) {
    const paymentRequest = await this.getPaymentRequest(id);
    if (!paymentRequest || paymentRequest.status !== "Pending") {
      return void 0;
    }
    const client = await this.getClient(paymentRequest.clientId);
    if (!client) {
      return void 0;
    }
    await this.updateClient(paymentRequest.clientId, {
      walletDeposited: client.walletDeposited + paymentRequest.amount
    });
    const [updated] = await db.update(paymentRequests).set({
      status: "Approved",
      adminNote: adminNote || null,
      processedBy: processedBy || null,
      processedDate: sql`now()`
    }).where(eq(paymentRequests.id, id)).returning();
    return updated;
  }
  async rejectPaymentRequest(id, adminNote, processedBy) {
    const [updated] = await db.update(paymentRequests).set({
      status: "Rejected",
      adminNote: adminNote || null,
      processedBy: processedBy || null,
      processedDate: sql`now()`
    }).where(eq(paymentRequests.id, id)).returning();
    return updated;
  }
  // Project Management Methods
  // Project Type operations
  async getProjectTypes() {
    return await db.select().from(projectTypes).where(eq(projectTypes.isActive, true)).orderBy(desc(projectTypes.isDefault), desc(projectTypes.createdAt));
  }
  async getProjectType(id) {
    const result = await db.select().from(projectTypes).where(eq(projectTypes.id, id)).limit(1);
    return result[0];
  }
  async createProjectType(insertProjectType) {
    const [projectType] = await db.insert(projectTypes).values(insertProjectType).returning();
    return projectType;
  }
  async updateProjectType(id, updates) {
    const [updated] = await db.update(projectTypes).set(updates).where(eq(projectTypes.id, id)).returning();
    return updated;
  }
  async deleteProjectType(id) {
    const result = await db.delete(projectTypes).where(eq(projectTypes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Project operations
  async getProjects() {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }
  async getProject(id) {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }
  async getProjectWithDetails(id) {
    const project = await this.getProject(id);
    if (!project) return void 0;
    const [client, assignments, payments] = await Promise.all([
      project.clientId ? this.getClient(project.clientId) : Promise.resolve(void 0),
      this.getProjectAssignments(id),
      this.getProjectPayments(id)
    ]);
    const assignmentsWithEmployees = await Promise.all(
      assignments.map(async (assignment) => {
        const employee = await this.getEmployee(assignment.employeeId);
        return { ...assignment, employee };
      })
    );
    return { ...project, client, assignments: assignmentsWithEmployees, payments };
  }
  async getClientProjects(clientId) {
    return await db.select().from(projects).where(eq(projects.clientId, clientId)).orderBy(desc(projects.createdAt));
  }
  async createProject(insertProject) {
    const [created] = await db.insert(projects).values(insertProject).returning();
    return created;
  }
  async updateProject(id, updates) {
    const [updated] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return updated;
  }
  async deleteProject(id) {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }
  // Employee operations
  async getEmployees() {
    return await db.select().from(employees).where(eq(employees.isActive, true)).orderBy(desc(employees.createdAt));
  }
  async getEmployee(id) {
    const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
    return result[0];
  }
  async getEmployeeWithDetails(id) {
    const employee = await this.getEmployee(id);
    if (!employee) return void 0;
    const [assignments, salaryPayments2] = await Promise.all([
      this.getEmployeeAssignments(id),
      this.getSalaryPayments(id)
    ]);
    const assignmentsWithProjects = await Promise.all(
      assignments.map(async (assignment) => {
        const project = await this.getProject(assignment.projectId);
        return { ...assignment, project };
      })
    );
    return { ...employee, assignments: assignmentsWithProjects, salaryPayments: salaryPayments2 };
  }
  async getEmployeeByPortalKey(portalKey) {
    const result = await db.select().from(employees).where(eq(employees.portalKey, portalKey)).limit(1);
    return result[0];
  }
  async createEmployee(insertEmployee) {
    const portalKey = insertEmployee.portalKey || Math.random().toString(36).slice(2, 7);
    const [created] = await db.insert(employees).values({
      ...insertEmployee,
      portalKey
    }).returning();
    return created;
  }
  async updateEmployee(id, updates) {
    const [updated] = await db.update(employees).set(updates).where(eq(employees.id, id)).returning();
    return updated;
  }
  async deleteEmployee(id) {
    const result = await db.update(employees).set({ isActive: false }).where(eq(employees.id, id));
    return result.rowCount > 0;
  }
  // Project Assignment operations
  async getAllProjectAssignments() {
    return await db.select().from(projectAssignments).orderBy(desc(projectAssignments.assignedDate));
  }
  async getProjectAssignments(projectId) {
    return await db.select().from(projectAssignments).where(eq(projectAssignments.projectId, projectId)).orderBy(desc(projectAssignments.assignedDate));
  }
  async getEmployeeAssignments(employeeId) {
    return await db.select().from(projectAssignments).where(eq(projectAssignments.employeeId, employeeId)).orderBy(desc(projectAssignments.assignedDate));
  }
  async createProjectAssignment(insertAssignment) {
    const [created] = await db.insert(projectAssignments).values(insertAssignment).returning();
    return created;
  }
  async updateProjectAssignment(id, updates) {
    const [updated] = await db.update(projectAssignments).set(updates).where(eq(projectAssignments.id, id)).returning();
    return updated;
  }
  async deleteProjectAssignment(id) {
    const result = await db.delete(projectAssignments).where(eq(projectAssignments.id, id));
    return result.rowCount > 0;
  }
  // Project Payment operations
  async getProjectPayments(projectId) {
    return await db.select().from(projectPayments).where(eq(projectPayments.projectId, projectId)).orderBy(desc(projectPayments.createdAt));
  }
  async createProjectPayment(insertPayment) {
    const [created] = await db.insert(projectPayments).values(insertPayment).returning();
    return created;
  }
  async updateProjectPayment(id, updates) {
    const [updated] = await db.update(projectPayments).set(updates).where(eq(projectPayments.id, id)).returning();
    return updated;
  }
  async deleteProjectPayment(id) {
    const result = await db.delete(projectPayments).where(eq(projectPayments.id, id));
    return result.rowCount > 0;
  }
  // Salary Payment operations
  async getSalaryPayments(employeeId) {
    return await db.select().from(salaryPayments).where(eq(salaryPayments.employeeId, employeeId)).orderBy(desc(salaryPayments.createdAt));
  }
  async getAllSalaryPayments() {
    return await db.select().from(salaryPayments).orderBy(desc(salaryPayments.createdAt));
  }
  async createSalaryPayment(insertPayment) {
    const [created] = await db.insert(salaryPayments).values(insertPayment).returning();
    const employee = await this.getEmployee(insertPayment.employeeId);
    if (employee) {
      let updates = {};
      if (insertPayment.type === "advance") {
        updates.totalAdvance = employee.totalAdvance + insertPayment.amount;
      } else if (insertPayment.type === "salary" || insertPayment.type === "project_payment" || insertPayment.type === "bonus") {
        updates.totalIncome = employee.totalIncome + insertPayment.amount;
        updates.totalDue = Math.max(0, employee.totalDue - insertPayment.amount);
      }
      if (Object.keys(updates).length > 0) {
        await this.updateEmployee(insertPayment.employeeId, updates);
      }
    }
    return created;
  }
  async updateSalaryPayment(id, updates) {
    const [updated] = await db.update(salaryPayments).set(updates).where(eq(salaryPayments.id, id)).returning();
    return updated;
  }
  async deleteSalaryPayment(id) {
    const result = await db.delete(salaryPayments).where(eq(salaryPayments.id, id));
    return result.rowCount > 0;
  }
  // Admin User operations
  async getAdminByUsername(username) {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return result[0];
  }
  async createAdminUser(insertAdmin) {
    const [created] = await db.insert(adminUsers).values(insertAdmin).returning();
    return created;
  }
  async updateAdminUser(id, updates) {
    const [updated] = await db.update(adminUsers).set(updates).where(eq(adminUsers.id, id)).returning();
    return updated;
  }
};

// server/storage.ts
var storage = new DatabaseStorage();

// server/websocket.ts
import { WebSocketServer, WebSocket } from "ws";
var NotificationService = class {
  wss = null;
  connections = /* @__PURE__ */ new Map();
  initialize(port) {
    this.wss = new WebSocketServer({
      port,
      clientTracking: true
    });
    console.log(`[WebSocket] Notification server running on port ${port}`);
    this.wss.on("connection", (ws, request) => {
      console.log("[WebSocket] New client connected");
      ws.isAlive = true;
      const url = new URL(request.url || "", `http://${request.headers.host}`);
      const role = url.searchParams.get("role");
      const userId = url.searchParams.get("userId");
      ws.role = role || "admin";
      ws.userId = userId || "anonymous";
      if (!this.connections.has(ws.role)) {
        this.connections.set(ws.role, []);
      }
      this.connections.get(ws.role)?.push(ws);
      this.sendToClient(ws, {
        id: "welcome",
        type: "payment_request",
        title: "Connection Established",
        message: `Connected as ${ws.role}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        data: {}
      });
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log("[WebSocket] Received:", message);
          if (message.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      });
      ws.on("pong", () => {
        ws.isAlive = true;
      });
      ws.on("close", () => {
        console.log("[WebSocket] Client disconnected");
        this.removeConnection(ws);
      });
      ws.on("error", (error) => {
        console.error("[WebSocket] Connection error:", error);
        this.removeConnection(ws);
      });
    });
    this.startHeartbeat();
  }
  removeConnection(ws) {
    Array.from(this.connections.entries()).forEach(([role, connections]) => {
      const index = connections.indexOf(ws);
      if (index !== -1) {
        connections.splice(index, 1);
      }
    });
  }
  startHeartbeat() {
    const interval = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          console.log("[WebSocket] Terminating dead connection");
          this.removeConnection(ws);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 3e4);
    this.wss?.on("close", () => {
      clearInterval(interval);
    });
  }
  sendToClient(ws, notification) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
    }
  }
  // Send notification to all admin clients
  notifyAdmins(notification) {
    const adminConnections = this.connections.get("admin") || [];
    let sentCount = 0;
    adminConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, notification);
        sentCount++;
      } else {
        this.removeConnection(ws);
      }
    });
    console.log(`[WebSocket] Notification sent to ${sentCount} admin(s):`, notification.title);
    return sentCount;
  }
  // Send notification to specific client
  notifyClient(clientId, notification) {
    const clientConnections = this.connections.get("client") || [];
    let sentCount = 0;
    clientConnections.forEach((ws) => {
      if (ws.userId === clientId && ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, notification);
        sentCount++;
      }
    });
    console.log(`[WebSocket] Notification sent to client ${clientId}:`, notification.title);
    return sentCount;
  }
  // Broadcast to all connected clients
  broadcast(notification) {
    if (!this.wss) return 0;
    let sentCount = 0;
    this.wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, notification);
        sentCount++;
      }
    });
    console.log(`[WebSocket] Broadcast sent to ${sentCount} client(s):`, notification.title);
    return sentCount;
  }
  // Create notification for new payment request
  createPaymentRequestNotification(paymentRequest, client) {
    return {
      id: `payment_${paymentRequest.id}_${Date.now()}`,
      type: "payment_request",
      title: "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B0\u09BF\u0995\u09CB\u09AF\u09BC\u09C7\u09B8\u09CD\u099F",
      message: `${client.name} \u098F\u0995\u099F\u09BF ${paymentRequest.amount / 100} \u099F\u09BE\u0995\u09BE\u09B0 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B0\u09BF\u0995\u09CB\u09AF\u09BC\u09C7\u09B8\u09CD\u099F \u09AA\u09BE\u09A0\u09BF\u09AF\u09BC\u09C7\u099B\u09C7\u09A8`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      data: {
        paymentRequest,
        client
      }
    };
  }
  // Get connection stats
  getStats() {
    const stats = {
      totalConnections: 0,
      adminConnections: 0,
      clientConnections: 0,
      connectionsByRole: {}
    };
    Array.from(this.connections.entries()).forEach(([role, connections]) => {
      const activeConnections = connections.filter((ws) => ws.readyState === WebSocket.OPEN);
      stats.connectionsByRole[role] = activeConnections.length;
      stats.totalConnections += activeConnections.length;
      if (role === "admin") stats.adminConnections = activeConnections.length;
      if (role === "client") stats.clientConnections = activeConnections.length;
    });
    return stats;
  }
  // Close all connections and stop server
  close() {
    if (this.wss) {
      this.wss.close();
      this.connections.clear();
      console.log("[WebSocket] Server closed");
    }
  }
};
var notificationService = new NotificationService();

// server/routes.ts
init_schema();
import bcrypt from "bcryptjs";
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!admin.isActive) {
        return res.status(403).json({ error: "Account is disabled" });
      }
      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;
      res.json({
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });
  app2.get("/api/auth/session", async (req, res) => {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const admin = await storage.getAdminByUsername(req.session.adminUsername);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      res.json({
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });
  app2.post("/api/auth/init-admin", async (req, res) => {
    try {
      const { username, password, fullName, email } = insertAdminUserSchema.parse(req.body);
      const existing = await storage.getAdminByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Admin already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await storage.createAdminUser({
        username,
        password: hashedPassword,
        fullName,
        email,
        isActive: true
      });
      res.json({
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to create admin" });
    }
  });
  app2.get("/api/clients", async (req, res) => {
    try {
      const clients2 = await storage.getClients();
      res.json(clients2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });
  app2.get("/api/clients/deleted", async (req, res) => {
    try {
      const deletedClients = await storage.getDeletedClients();
      res.json(deletedClients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deleted clients" });
    }
  });
  app2.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClientWithLogs(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });
  app2.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ error: "Invalid client data" });
    }
  });
  app2.patch("/api/clients/:id/toggle-active", async (req, res) => {
    try {
      const currentClient = await storage.getClient(req.params.id);
      if (!currentClient) {
        return res.status(404).json({ error: "Client not found" });
      }
      const updatedClient = await storage.updateClient(req.params.id, {
        status: currentClient.status === "Active" ? "Inactive" : "Active"
      });
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle client status" });
    }
  });
  app2.patch("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client" });
    }
  });
  app2.delete("/api/clients/:id", async (req, res) => {
    try {
      const success = await storage.deleteClient(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes("Cannot permanently delete client")) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to delete client" });
      }
    }
  });
  app2.patch("/api/clients/:id/trash", async (req, res) => {
    try {
      const success = await storage.softDeleteClient(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to trash client" });
    }
  });
  app2.patch("/api/clients/:id/restore", async (req, res) => {
    try {
      const success = await storage.restoreClient(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to restore client" });
    }
  });
  app2.get("/api/clients/:id/spend-logs", async (req, res) => {
    try {
      const logs = await storage.getSpendLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spend logs" });
    }
  });
  app2.get("/api/spend-logs/all", async (req, res) => {
    try {
      const allLogs = await storage.getAllSpendLogs();
      res.json(allLogs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all spend logs" });
    }
  });
  app2.post("/api/spend-logs", async (req, res) => {
    try {
      const requestData = {
        ...req.body,
        amount: parseInt(req.body.amount)
      };
      const validatedData = insertSpendLogSchema.parse(requestData);
      const spendLog = await storage.createSpendLog(validatedData);
      res.status(201).json(spendLog);
    } catch (error) {
      console.error("Spend log validation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid spend log data" });
      }
    }
  });
  app2.get("/api/meetings", async (req, res) => {
    try {
      const meetings2 = await storage.getMeetings();
      res.json(meetings2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  });
  app2.post("/api/meetings", async (req, res) => {
    try {
      const validatedData = insertMeetingSchema.parse({
        ...req.body,
        datetime: new Date(req.body.datetime)
      });
      const meeting = await storage.createMeeting(validatedData);
      res.status(201).json(meeting);
    } catch (error) {
      res.status(400).json({ error: "Invalid meeting data" });
    }
  });
  app2.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });
  app2.post("/api/clients/:id/add-funds", async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const updatedClient = await storage.updateClient(req.params.id, {
        walletDeposited: client.walletDeposited + amount
      });
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ error: "Failed to add funds" });
    }
  });
  app2.get("/api/todos", async (req, res) => {
    try {
      const todos2 = await storage.getTodos();
      res.json(todos2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch todos" });
    }
  });
  app2.post("/api/todos", async (req, res) => {
    try {
      const requestData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : void 0
      };
      const validatedData = insertTodoSchema.parse(requestData);
      const todo = await storage.createTodo(validatedData);
      res.status(201).json(todo);
    } catch (error) {
      console.error("Todo creation error:", error);
      res.status(400).json({ error: "Invalid todo data" });
    }
  });
  app2.patch("/api/todos/:id", async (req, res) => {
    try {
      const updateData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : req.body.dueDate
      };
      const todo = await storage.updateTodo(req.params.id, updateData);
      if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: "Failed to update todo" });
    }
  });
  app2.delete("/api/todos/:id", async (req, res) => {
    try {
      const success = await storage.deleteTodo(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete todo" });
    }
  });
  app2.get("/api/whatsapp-templates", async (req, res) => {
    try {
      const templates = await storage.getWhatsappTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });
  app2.post("/api/whatsapp-templates", async (req, res) => {
    try {
      const validatedData = insertWhatsappTemplateSchema.parse(req.body);
      const template = await storage.createWhatsappTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Template creation error:", error);
      res.status(400).json({ error: "Invalid template data" });
    }
  });
  app2.patch("/api/whatsapp-templates/:id", async (req, res) => {
    try {
      const template = await storage.updateWhatsappTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update template" });
    }
  });
  app2.delete("/api/whatsapp-templates/:id", async (req, res) => {
    try {
      const success = await storage.deleteWhatsappTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  });
  app2.post("/api/whatsapp/generate-link", (req, res) => {
    try {
      const { clientPhone, message, templateId } = req.body;
      if (!clientPhone || !message) {
        return res.status(400).json({ error: "Client phone and message are required" });
      }
      const ADMIN_WHATSAPP = "8801798205143";
      let cleanClientPhone = clientPhone.replace(/[^\d]/g, "");
      if (cleanClientPhone.startsWith("01")) {
        cleanClientPhone = "88" + cleanClientPhone;
      } else if (!cleanClientPhone.startsWith("88")) {
        cleanClientPhone = "88" + cleanClientPhone;
      }
      const encodedMessage = encodeURIComponent(message);
      const finalMessage = `Client: ${cleanClientPhone}

${message}`;
      const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(finalMessage)}`;
      res.json({
        link: whatsappUrl,
        clientPhone: cleanClientPhone,
        adminPhone: ADMIN_WHATSAPP,
        message: finalMessage
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate WhatsApp link" });
    }
  });
  app2.get("/api/quick-messages", async (req, res) => {
    try {
      const quickMessages2 = await storage.getQuickMessages();
      res.json(quickMessages2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quick messages" });
    }
  });
  app2.post("/api/quick-messages", async (req, res) => {
    try {
      const validatedData = insertQuickMessageSchema.parse(req.body);
      const quickMessage = await storage.createQuickMessage(validatedData);
      res.status(201).json(quickMessage);
    } catch (error) {
      console.error("Quick message creation error:", error);
      res.status(400).json({ error: "Invalid quick message data" });
    }
  });
  app2.patch("/api/quick-messages/:id", async (req, res) => {
    try {
      const quickMessage = await storage.updateQuickMessage(req.params.id, req.body);
      if (!quickMessage) {
        return res.status(404).json({ error: "Quick message not found" });
      }
      res.json(quickMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quick message" });
    }
  });
  app2.delete("/api/quick-messages/:id", async (req, res) => {
    try {
      const success = await storage.deleteQuickMessage(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Quick message not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quick message" });
    }
  });
  app2.get("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company settings" });
    }
  });
  app2.post("/api/company-settings", async (req, res) => {
    try {
      const { insertCompanySettingsSchema: insertCompanySettingsSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const validatedSettings = insertCompanySettingsSchema2.parse(req.body);
      const settings = await storage.createCompanySettings(validatedSettings);
      res.status(201).json(settings);
    } catch (error) {
      console.error("Company settings creation error:", error);
      res.status(400).json({ error: "Invalid settings data" });
    }
  });
  app2.patch("/api/company-settings/:id", async (req, res) => {
    try {
      const settings = await storage.updateCompanySettings(req.params.id, req.body);
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  app2.get("/api/clients/:id/service-scopes", async (req, res) => {
    try {
      const serviceScopes2 = await storage.getServiceScopes(req.params.id);
      res.json(serviceScopes2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service scopes" });
    }
  });
  app2.post("/api/service-scopes", async (req, res) => {
    try {
      const { insertServiceScopeSchema: insertServiceScopeSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const validatedScope = insertServiceScopeSchema2.parse(req.body);
      const serviceScope = await storage.createServiceScope(validatedScope);
      res.status(201).json(serviceScope);
    } catch (error) {
      console.error("Service scope creation error:", error);
      res.status(400).json({ error: "Invalid service scope data" });
    }
  });
  app2.patch("/api/service-scopes/:id", async (req, res) => {
    try {
      const serviceScope = await storage.updateServiceScope(req.params.id, req.body);
      if (!serviceScope) {
        return res.status(404).json({ error: "Service scope not found" });
      }
      res.json(serviceScope);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service scope" });
    }
  });
  app2.delete("/api/service-scopes/:id", async (req, res) => {
    try {
      const success = await storage.deleteServiceScope(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Service scope not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service scope" });
    }
  });
  app2.get("/api/service-analytics/:serviceName", async (req, res) => {
    try {
      const analytics = await storage.getServiceAnalytics(req.params.serviceName);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service analytics" });
    }
  });
  app2.get("/api/clients/:id/details", async (req, res) => {
    try {
      const clientDetails = await storage.getClientWithDetails(req.params.id);
      if (!clientDetails) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(clientDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client details" });
    }
  });
  app2.get("/api/clients/portal/:portalKey", async (req, res) => {
    try {
      const clients2 = await storage.getClients();
      const client = clients2.find((c) => c.portalKey === req.params.portalKey);
      if (!client) {
        return res.status(404).json({ error: "Client portal not found" });
      }
      const clientDetails = await storage.getClientWithDetails(client.id);
      if (!clientDetails) {
        return res.status(404).json({ error: "Client details not found" });
      }
      res.json(clientDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client portal data" });
    }
  });
  app2.get("/api/custom-buttons", async (req, res) => {
    try {
      const buttons = await storage.getCustomButtons();
      res.json(buttons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch custom buttons" });
    }
  });
  app2.post("/api/custom-buttons", async (req, res) => {
    try {
      const validatedData = insertCustomButtonSchema.parse(req.body);
      const button = await storage.createCustomButton(validatedData);
      res.status(201).json(button);
    } catch (error) {
      console.error("Custom button creation error:", error);
      res.status(400).json({ error: "Invalid custom button data" });
    }
  });
  app2.patch("/api/custom-buttons/:id", async (req, res) => {
    try {
      const button = await storage.updateCustomButton(req.params.id, req.body);
      if (!button) {
        return res.status(404).json({ error: "Custom button not found" });
      }
      res.json(button);
    } catch (error) {
      res.status(500).json({ error: "Failed to update custom button" });
    }
  });
  app2.delete("/api/custom-buttons/:id", async (req, res) => {
    try {
      const success = await storage.deleteCustomButton(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Custom button not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete custom button" });
    }
  });
  app2.patch("/api/custom-buttons/reorder", async (req, res) => {
    try {
      const { buttonIds } = req.body;
      if (!Array.isArray(buttonIds)) {
        return res.status(400).json({ error: "buttonIds must be an array" });
      }
      const success = await storage.reorderCustomButtons(buttonIds);
      if (!success) {
        return res.status(500).json({ error: "Failed to reorder buttons" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder custom buttons" });
    }
  });
  app2.post("/api/uploads", async (req, res) => {
    try {
      const { dataUrl, fileName, uploadedBy } = req.body;
      if (!dataUrl || !fileName) {
        return res.status(400).json({ error: "dataUrl and fileName are required" });
      }
      const sizeInBytes = dataUrl.length * 3 / 4;
      if (sizeInBytes > 2 * 1024 * 1024) {
        return res.status(400).json({ error: "File size too large (max 2MB)" });
      }
      const mimeMatch = dataUrl.match(/^data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ error: "Only image files are allowed" });
      }
      const uploadData = {
        fileName,
        mimeType,
        size: Math.round(sizeInBytes),
        data: dataUrl,
        uploadedBy: uploadedBy || null
      };
      const validatedData = insertUploadSchema.parse(uploadData);
      const upload = await storage.saveUpload(validatedData);
      res.status(201).json({
        id: upload.id,
        url: `/api/uploads/${upload.id}`,
        fileName: upload.fileName,
        mimeType: upload.mimeType,
        size: upload.size
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(400).json({ error: "Invalid upload data" });
    }
  });
  app2.get("/api/uploads", async (req, res) => {
    res.json([]);
  });
  app2.get("/api/uploads/:id", async (req, res) => {
    try {
      const upload = await storage.getUpload(req.params.id);
      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }
      const base64Data = upload.data.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      res.set({
        "Content-Type": upload.mimeType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=86400"
        // 24 hours cache
      });
      res.send(buffer);
    } catch (error) {
      console.error("Get upload error:", error);
      res.status(500).json({ error: "Failed to retrieve upload" });
    }
  });
  app2.delete("/api/uploads/:id", async (req, res) => {
    try {
      const success = await storage.deleteUpload(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Upload not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete upload" });
    }
  });
  app2.post("/api/invoice-pdfs", async (req, res) => {
    try {
      const { invoiceNo, clientId, fileName, dataBase64 } = req.body;
      if (!invoiceNo || !clientId || !fileName || !dataBase64) {
        return res.status(400).json({ error: "invoiceNo, clientId, fileName, and dataBase64 are required" });
      }
      const sizeInBytes = dataBase64.length * 3 / 4;
      const pdfData = {
        invoiceNo,
        clientId,
        fileName,
        mimeType: "application/pdf",
        size: sizeInBytes,
        data: `data:application/pdf;base64,${dataBase64}`
      };
      const validatedData = insertInvoicePdfSchema.parse(pdfData);
      const invoicePdf = await storage.saveInvoicePdf(validatedData);
      res.status(201).json({
        id: invoicePdf.id,
        invoiceNo: invoicePdf.invoiceNo,
        fileName: invoicePdf.fileName,
        url: `/api/invoice-pdfs/${invoicePdf.id}`,
        createdAt: invoicePdf.createdAt
      });
    } catch (error) {
      console.error("Save invoice PDF error:", error);
      res.status(400).json({ error: "Invalid PDF data" });
    }
  });
  app2.get("/api/invoice-pdfs", async (req, res) => {
    try {
      const invoicePdfs2 = await storage.getInvoicePdfs();
      const pdfsMetadata = invoicePdfs2.map((pdf) => ({
        id: pdf.id,
        invoiceNo: pdf.invoiceNo,
        clientId: pdf.clientId,
        fileName: pdf.fileName,
        size: pdf.size,
        url: `/api/invoice-pdfs/${pdf.id}`,
        createdAt: pdf.createdAt
      }));
      res.json(pdfsMetadata);
    } catch (error) {
      console.error("Get invoice PDFs error:", error);
      res.status(500).json({ error: "Failed to retrieve invoice PDFs" });
    }
  });
  app2.get("/api/invoice-pdfs/:id", async (req, res) => {
    try {
      const invoicePdf = await storage.getInvoicePdf(req.params.id);
      if (!invoicePdf) {
        return res.status(404).json({ error: "Invoice PDF not found" });
      }
      const base64Data = invoicePdf.data.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoicePdf.fileName}"`,
        "Content-Length": buffer.length.toString()
      });
      res.send(buffer);
    } catch (error) {
      console.error("Get invoice PDF error:", error);
      res.status(500).json({ error: "Failed to retrieve invoice PDF" });
    }
  });
  app2.delete("/api/invoice-pdfs/:id", async (req, res) => {
    try {
      const success = await storage.deleteInvoicePdf(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Invoice PDF not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete invoice PDF" });
    }
  });
  app2.get("/api/website-projects", async (req, res) => {
    try {
      const projects2 = await storage.getAllWebsiteProjects();
      res.json(projects2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch website projects" });
    }
  });
  app2.get("/api/website-projects/client/:clientId", async (req, res) => {
    try {
      const projects2 = await storage.getWebsiteProjects(req.params.clientId);
      res.json(projects2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client website projects" });
    }
  });
  app2.get("/api/website-projects/:id", async (req, res) => {
    try {
      const project = await storage.getWebsiteProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Website project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch website project" });
    }
  });
  app2.post("/api/website-projects", async (req, res) => {
    try {
      const requestData = {
        ...req.body,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : null
      };
      const validatedData = insertWebsiteProjectSchema.parse(requestData);
      const portalKey = `WEB-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const project = await storage.createWebsiteProject({
        ...validatedData,
        portalKey
      });
      res.status(201).json(project);
    } catch (error) {
      console.error("Create website project error:", error);
      res.status(400).json({ error: "Invalid website project data" });
    }
  });
  app2.patch("/api/website-projects/:id", async (req, res) => {
    try {
      const project = await storage.updateWebsiteProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Website project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update website project" });
    }
  });
  app2.delete("/api/website-projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteWebsiteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Website project not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete website project" });
    }
  });
  app2.get("/api/payment-requests", async (req, res) => {
    try {
      const paymentRequests2 = await storage.getPaymentRequests();
      res.json(paymentRequests2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment requests" });
    }
  });
  app2.get("/api/payment-requests/:id", async (req, res) => {
    try {
      const paymentRequest = await storage.getPaymentRequest(req.params.id);
      if (!paymentRequest) {
        return res.status(404).json({ error: "Payment request not found" });
      }
      res.json(paymentRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment request" });
    }
  });
  app2.get("/api/clients/:clientId/payment-requests", async (req, res) => {
    try {
      const paymentRequests2 = await storage.getClientPaymentRequests(req.params.clientId);
      res.json(paymentRequests2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client payment requests" });
    }
  });
  app2.post("/api/payment-requests", async (req, res) => {
    try {
      const validatedData = insertPaymentRequestSchema.parse(req.body);
      const paymentRequest = await storage.createPaymentRequest(validatedData);
      try {
        const client = await storage.getClient(paymentRequest.clientId);
        if (client) {
          const notification = notificationService.createPaymentRequestNotification(paymentRequest, client);
          const sentCount = notificationService.notifyAdmins(notification);
          console.log(`[Notification] Payment request notification sent to ${sentCount} admin(s)`);
        }
      } catch (notificationError) {
        console.error("Failed to send payment request notification:", notificationError);
      }
      res.status(201).json(paymentRequest);
    } catch (error) {
      console.error("Payment request creation error:", error);
      res.status(400).json({ error: "Invalid payment request data" });
    }
  });
  app2.patch("/api/payment-requests/:id", async (req, res) => {
    try {
      const paymentRequest = await storage.updatePaymentRequest(req.params.id, req.body);
      if (!paymentRequest) {
        return res.status(404).json({ error: "Payment request not found" });
      }
      res.json(paymentRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment request" });
    }
  });
  app2.patch("/api/payment-requests/:id/approve", async (req, res) => {
    try {
      const { adminNote, processedBy } = req.body;
      const paymentRequest = await storage.approvePaymentRequest(req.params.id, adminNote, processedBy);
      if (!paymentRequest) {
        return res.status(404).json({ error: "Payment request not found or already processed" });
      }
      res.json(paymentRequest);
    } catch (error) {
      console.error("Payment approval error:", error);
      res.status(500).json({ error: "Failed to approve payment request" });
    }
  });
  app2.patch("/api/payment-requests/:id/reject", async (req, res) => {
    try {
      const { adminNote, processedBy } = req.body;
      const paymentRequest = await storage.rejectPaymentRequest(req.params.id, adminNote, processedBy);
      if (!paymentRequest) {
        return res.status(404).json({ error: "Payment request not found or already processed" });
      }
      res.json(paymentRequest);
    } catch (error) {
      console.error("Payment rejection error:", error);
      res.status(500).json({ error: "Failed to reject payment request" });
    }
  });
  app2.get("/api/project-types", async (req, res) => {
    try {
      const projectTypes2 = await storage.getProjectTypes();
      res.json(projectTypes2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project types" });
    }
  });
  app2.get("/api/project-types/:id", async (req, res) => {
    try {
      const projectType = await storage.getProjectType(req.params.id);
      if (!projectType) {
        return res.status(404).json({ error: "Project type not found" });
      }
      res.json(projectType);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project type" });
    }
  });
  app2.post("/api/project-types", async (req, res) => {
    try {
      const validatedData = insertProjectTypeSchema.parse(req.body);
      const projectType = await storage.createProjectType(validatedData);
      res.status(201).json(projectType);
    } catch (error) {
      console.error("Project type creation error:", error);
      res.status(400).json({ error: "Invalid project type data" });
    }
  });
  app2.patch("/api/project-types/:id", async (req, res) => {
    try {
      const validatedData = insertProjectTypeSchema.partial().parse(req.body);
      const projectType = await storage.updateProjectType(req.params.id, validatedData);
      if (!projectType) {
        return res.status(404).json({ error: "Project type not found" });
      }
      res.json(projectType);
    } catch (error) {
      console.error("Project type update error:", error);
      res.status(400).json({ error: "Invalid project type data" });
    }
  });
  app2.delete("/api/project-types/:id", async (req, res) => {
    try {
      const success = await storage.deleteProjectType(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project type not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Project type deletion error:", error);
      res.status(500).json({ error: "Failed to delete project type" });
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects2 = await storage.getProjects();
      res.json(projects2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProjectWithDetails(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });
  app2.get("/api/clients/:clientId/projects", async (req, res) => {
    try {
      const projects2 = await storage.getClientProjects(req.params.clientId);
      res.json(projects2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client projects" });
    }
  });
  app2.post("/api/projects", async (req, res) => {
    try {
      console.log("Creating project with data:", req.body);
      const preprocessedData = { ...req.body };
      if (preprocessedData.features) {
        preprocessedData.features = Array.from(preprocessedData.features).map(String);
      }
      if (preprocessedData.completedFeatures) {
        preprocessedData.completedFeatures = Array.from(preprocessedData.completedFeatures).map(String);
      }
      const validatedData = insertProjectSchema.parse(preprocessedData);
      console.log("Validated data:", validatedData);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Project creation error:", error);
      res.status(400).json({ error: "Invalid project data", details: error?.message || "Unknown error" });
    }
  });
  app2.patch("/api/projects/:id", async (req, res) => {
    try {
      console.log("Updating project with data:", JSON.stringify(req.body, null, 2));
      const updateData = { ...req.body };
      if (updateData.features) {
        updateData.features = Array.from(updateData.features).map(String);
        console.log("Features array processed:", updateData.features);
      }
      if (updateData.endDate && typeof updateData.endDate === "string") {
        updateData.endDate = new Date(updateData.endDate);
        console.log("EndDate processed:", updateData.endDate);
      }
      console.log("Final update data:", JSON.stringify(updateData, null, 2));
      const project = await storage.updateProject(req.params.id, updateData);
      console.log("Update result:", project ? "Success" : "Not found");
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Project update error details:");
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      console.error("Error details:", error);
      res.status(500).json({
        error: "Failed to update project",
        details: error?.message || "Unknown error",
        stack: error?.stack
      });
    }
  });
  app2.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });
  app2.get("/api/employees", async (req, res) => {
    try {
      const employees2 = await storage.getEmployees();
      res.json(employees2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });
  app2.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployeeWithDetails(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });
  app2.get("/api/employees/portal/:portalKey", async (req, res) => {
    try {
      const employee = await storage.getEmployeeByPortalKey(req.params.portalKey);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee by portal key" });
    }
  });
  app2.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ error: "Invalid employee data" });
    }
  });
  app2.patch("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.updateEmployee(req.params.id, req.body);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });
  app2.delete("/api/employees/:id", async (req, res) => {
    try {
      const success = await storage.deleteEmployee(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });
  app2.get("/api/projects/:projectId/assignments", async (req, res) => {
    try {
      const assignments = await storage.getProjectAssignments(req.params.projectId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project assignments" });
    }
  });
  app2.get("/api/employees/:employeeId/assignments", async (req, res) => {
    try {
      const assignments = await storage.getEmployeeAssignments(req.params.employeeId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee assignments" });
    }
  });
  app2.get("/api/project-assignments", async (req, res) => {
    try {
      const assignments = await storage.getAllProjectAssignments();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project assignments" });
    }
  });
  app2.post("/api/project-assignments", async (req, res) => {
    try {
      const preprocessedData = { ...req.body };
      if (preprocessedData.assignedFeatures) {
        preprocessedData.assignedFeatures = Array.from(preprocessedData.assignedFeatures).map(String);
      }
      if (preprocessedData.completedFeatures) {
        preprocessedData.completedFeatures = Array.from(preprocessedData.completedFeatures).map(String);
      }
      const validatedData = insertProjectAssignmentSchema.parse(preprocessedData);
      const assignment = await storage.createProjectAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ error: "Invalid assignment data" });
    }
  });
  app2.patch("/api/project-assignments/:id", async (req, res) => {
    try {
      const assignment = await storage.updateProjectAssignment(req.params.id, req.body);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });
  app2.delete("/api/project-assignments/:id", async (req, res) => {
    try {
      const success = await storage.deleteProjectAssignment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  });
  app2.get("/api/projects/:projectId/payments", async (req, res) => {
    try {
      const payments = await storage.getProjectPayments(req.params.projectId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project payments" });
    }
  });
  app2.post("/api/project-payments", async (req, res) => {
    try {
      const validatedData = insertProjectPaymentSchema.parse(req.body);
      const payment = await storage.createProjectPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment data" });
    }
  });
  app2.patch("/api/project-payments/:id", async (req, res) => {
    try {
      const payment = await storage.updateProjectPayment(req.params.id, req.body);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment" });
    }
  });
  app2.delete("/api/project-payments/:id", async (req, res) => {
    try {
      const success = await storage.deleteProjectPayment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment" });
    }
  });
  app2.get("/api/employees/:employeeId/salary-payments", async (req, res) => {
    try {
      const payments = await storage.getSalaryPayments(req.params.employeeId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary payments" });
    }
  });
  app2.get("/api/salary-payments", async (req, res) => {
    try {
      const payments = await storage.getAllSalaryPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all salary payments" });
    }
  });
  app2.post("/api/salary-payments", async (req, res) => {
    try {
      const validatedData = insertSalaryPaymentSchema.parse(req.body);
      const payment = await storage.createSalaryPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid salary payment data" });
    }
  });
  app2.patch("/api/salary-payments/:id", async (req, res) => {
    try {
      const payment = await storage.updateSalaryPayment(req.params.id, req.body);
      if (!payment) {
        return res.status(404).json({ error: "Salary payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update salary payment" });
    }
  });
  app2.delete("/api/salary-payments/:id", async (req, res) => {
    try {
      const success = await storage.deleteSalaryPayment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Salary payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete salary payment" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/static.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json({ limit: "50mb" }));
app.use(express3.urlencoded({ extended: false, limit: "50mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "social-ads-expert-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  })
);
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const { initializeDatabase: initializeDatabase2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  await initializeDatabase2();
  console.log("Database initialized successfully");
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (process.env.NODE_ENV !== "production") {
    const { setupVite: setupVite2 } = await init_vite().then(() => vite_exports);
    await setupVite2(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

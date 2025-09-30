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
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var adminUsers, clients, spendLogs, serviceScopes, meetings, todos, whatsappTemplates, companySettings, insertClientSchema, insertSpendLogSchema, insertServiceScopeSchema, websiteProjects, insertWebsiteProjectSchema, customButtons, insertCustomButtonSchema, invoices, invoiceItems, insertInvoiceSchema, insertInvoiceItemSchema, uploads, invoicePdfs, insertUploadSchema, insertInvoicePdfSchema, insertMeetingSchema, insertTodoSchema, insertWhatsappTemplateSchema, quickMessages, paymentRequests, insertQuickMessageSchema, insertPaymentRequestSchema, insertCompanySettingsSchema, projectTypes, projects, employees, projectAssignments, projectPayments, salaryPayments, insertProjectTypeSchema, insertProjectSchema, insertEmployeeSchema, insertProjectAssignmentSchema, insertProjectPaymentSchema, insertSalaryPaymentSchema, insertAdminUserSchema, loginSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    adminUsers = pgTable("admin_users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      fullName: text("full_name").notNull(),
      email: text("email"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    clients = pgTable("clients", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      phone: text("phone").notNull(),
      fb: text("fb"),
      profilePicture: text("profile_picture"),
      status: text("status").notNull().default("Active"),
      isActive: boolean("is_active").notNull().default(true),
      walletDeposited: integer("wallet_deposited").notNull().default(0),
      walletSpent: integer("wallet_spent").notNull().default(0),
      scopes: jsonb("scopes").$type().notNull().default([]),
      portalKey: text("portal_key").notNull(),
      adminNotes: text("admin_notes"),
      category: text("category").notNull().default("general"),
      // general, regular, premium
      deleted: boolean("deleted").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    spendLogs = pgTable("spend_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientId: varchar("client_id").notNull().references(() => clients.id),
      date: text("date").notNull(),
      amount: integer("amount").notNull(),
      note: text("note"),
      balanceAfter: integer("balance_after").notNull().default(0),
      // Balance after this transaction
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    serviceScopes = pgTable("service_scopes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientId: varchar("client_id").notNull().references(() => clients.id),
      serviceName: text("service_name").notNull(),
      // e.g., "ওয়েবসাইট", "ল্যান্ডিং পেজ"
      scope: text("scope").notNull(),
      // Custom scope description
      status: text("status").notNull().default("Active"),
      // "Active", "Completed", "Paused"
      startDate: timestamp("start_date").defaultNow().notNull(),
      endDate: timestamp("end_date"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    meetings = pgTable("meetings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientId: varchar("client_id").notNull().references(() => clients.id),
      title: text("title").notNull(),
      datetime: timestamp("datetime").notNull(),
      location: text("location").notNull(),
      reminders: jsonb("reminders").$type().notNull().default([]),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    todos = pgTable("todos", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: text("title").notNull(),
      description: text("description"),
      priority: text("priority").notNull().default("Medium"),
      // "High", "Medium", "Low"
      status: text("status").notNull().default("Pending"),
      // "Completed", "Pending"
      dueDate: timestamp("due_date"),
      clientId: varchar("client_id").references(() => clients.id),
      // optional: link to client
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    whatsappTemplates = pgTable("whatsapp_templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      message: text("message").notNull(),
      isDefault: boolean("is_default").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    companySettings = pgTable("company_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      companyName: text("company_name").notNull().default("Social Ads Expert"),
      companyEmail: text("company_email"),
      companyPhone: text("company_phone"),
      companyWebsite: text("company_website"),
      companyAddress: text("company_address"),
      logoUrl: text("logo_url"),
      brandColor: text("brand_color").notNull().default("#A576FF"),
      usdExchangeRate: integer("usd_exchange_rate").notNull().default(14500),
      // USD to BDT rate in paisa (145.00 BDT = 1 USD)
      baseCurrency: text("base_currency").notNull().default("USD"),
      // Base currency for calculations
      displayCurrency: text("display_currency").notNull().default("BDT"),
      // Display currency for users
      isDefault: boolean("is_default").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
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
    websiteProjects = pgTable("website_projects", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientId: varchar("client_id").notNull().references(() => clients.id),
      projectName: varchar("project_name").notNull(),
      portalKey: varchar("portal_key").notNull().unique(),
      projectStatus: varchar("project_status").notNull().default("In Progress"),
      websiteUrl: varchar("website_url"),
      notes: text("notes"),
      completedDate: timestamp("completed_date"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertWebsiteProjectSchema = createInsertSchema(websiteProjects).omit({
      id: true,
      createdAt: true
    });
    customButtons = pgTable("custom_buttons", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: text("title").notNull(),
      // Button text/label
      description: text("description"),
      // Optional description
      url: text("url").notNull(),
      // Link URL
      icon: text("icon").default("ExternalLink"),
      // Lucide icon name
      color: text("color").default("primary"),
      // Button color theme
      isActive: boolean("is_active").notNull().default(true),
      sortOrder: integer("sort_order").notNull().default(0),
      // For ordering buttons
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertCustomButtonSchema = createInsertSchema(customButtons).omit({
      id: true,
      createdAt: true
    });
    invoices = pgTable("invoices", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      invoiceNo: text("invoice_no").notNull().unique(),
      clientId: varchar("client_id").notNull().references(() => clients.id),
      companyId: varchar("company_id").references(() => companySettings.id),
      // Optional: multiple companies
      issueDate: text("issue_date").notNull(),
      // YYYY-MM-DD format
      startDate: text("start_date"),
      // Service period start
      endDate: text("end_date"),
      // Service period end
      currency: text("currency").notNull().default("BDT"),
      subTotal: integer("sub_total").notNull().default(0),
      // In paisa/cents
      discountPct: integer("discount_pct").notNull().default(0),
      // Percentage * 100 (e.g., 1500 = 15.00%)
      discountAmt: integer("discount_amt").notNull().default(0),
      // In paisa/cents
      vatPct: integer("vat_pct").notNull().default(0),
      // Percentage * 100
      vatAmt: integer("vat_amt").notNull().default(0),
      // In paisa/cents
      grandTotal: integer("grand_total").notNull().default(0),
      // In paisa/cents
      notes: text("notes"),
      status: text("status").notNull().default("Draft"),
      // "Draft", "Sent", "Paid", "Cancelled"
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    invoiceItems = pgTable("invoice_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
      description: text("description").notNull(),
      quantity: integer("quantity").notNull().default(1),
      rate: integer("rate").notNull().default(0),
      // In paisa/cents
      amount: integer("amount").notNull().default(0),
      // quantity * rate (in paisa/cents)
      sortOrder: integer("sort_order").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
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
    uploads = pgTable("uploads", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      fileName: text("file_name").notNull(),
      mimeType: text("mime_type").notNull(),
      size: integer("size").notNull(),
      // File size in bytes
      data: text("data").notNull(),
      // Base64 encoded file data
      uploadedBy: text("uploaded_by"),
      // Optional: track who uploaded
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    invoicePdfs = pgTable("invoice_pdfs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      invoiceNo: text("invoice_no").notNull(),
      clientId: varchar("client_id").notNull().references(() => clients.id),
      fileName: text("file_name").notNull(),
      mimeType: text("mime_type").notNull().default("application/pdf"),
      size: integer("size").notNull(),
      // PDF file size in bytes
      data: text("data").notNull(),
      // Base64 encoded PDF data
      createdAt: timestamp("created_at").defaultNow().notNull()
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
    quickMessages = pgTable("quick_messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: text("title").notNull(),
      // Message title/name
      message: text("message").notNull(),
      // The actual message content
      category: text("category").default("general"),
      // Optional categorization
      isActive: boolean("is_active").notNull().default(true),
      sortOrder: integer("sort_order").notNull().default(0),
      // For ordering messages
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    paymentRequests = pgTable("payment_requests", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      clientId: varchar("client_id").notNull().references(() => clients.id),
      amount: integer("amount").notNull(),
      // Amount in paisa/cents
      paymentMethod: text("payment_method").notNull(),
      // "Bank", "bKash", "Nagad"
      accountNumber: text("account_number"),
      // Bank account, bKash/Nagad number
      transactionId: text("transaction_id"),
      // Transaction/Reference ID from payment
      status: text("status").notNull().default("Pending"),
      // "Pending", "Approved", "Rejected"
      note: text("note"),
      // Client's note/message
      adminNote: text("admin_note"),
      // Admin's note when approving/rejecting
      requestDate: timestamp("request_date").defaultNow().notNull(),
      processedDate: timestamp("processed_date"),
      // When admin approved/rejected
      processedBy: text("processed_by"),
      // Admin who processed the request
      createdAt: timestamp("created_at").defaultNow().notNull()
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
    projectTypes = pgTable("project_types", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull().unique(),
      displayName: text("display_name").notNull(),
      description: text("description"),
      isDefault: boolean("is_default").notNull().default(false),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    projects = pgTable("projects", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      type: text("type").notNull(),
      // "website" or "landing_page"
      clientId: varchar("client_id").references(() => clients.id),
      description: text("description"),
      totalAmount: integer("total_amount").notNull().default(0),
      // Total project cost
      advanceReceived: integer("advance_received").notNull().default(0),
      // Advance from client
      dueAmount: integer("due_amount").notNull().default(0),
      // Remaining amount
      status: text("status").notNull().default("pending"),
      // "pending", "in_progress", "completed", "cancelled"
      progress: integer("progress").notNull().default(0),
      // Progress percentage (0-100)
      startDate: timestamp("start_date"),
      endDate: timestamp("end_date"),
      publicUrl: text("public_url"),
      // Live project URL
      features: jsonb("features").$type().notNull().default([]),
      // List of features
      completedFeatures: jsonb("completed_features").$type().notNull().default([]),
      // Completed features
      adminNotes: text("admin_notes"),
      // Payment tracking fields (available after 20% progress)
      secondPaymentDate: timestamp("second_payment_date"),
      thirdPaymentDate: timestamp("third_payment_date"),
      paymentCompleted: boolean("payment_completed").notNull().default(false),
      // Website credentials (available after 20% progress)
      wpUsername: text("wp_username"),
      wpPassword: text("wp_password"),
      cpanelUsername: text("cpanel_username"),
      cpanelPassword: text("cpanel_password"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    employees = pgTable("employees", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      email: text("email"),
      phone: text("phone"),
      role: text("role").notNull().default("developer"),
      // "developer", "designer", "manager"
      totalIncome: integer("total_income").notNull().default(0),
      // Total earned
      totalAdvance: integer("total_advance").notNull().default(0),
      // Total advance taken
      totalDue: integer("total_due").notNull().default(0),
      // Amount due to them
      isActive: boolean("is_active").notNull().default(true),
      portalKey: text("portal_key").notNull(),
      // For employee portal access
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    projectAssignments = pgTable("project_assignments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      projectId: varchar("project_id").notNull().references(() => projects.id),
      employeeId: varchar("employee_id").notNull().references(() => employees.id),
      assignedFeatures: jsonb("assigned_features").$type().notNull().default([]),
      // Features assigned to this employee
      completedFeatures: jsonb("completed_features").$type().notNull().default([]),
      // Features completed by this employee
      hourlyRate: integer("hourly_rate").notNull().default(0),
      // Payment per hour/feature
      totalEarned: integer("total_earned").notNull().default(0),
      // Total earned from this project
      status: text("status").notNull().default("assigned"),
      // "assigned", "working", "completed"
      assignedDate: timestamp("assigned_date").defaultNow().notNull(),
      completedDate: timestamp("completed_date")
    });
    projectPayments = pgTable("project_payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      projectId: varchar("project_id").notNull().references(() => projects.id),
      amount: integer("amount").notNull(),
      paymentMethod: text("payment_method"),
      // "bKash", "Nagad", "Bank", etc.
      transactionId: text("transaction_id"),
      paymentDate: timestamp("payment_date").notNull(),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    salaryPayments = pgTable("salary_payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      employeeId: varchar("employee_id").notNull().references(() => employees.id),
      projectId: varchar("project_id").references(() => projects.id),
      // Optional: for project-specific payments
      amount: integer("amount").notNull(),
      type: text("type").notNull(),
      // "salary", "advance", "bonus", "project_payment"
      paymentMethod: text("payment_method"),
      transactionId: text("transaction_id"),
      paymentDate: timestamp("payment_date").notNull(),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow().notNull()
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

// server/db-cpanel.ts
var db_cpanel_exports = {};
__export(db_cpanel_exports, {
  db: () => db,
  initializeDatabase: () => initializeDatabase
});
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
async function initializeDatabase() {
  try {
    console.log("Checking database connection and tables...");
    try {
      const existingClients = await db.select().from(clients).limit(1);
      if (existingClients.length > 0) {
        console.log("Database already has data, skipping initialization");
        return;
      }
    } catch (error) {
      if (error.code === "42P01") {
        console.error("\u274C Database tables do not exist!");
        console.log("\u{1F4CB} Please run the database setup script first:");
        console.log("   node setup-database.js");
        console.log("   Then restart your application");
        throw new Error("Database tables not found. Run setup-database.js first.");
      }
      throw error;
    }
    console.log("Initializing database with sample data...");
    const [client1, client2] = await db.insert(clients).values([
      {
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
        name: "\u09AE\u09C0\u09B0\u09BE \u09AB\u09C1\u09A1\u09B8",
        phone: "+8801YYYYYYYYY",
        fb: "https://fb.com/mirafoods",
        status: "Active",
        walletDeposited: 12e4,
        walletSpent: 92e3,
        scopes: ["Facebook Marketing", "Business Consultancy"],
        portalKey: "mf-3k9"
      }
    ]).returning();
    await db.insert(spendLogs).values([
      {
        clientId: client1.id,
        date: "2024-01-15",
        amount: 5e3,
        note: "Ad spend"
      },
      {
        clientId: client1.id,
        date: "2024-01-16",
        amount: 5e3,
        note: "Boost post"
      },
      {
        clientId: client2.id,
        date: "2024-01-14",
        amount: 4e4,
        note: "Campaign boost"
      },
      {
        clientId: client2.id,
        date: "2024-01-15",
        amount: 52e3,
        note: "Lead generation"
      }
    ]);
    await db.insert(meetings).values([
      {
        clientId: client1.id,
        title: "Kickoff Call",
        datetime: /* @__PURE__ */ new Date("2024-12-25T11:30:00"),
        location: "Google Meet",
        reminders: ["1 day before", "3 hours before", "30 min before"]
      }
    ]);
    await db.insert(todos).values([
      {
        title: "\u0995\u09CD\u09B2\u09BE\u09AF\u09BC\u09C7\u09A8\u09CD\u099F \u09AA\u09CD\u09B0\u09C7\u099C\u09C7\u09A8\u09CD\u099F\u09C7\u09B6\u09A8 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
        description: "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F \u09B2\u099E\u09CD\u099A\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09CD\u09B0\u09C7\u099C\u09C7\u09A8\u09CD\u099F\u09C7\u09B6\u09A8 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
        priority: "High",
        status: "Pending",
        dueDate: /* @__PURE__ */ new Date("2024-01-25"),
        clientId: client1.id
      },
      {
        title: "\u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2 \u09AE\u09BF\u09A1\u09BF\u09AF\u09BC\u09BE \u0995\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09C7\u0987\u09A8 \u09B0\u09BF\u09AD\u09BF\u0989",
        description: "\u0997\u09A4 \u09B8\u09AA\u09CD\u09A4\u09BE\u09B9\u09C7\u09B0 \u0995\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09C7\u0987\u09A8\u09C7\u09B0 \u09AA\u09BE\u09B0\u09AB\u09B0\u09AE\u09CD\u09AF\u09BE\u09A8\u09CD\u09B8 \u09B0\u09BF\u09AD\u09BF\u0989 \u0995\u09B0\u09C1\u09A8",
        priority: "Medium",
        status: "Completed",
        dueDate: /* @__PURE__ */ new Date("2024-01-20"),
        clientId: client2.id
      },
      {
        title: "\u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8 \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u0995\u09B0\u09C1\u09A8",
        description: "\u09A1\u09BF\u09B8\u09C7\u09AE\u09CD\u09AC\u09B0\u09C7\u09B0 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BF\u09B8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
        priority: "High",
        status: "Pending",
        dueDate: /* @__PURE__ */ new Date("2024-01-31")
      }
    ]);
    await db.insert(whatsappTemplates).values([
      {
        name: "\u09AB\u09B2\u09CB\u0986\u09AA \u09AE\u09C7\u09B8\u09C7\u099C",
        message: "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE {client_name}, \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09CB\u099C\u09C7\u0995\u09CD\u099F\u09C7\u09B0 \u0986\u09AA\u09A1\u09C7\u099F \u09A6\u09BF\u09A4\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09B2\u09BE\u09AE\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u09AE\u09A4 \u09B8\u09AE\u09AF\u09BC\u09C7 \u0995\u09A5\u09BE \u09AC\u09B2\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF \u0995\u09BF?",
        isDefault: true
      },
      {
        name: "\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B0\u09BF\u09AE\u09BE\u0987\u09A8\u09CD\u09A1\u09BE\u09B0",
        message: "\u09AA\u09CD\u09B0\u09BF\u09AF\u09BC {client_name}, \u0986\u09AA\u09A8\u09BE\u09B0 \u0987\u09A8\u09AD\u09AF\u09BC\u09C7\u09B8 #{invoice_number} \u098F\u09B0 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09C7\u09A8\u09CD\u09A1\u09BF\u0982 \u09B0\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09AF\u09A4 \u09A6\u09CD\u09B0\u09C1\u09A4 \u09B8\u09AE\u09CD\u09AD\u09AC \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09C1\u09A8\u0964",
        isDefault: false
      },
      {
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
var connection, db;
var init_db_cpanel = __esm({
  "server/db-cpanel.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }
    connection = postgres(process.env.DATABASE_URL, {
      ssl: false,
      // Disable SSL for cPanel hosting (most don't support SSL for internal connections)
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10
    });
    db = drizzle(connection);
  }
});

// server/index-cpanel.ts
import express2 from "express";

// server/routes-cpanel.ts
import { createServer } from "http";

// server/db-storage-cpanel.ts
init_schema();
init_db_cpanel();
import { eq, desc, sum, sql as sql2, and, gte } from "drizzle-orm";
import { randomUUID } from "crypto";
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
      id: randomUUID(),
      // Generate UUID in Node.js instead of database
      name: insertClient.name,
      phone: insertClient.phone,
      fb: insertClient.fb || null,
      profilePicture: insertClient.profilePicture || null,
      adminNotes: insertClient.adminNotes || null,
      status: insertClient.status || "Active",
      walletDeposited: 0,
      walletSpent: 0,
      scopes: insertClient.scopes || ["Facebook Marketing"],
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
        db.select({ count: sql2`count(*)` }).from(spendLogs).where(eq(spendLogs.clientId, id)),
        db.select({ count: sql2`count(*)` }).from(meetings).where(eq(meetings.clientId, id)),
        db.select({ count: sql2`count(*)` }).from(serviceScopes).where(eq(serviceScopes.clientId, id))
      ]);
      const dependencies = [];
      if (spendLogsCount[0].count > 0) dependencies.push(`${spendLogsCount[0].count} spend logs`);
      if (meetingsCount[0].count > 0) dependencies.push(`${meetingsCount[0].count} meetings`);
      if (serviceScopesCount[0].count > 0) dependencies.push(`${serviceScopesCount[0].count} service scopes`);
      if (dependencies.length > 0) {
        throw new Error(`Cannot permanently delete client with existing ${dependencies.join(", ")}. Please remove them first or use soft delete (trash) instead.`);
      }
      const result = await db.delete(clients).where(eq(clients.id, id)).returning({ id: clients.id });
      return result.length > 0;
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
      id: randomUUID(),
      // Generate UUID in Node.js
      clientId: insertSpendLog.clientId,
      date: insertSpendLog.date,
      amount: insertSpendLog.amount,
      note: insertSpendLog.note || null,
      balanceAfter
    }).returning();
    await db.update(clients).set({
      walletSpent: sql2`${clients.walletSpent} + ${insertSpendLog.amount}`
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
      id: randomUUID(),
      // Generate UUID in Node.js
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
    const result = await db.delete(meetings).where(eq(meetings.id, id)).returning({ id: meetings.id });
    return result.length > 0;
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
    const todoData = {
      id: randomUUID(),
      // Generate UUID in Node.js
      ...insertTodo
    };
    const [todo] = await db.insert(todos).values(todoData).returning();
    return todo;
  }
  async updateTodo(id, updates) {
    const [updated] = await db.update(todos).set(updates).where(eq(todos.id, id)).returning();
    return updated;
  }
  async deleteTodo(id) {
    const result = await db.delete(todos).where(eq(todos.id, id)).returning({ id: todos.id });
    return result.length > 0;
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
    const templateData = {
      id: randomUUID(),
      // Generate UUID in Node.js
      ...insertTemplate
    };
    const [template] = await db.insert(whatsappTemplates).values(templateData).returning();
    return template;
  }
  async updateWhatsappTemplate(id, updates) {
    const [updated] = await db.update(whatsappTemplates).set(updates).where(eq(whatsappTemplates.id, id)).returning();
    return updated;
  }
  async deleteWhatsappTemplate(id) {
    const result = await db.delete(whatsappTemplates).where(eq(whatsappTemplates.id, id)).returning({ id: whatsappTemplates.id });
    return result.length > 0;
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
    const settingsData = {
      id: randomUUID(),
      // Generate UUID in Node.js
      ...insertCompanySettings,
      isDefault: true
    };
    const [settings] = await db.insert(companySettings).values(settingsData).returning();
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
    const serviceScopeData = {
      id: randomUUID(),
      // Generate UUID in Node.js
      ...insertServiceScope
    };
    const [serviceScope] = await db.insert(serviceScopes).values(serviceScopeData).returning();
    return serviceScope;
  }
  async updateServiceScope(id, updates) {
    const [updated] = await db.update(serviceScopes).set(updates).where(eq(serviceScopes.id, id)).returning();
    return updated;
  }
  async deleteServiceScope(id) {
    const result = await db.delete(serviceScopes).where(eq(serviceScopes.id, id)).returning({ id: serviceScopes.id });
    return result.length > 0;
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
      sql2`${spendLogs.clientId} = ANY(${clientIds})`,
      gte(sql2`DATE(${spendLogs.date})`, sevenDaysAgo.toISOString().split("T")[0])
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
    const maxOrder = await db.select({ max: sql2`max(${customButtons.sortOrder})` }).from(customButtons);
    const nextOrder = (maxOrder[0]?.max || 0) + 1;
    const buttonData = {
      id: randomUUID(),
      // Generate UUID in Node.js
      ...insertButton,
      sortOrder: nextOrder
    };
    const [button] = await db.insert(customButtons).values(buttonData).returning();
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
  // File upload operations
  async saveUpload(insertUpload) {
    const uploadData = {
      id: randomUUID(),
      // Generate UUID in Node.js
      ...insertUpload
    };
    const [upload] = await db.insert(uploads).values(uploadData).returning();
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
    const invoicePdfData = {
      id: randomUUID(),
      // Generate UUID in Node.js
      ...insertInvoicePdf
    };
    const [invoicePdf] = await db.insert(invoicePdfs).values(invoicePdfData).returning();
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
};

// server/storage-cpanel.ts
var storage = new DatabaseStorage();

// server/routes-cpanel.ts
init_schema();
async function registerRoutes(app2) {
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

// server/index-cpanel.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
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
  const { initializeDatabase: initializeDatabase2 } = await Promise.resolve().then(() => (init_db_cpanel(), db_cpanel_exports));
  
  // Try to initialize database, but don't crash if it fails due to permissions
  try {
    await initializeDatabase2();
    console.log("Database initialized successfully");
  } catch (error) {
    console.warn("⚠️  Database initialization skipped due to permission error");
    console.warn("Please fix database permissions manually - see URGENT-FIX.md");
    console.warn("App will continue to run, but database operations may fail");
  }
  
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  serveStatic(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

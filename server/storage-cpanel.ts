import { type Client, type InsertClient, type SpendLog, type InsertSpendLog, type Meeting, type InsertMeeting, type ClientWithLogs, type ClientWithDetails, type DashboardMetrics, type Todo, type InsertTodo, type WhatsappTemplate, type InsertWhatsappTemplate, type CompanySettings, type InsertCompanySettings, type ServiceScope, type InsertServiceScope, type ServiceAnalytics, type WebsiteProject, type InsertWebsiteProject, type CustomButton, type InsertCustomButton, type Upload, type InsertUpload, type InvoicePdf, type InsertInvoicePdf } from "@shared/schema";

export interface IStorage {
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientWithLogs(id: string): Promise<ClientWithLogs | undefined>;
  getClientWithDetails(id: string): Promise<ClientWithDetails | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  softDeleteClient(id: string): Promise<boolean>;
  restoreClient(id: string): Promise<boolean>;
  getDeletedClients(): Promise<Client[]>;

  // Spend log operations
  getSpendLogs(clientId: string): Promise<SpendLog[]>;
  getAllSpendLogs(): Promise<SpendLog[]>;
  createSpendLog(spendLog: InsertSpendLog): Promise<SpendLog>;
  
  // Meeting operations
  getMeetings(): Promise<Meeting[]>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: string): Promise<boolean>;


  // Todo operations
  getTodos(): Promise<Todo[]>;
  getTodo(id: string): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<boolean>;

  // WhatsApp template operations
  getWhatsappTemplates(): Promise<WhatsappTemplate[]>;
  getWhatsappTemplate(id: string): Promise<WhatsappTemplate | undefined>;
  createWhatsappTemplate(template: InsertWhatsappTemplate): Promise<WhatsappTemplate>;
  updateWhatsappTemplate(id: string, updates: Partial<WhatsappTemplate>): Promise<WhatsappTemplate | undefined>;
  deleteWhatsappTemplate(id: string): Promise<boolean>;

  // Service scope operations
  getServiceScopes(clientId?: string): Promise<ServiceScope[]>;
  getServiceScope(id: string): Promise<ServiceScope | undefined>;
  createServiceScope(scope: InsertServiceScope): Promise<ServiceScope>;
  updateServiceScope(id: string, updates: Partial<ServiceScope>): Promise<ServiceScope | undefined>;
  deleteServiceScope(id: string): Promise<boolean>;

  // Website project operations
  createWebsiteProject(project: InsertWebsiteProject): Promise<WebsiteProject>;

  // Company settings operations
  getCompanySettings(): Promise<CompanySettings | undefined>;
  createCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;
  updateCompanySettings(id: string, updates: Partial<CompanySettings>): Promise<CompanySettings | undefined>;

  // Analytics
  getDashboardMetrics(): Promise<DashboardMetrics>;

  // Custom Button operations
  getCustomButtons(): Promise<CustomButton[]>;
  createCustomButton(button: InsertCustomButton): Promise<CustomButton>;
  updateCustomButton(id: string, updates: Partial<CustomButton>): Promise<CustomButton | undefined>;
  deleteCustomButton(id: string): Promise<boolean>;
  reorderCustomButtons(buttonIds: string[]): Promise<boolean>;

  // Website Project operations  
  getWebsiteProjects(clientId: string): Promise<WebsiteProject[]>;
  
  // File upload operations
  saveUpload(insertUpload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  deleteUpload(id: string): Promise<boolean>;
  
  // Invoice PDF operations
  saveInvoicePdf(insertInvoicePdf: InsertInvoicePdf): Promise<InvoicePdf>;
  getInvoicePdfs(): Promise<InvoicePdf[]>;
  getInvoicePdf(id: string): Promise<InvoicePdf | undefined>;
  deleteInvoicePdf(id: string): Promise<boolean>;
}

import { DatabaseStorage } from "./db-storage-cpanel";

export const storage = new DatabaseStorage();
import { type Client, type InsertClient, type SpendLog, type InsertSpendLog, type Meeting, type InsertMeeting, type ClientWithLogs, type ClientWithDetails, type DashboardMetrics, type Todo, type InsertTodo, type WhatsappTemplate, type InsertWhatsappTemplate, type CompanySettings, type InsertCompanySettings, type ServiceScope, type InsertServiceScope, type ServiceAnalytics, type WebsiteProject, type InsertWebsiteProject, type CustomButton, type InsertCustomButton, type Upload, type InsertUpload, type InvoicePdf, type InsertInvoicePdf, type QuickMessage, type InsertQuickMessage, type PaymentRequest, type InsertPaymentRequest, type Project, type InsertProject, type ProjectWithDetails, type Employee, type InsertEmployee, type EmployeeWithDetails, type ProjectAssignment, type InsertProjectAssignment, type ProjectPayment, type InsertProjectPayment, type SalaryPayment, type InsertSalaryPayment } from "@shared/schema";
import { randomUUID } from "crypto";

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
  getServiceScopes(clientId: string): Promise<ServiceScope[]>;
  getServiceScope(id: string): Promise<ServiceScope | undefined>;
  createServiceScope(serviceScope: InsertServiceScope): Promise<ServiceScope>;
  updateServiceScope(id: string, updates: Partial<ServiceScope>): Promise<ServiceScope | undefined>;
  deleteServiceScope(id: string): Promise<boolean>;
  getServiceAnalytics(serviceName: string): Promise<ServiceAnalytics>;

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
  getAllWebsiteProjects(): Promise<WebsiteProject[]>;
  getWebsiteProject(id: string): Promise<WebsiteProject | undefined>;
  createWebsiteProject(project: InsertWebsiteProject): Promise<WebsiteProject>;
  updateWebsiteProject(id: string, updates: Partial<WebsiteProject>): Promise<WebsiteProject | undefined>;
  deleteWebsiteProject(id: string): Promise<boolean>;
  
  // File upload operations
  saveUpload(insertUpload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  deleteUpload(id: string): Promise<boolean>;
  
  // Invoice PDF operations
  saveInvoicePdf(insertInvoicePdf: InsertInvoicePdf): Promise<InvoicePdf>;
  getInvoicePdfs(): Promise<InvoicePdf[]>;
  getInvoicePdf(id: string): Promise<InvoicePdf | undefined>;
  deleteInvoicePdf(id: string): Promise<boolean>;
  
  // Quick Message operations
  getQuickMessages(): Promise<QuickMessage[]>;
  getQuickMessage(id: string): Promise<QuickMessage | undefined>;
  createQuickMessage(message: InsertQuickMessage): Promise<QuickMessage>;
  updateQuickMessage(id: string, updates: Partial<QuickMessage>): Promise<QuickMessage | undefined>;
  deleteQuickMessage(id: string): Promise<boolean>;

  // Payment Request operations
  getPaymentRequests(): Promise<PaymentRequest[]>;
  getPaymentRequest(id: string): Promise<PaymentRequest | undefined>;
  getClientPaymentRequests(clientId: string): Promise<PaymentRequest[]>;
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;
  updatePaymentRequest(id: string, updates: Partial<PaymentRequest>): Promise<PaymentRequest | undefined>;
  approvePaymentRequest(id: string, adminNote?: string, processedBy?: string): Promise<PaymentRequest | undefined>;
  rejectPaymentRequest(id: string, adminNote?: string, processedBy?: string): Promise<PaymentRequest | undefined>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectWithDetails(id: string): Promise<ProjectWithDetails | undefined>;
  getClientProjects(clientId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Employee operations
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeWithDetails(id: string): Promise<EmployeeWithDetails | undefined>;
  getEmployeeByPortalKey(portalKey: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Project Assignment operations
  getProjectAssignments(projectId: string): Promise<ProjectAssignment[]>;
  getEmployeeAssignments(employeeId: string): Promise<ProjectAssignment[]>;
  createProjectAssignment(assignment: InsertProjectAssignment): Promise<ProjectAssignment>;
  updateProjectAssignment(id: string, updates: Partial<ProjectAssignment>): Promise<ProjectAssignment | undefined>;
  deleteProjectAssignment(id: string): Promise<boolean>;

  // Project Payment operations
  getProjectPayments(projectId: string): Promise<ProjectPayment[]>;
  createProjectPayment(payment: InsertProjectPayment): Promise<ProjectPayment>;
  updateProjectPayment(id: string, updates: Partial<ProjectPayment>): Promise<ProjectPayment | undefined>;
  deleteProjectPayment(id: string): Promise<boolean>;

  // Salary Payment operations
  getSalaryPayments(employeeId: string): Promise<SalaryPayment[]>;
  getAllSalaryPayments(): Promise<SalaryPayment[]>;
  createSalaryPayment(payment: InsertSalaryPayment): Promise<SalaryPayment>;
  updateSalaryPayment(id: string, updates: Partial<SalaryPayment>): Promise<SalaryPayment | undefined>;
  deleteSalaryPayment(id: string): Promise<boolean>;
}

// Note: MemStorage class removed as we're using DatabaseStorage

import { DatabaseStorage } from "./db-storage";

export const storage = new DatabaseStorage();

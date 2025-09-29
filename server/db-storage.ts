import { type Client, type InsertClient, type SpendLog, type InsertSpendLog, type Meeting, type InsertMeeting, type ClientWithLogs, type ClientWithDetails, type DashboardMetrics, type Todo, type InsertTodo, type WhatsappTemplate, type InsertWhatsappTemplate, type CompanySettings, type InsertCompanySettings, type ServiceScope, type InsertServiceScope, type ServiceAnalytics, type CustomButton, type InsertCustomButton, type WebsiteProject, type InsertWebsiteProject, type Upload, type InsertUpload, type InvoicePdf, type InsertInvoicePdf, type QuickMessage, type InsertQuickMessage, type PaymentRequest, type InsertPaymentRequest, type ProjectType, type InsertProjectType, type Project, type InsertProject, type ProjectWithDetails, type Employee, type InsertEmployee, type EmployeeWithDetails, type ProjectAssignment, type InsertProjectAssignment, type ProjectPayment, type InsertProjectPayment, type SalaryPayment, type InsertSalaryPayment, clients, spendLogs, meetings, todos, whatsappTemplates, companySettings, serviceScopes, customButtons, websiteProjects, uploads, invoicePdfs, quickMessages, paymentRequests, projectTypes, projects, employees, projectAssignments, projectPayments, salaryPayments } from "@shared/schema";
import { eq, desc, sum, count, sql, and, gte } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients)
      .where(eq(clients.deleted, false))
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result[0];
  }

  async getClientWithLogs(id: string): Promise<ClientWithLogs | undefined> {
    const client = await this.getClient(id);
    if (!client) return undefined;

    const logs = await this.getSpendLogs(id);
    return { ...client, logs };
  }

  async getClientWithDetails(id: string): Promise<ClientWithDetails | undefined> {
    const client = await this.getClient(id);
    if (!client) return undefined;

    const [logs, serviceScopes, websiteProjects] = await Promise.all([
      this.getSpendLogs(id),
      this.getServiceScopes(id),
      this.getWebsiteProjects(id)
    ]);
    return { ...client, logs, serviceScopes, websiteProjects };
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
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
      scopes: (insertClient.scopes || ["Facebook Marketing"]) as string[],
      portalKey,
    };
    
    const [client] = await db.insert(clients).values(insertData).returning();
    return client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const [updated] = await db.update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    try {
      // Check if client has dependent records first
      const [spendLogsCount, meetingsCount, serviceScopesCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(spendLogs).where(eq(spendLogs.clientId, id)),
        db.select({ count: sql<number>`count(*)` }).from(meetings).where(eq(meetings.clientId, id)),
        db.select({ count: sql<number>`count(*)` }).from(serviceScopes).where(eq(serviceScopes.clientId, id))
      ]);

      const dependencies = [];
      if (spendLogsCount[0].count > 0) dependencies.push(`${spendLogsCount[0].count} spend logs`);
      if (meetingsCount[0].count > 0) dependencies.push(`${meetingsCount[0].count} meetings`);
      if (serviceScopesCount[0].count > 0) dependencies.push(`${serviceScopesCount[0].count} service scopes`);

      if (dependencies.length > 0) {
        throw new Error(`Cannot permanently delete client with existing ${dependencies.join(', ')}. Please remove them first or use soft delete (trash) instead.`);
      }

      const result = await db.delete(clients).where(eq(clients.id, id));
      return result.rowCount > 0;
    } catch (error) {
      throw error; // Re-throw to be handled by the route
    }
  }

  async getSpendLogs(clientId: string): Promise<SpendLog[]> {
    return await db.select()
      .from(spendLogs)
      .where(eq(spendLogs.clientId, clientId))
      .orderBy(spendLogs.date);
  }

  async getAllSpendLogs(): Promise<SpendLog[]> {
    return await db.select()
      .from(spendLogs)
      .orderBy(spendLogs.date);
  }

  async createSpendLog(insertSpendLog: InsertSpendLog): Promise<SpendLog> {
    // Get current client to calculate balance
    const client = await this.getClient(insertSpendLog.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    // Calculate balance after this transaction
    const newWalletSpent = client.walletSpent + insertSpendLog.amount;
    const balanceAfter = client.walletDeposited - newWalletSpent;

    // Insert the spend log with calculated balance
    const [spendLog] = await db.insert(spendLogs).values({
      clientId: insertSpendLog.clientId,
      date: insertSpendLog.date,
      amount: insertSpendLog.amount,
      note: insertSpendLog.note || null,
      balanceAfter,
    }).returning();

    // Increment the client's spent amount
    await db.update(clients)
      .set({
        walletSpent: sql`${clients.walletSpent} + ${insertSpendLog.amount}`,
      })
      .where(eq(clients.id, insertSpendLog.clientId));

    return spendLog;
  }

  async getMeetings(): Promise<Meeting[]> {
    return await db.select().from(meetings).orderBy(meetings.datetime);
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    const result = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
    return result[0];
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const meetingData = {
      clientId: insertMeeting.clientId,
      title: insertMeeting.title,
      datetime: new Date(insertMeeting.datetime),
      location: insertMeeting.location,
      reminders: (insertMeeting.reminders || ["1 day before", "3 hours before", "30 min before"]) as string[],
    };
    
    const [meeting] = await db.insert(meetings).values(meetingData).returning();
    return meeting;
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting | undefined> {
    const [updated] = await db.update(meetings)
      .set(updates)
      .where(eq(meetings.id, id))
      .returning();
    
    return updated;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    const result = await db.delete(meetings).where(eq(meetings.id, id));
    return result.rowCount > 0;
  }


  // Todo operations
  async getTodos(): Promise<Todo[]> {
    return await db.select().from(todos).orderBy(desc(todos.createdAt));
  }

  async getTodo(id: string): Promise<Todo | undefined> {
    const result = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
    return result[0];
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const [todo] = await db.insert(todos).values(insertTodo).returning();
    return todo;
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | undefined> {
    const [updated] = await db.update(todos)
      .set(updates)
      .where(eq(todos.id, id))
      .returning();
    
    return updated;
  }

  async deleteTodo(id: string): Promise<boolean> {
    const result = await db.delete(todos).where(eq(todos.id, id));
    return result.rowCount > 0;
  }

  // WhatsApp template operations
  async getWhatsappTemplates(): Promise<WhatsappTemplate[]> {
    return await db.select().from(whatsappTemplates).orderBy(desc(whatsappTemplates.createdAt));
  }

  async getWhatsappTemplate(id: string): Promise<WhatsappTemplate | undefined> {
    const result = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.id, id)).limit(1);
    return result[0];
  }

  async createWhatsappTemplate(insertTemplate: InsertWhatsappTemplate): Promise<WhatsappTemplate> {
    const [template] = await db.insert(whatsappTemplates).values(insertTemplate).returning();
    return template;
  }

  async updateWhatsappTemplate(id: string, updates: Partial<WhatsappTemplate>): Promise<WhatsappTemplate | undefined> {
    const [updated] = await db.update(whatsappTemplates)
      .set(updates)
      .where(eq(whatsappTemplates.id, id))
      .returning();
    
    return updated;
  }

  async deleteWhatsappTemplate(id: string): Promise<boolean> {
    const result = await db.delete(whatsappTemplates).where(eq(whatsappTemplates.id, id));
    return result.rowCount > 0;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const allClients = await this.getClients();
    const activeClients = allClients.filter(c => c.status === "Active").length;
    
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
      activeClients,
    };
  }

  // Company settings operations
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const result = await db.select().from(companySettings).where(eq(companySettings.isDefault, true)).limit(1);
    return result[0];
  }

  async createCompanySettings(insertCompanySettings: InsertCompanySettings): Promise<CompanySettings> {
    // Set all existing settings to non-default
    await db.update(companySettings).set({ isDefault: false });
    
    const [settings] = await db.insert(companySettings).values({
      ...insertCompanySettings,
      isDefault: true,
    }).returning();
    return settings;
  }

  async updateCompanySettings(id: string, updates: Partial<CompanySettings>): Promise<CompanySettings | undefined> {
    const [updated] = await db.update(companySettings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(companySettings.id, id))
      .returning();
    
    return updated;
  }

  // Service scope operations
  async getServiceScopes(clientId: string): Promise<ServiceScope[]> {
    return await db.select()
      .from(serviceScopes)
      .where(eq(serviceScopes.clientId, clientId))
      .orderBy(desc(serviceScopes.createdAt));
  }

  async getServiceScope(id: string): Promise<ServiceScope | undefined> {
    const result = await db.select().from(serviceScopes).where(eq(serviceScopes.id, id)).limit(1);
    return result[0];
  }

  async createServiceScope(insertServiceScope: InsertServiceScope): Promise<ServiceScope> {
    const [serviceScope] = await db.insert(serviceScopes).values(insertServiceScope).returning();
    return serviceScope;
  }

  async updateServiceScope(id: string, updates: Partial<ServiceScope>): Promise<ServiceScope | undefined> {
    const [updated] = await db.update(serviceScopes)
      .set(updates)
      .where(eq(serviceScopes.id, id))
      .returning();
    
    return updated;
  }

  async deleteServiceScope(id: string): Promise<boolean> {
    const result = await db.delete(serviceScopes).where(eq(serviceScopes.id, id));
    return result.rowCount > 0;
  }

  async getServiceAnalytics(serviceName: string): Promise<ServiceAnalytics> {
    // Get clients with this service
    const clientsWithService = await db.select()
      .from(serviceScopes)
      .where(eq(serviceScopes.serviceName, serviceName));

    const totalClients = clientsWithService.length;
    const activeScopes = clientsWithService.filter(s => s.status === "Active").length;

    // Get 7-day spending data for clients with this service
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clientIds = clientsWithService.map(s => s.clientId);
    
    const spendingData = await db.select({
      date: spendLogs.date,
      amount: sum(spendLogs.amount).as('amount')
    })
    .from(spendLogs)
    .where(and(
      sql`${spendLogs.clientId} = ANY(${clientIds})`,
      gte(sql`DATE(${spendLogs.date})`, sevenDaysAgo.toISOString().split('T')[0])
    ))
    .groupBy(spendLogs.date)
    .orderBy(spendLogs.date);

    return {
      serviceName,
      totalClients,
      activeScopes,
      last7DaysSpending: spendingData.map(d => ({
        date: d.date,
        amount: Number(d.amount) || 0
      }))
    };
  }

  async softDeleteClient(id: string): Promise<boolean> {
    const [updated] = await db.update(clients)
      .set({ deleted: true })
      .where(eq(clients.id, id))
      .returning({ id: clients.id });
    return !!updated;
  }

  async restoreClient(id: string): Promise<boolean> {
    const [updated] = await db.update(clients)
      .set({ deleted: false })
      .where(eq(clients.id, id))
      .returning({ id: clients.id });
    return !!updated;
  }

  async getDeletedClients(): Promise<Client[]> {
    return await db.select().from(clients)
      .where(eq(clients.deleted, true))
      .orderBy(desc(clients.createdAt));
  }

  // Custom Button CRUD Operations
  async getCustomButtons(): Promise<CustomButton[]> {
    return await db.select().from(customButtons)
      .where(eq(customButtons.isActive, true))
      .orderBy(customButtons.sortOrder, customButtons.createdAt);
  }

  async createCustomButton(insertButton: InsertCustomButton): Promise<CustomButton> {
    // Get next sort order
    const maxOrder = await db.select({ max: sql<number>`max(${customButtons.sortOrder})` })
      .from(customButtons);
    const nextOrder = (maxOrder[0]?.max || 0) + 1;

    const [button] = await db.insert(customButtons).values({
      ...insertButton,
      sortOrder: nextOrder
    }).returning();
    return button;
  }

  async updateCustomButton(id: string, updates: Partial<CustomButton>): Promise<CustomButton | undefined> {
    const [updated] = await db.update(customButtons)
      .set(updates)
      .where(eq(customButtons.id, id))
      .returning();
    return updated;
  }

  async deleteCustomButton(id: string): Promise<boolean> {
    const [deleted] = await db.delete(customButtons)
      .where(eq(customButtons.id, id))
      .returning({ id: customButtons.id });
    return !!deleted;
  }

  async reorderCustomButtons(buttonIds: string[]): Promise<boolean> {
    try {
      for (let i = 0; i < buttonIds.length; i++) {
        await db.update(customButtons)
          .set({ sortOrder: i })
          .where(eq(customButtons.id, buttonIds[i]));
      }
      return true;
    } catch (error) {
      console.error('Error reordering custom buttons:', error);
      return false;
    }
  }

  async getWebsiteProjects(clientId: string): Promise<WebsiteProject[]> {
    return await db.select().from(websiteProjects)
      .where(eq(websiteProjects.clientId, clientId))
      .orderBy(desc(websiteProjects.createdAt));
  }

  async getAllWebsiteProjects(): Promise<WebsiteProject[]> {
    return await db.select().from(websiteProjects)
      .orderBy(desc(websiteProjects.createdAt));
  }

  async getWebsiteProject(id: string): Promise<WebsiteProject | undefined> {
    const [project] = await db.select().from(websiteProjects)
      .where(eq(websiteProjects.id, id));
    return project;
  }

  async createWebsiteProject(insertProject: InsertWebsiteProject): Promise<WebsiteProject> {
    // Generate unique portal key if not provided
    const portalKey = insertProject.portalKey || `${insertProject.projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    const [project] = await db.insert(websiteProjects)
      .values({ ...insertProject, portalKey })
      .returning();
    return project;
  }

  async updateWebsiteProject(id: string, updates: Partial<WebsiteProject>): Promise<WebsiteProject | undefined> {
    const [project] = await db.update(websiteProjects)
      .set(updates)
      .where(eq(websiteProjects.id, id))
      .returning();
    return project;
  }

  async deleteWebsiteProject(id: string): Promise<boolean> {
    const [deleted] = await db.delete(websiteProjects)
      .where(eq(websiteProjects.id, id))
      .returning({ id: websiteProjects.id });
    return !!deleted;
  }

  // File upload operations
  async saveUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db.insert(uploads).values(insertUpload).returning();
    return upload;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const result = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
    return result[0];
  }

  async deleteUpload(id: string): Promise<boolean> {
    const [deleted] = await db.delete(uploads)
      .where(eq(uploads.id, id))
      .returning({ id: uploads.id });
    return !!deleted;
  }

  // Invoice PDF operations
  async saveInvoicePdf(insertInvoicePdf: InsertInvoicePdf): Promise<InvoicePdf> {
    const [invoicePdf] = await db.insert(invoicePdfs).values(insertInvoicePdf).returning();
    return invoicePdf;
  }

  async getInvoicePdfs(): Promise<InvoicePdf[]> {
    return await db.select().from(invoicePdfs)
      .orderBy(desc(invoicePdfs.createdAt));
  }

  async getInvoicePdf(id: string): Promise<InvoicePdf | undefined> {
    const result = await db.select().from(invoicePdfs).where(eq(invoicePdfs.id, id)).limit(1);
    return result[0];
  }

  async deleteInvoicePdf(id: string): Promise<boolean> {
    const [deleted] = await db.delete(invoicePdfs)
      .where(eq(invoicePdfs.id, id))
      .returning({ id: invoicePdfs.id });
    return !!deleted;
  }

  // Quick Message operations
  async getQuickMessages(): Promise<QuickMessage[]> {
    return await db.select().from(quickMessages)
      .where(eq(quickMessages.isActive, true))
      .orderBy(desc(quickMessages.sortOrder), desc(quickMessages.createdAt));
  }

  async getQuickMessage(id: string): Promise<QuickMessage | undefined> {
    const result = await db.select().from(quickMessages).where(eq(quickMessages.id, id)).limit(1);
    return result[0];
  }

  async createQuickMessage(insertQuickMessage: InsertQuickMessage): Promise<QuickMessage> {
    const [quickMessage] = await db.insert(quickMessages).values(insertQuickMessage).returning();
    return quickMessage;
  }

  async updateQuickMessage(id: string, updates: Partial<QuickMessage>): Promise<QuickMessage | undefined> {
    const [updated] = await db.update(quickMessages)
      .set({
        ...updates,
        updatedAt: sql`now()`,
      })
      .where(eq(quickMessages.id, id))
      .returning();
    
    return updated;
  }

  async deleteQuickMessage(id: string): Promise<boolean> {
    const [deleted] = await db.delete(quickMessages)
      .where(eq(quickMessages.id, id))
      .returning({ id: quickMessages.id });
    return !!deleted;
  }

  // Payment Request operations
  async getPaymentRequests(): Promise<PaymentRequest[]> {
    return await db.select().from(paymentRequests)
      .orderBy(desc(paymentRequests.requestDate));
  }

  async getPaymentRequest(id: string): Promise<PaymentRequest | undefined> {
    const result = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
    return result[0];
  }

  async getClientPaymentRequests(clientId: string): Promise<PaymentRequest[]> {
    return await db.select().from(paymentRequests)
      .where(eq(paymentRequests.clientId, clientId))
      .orderBy(desc(paymentRequests.requestDate));
  }

  async createPaymentRequest(insertPaymentRequest: InsertPaymentRequest): Promise<PaymentRequest> {
    const [paymentRequest] = await db.insert(paymentRequests).values(insertPaymentRequest).returning();
    return paymentRequest;
  }

  async updatePaymentRequest(id: string, updates: Partial<PaymentRequest>): Promise<PaymentRequest | undefined> {
    const [updated] = await db.update(paymentRequests)
      .set(updates)
      .where(eq(paymentRequests.id, id))
      .returning();
    
    return updated;
  }

  async approvePaymentRequest(id: string, adminNote?: string, processedBy?: string): Promise<PaymentRequest | undefined> {
    // First get the payment request
    const paymentRequest = await this.getPaymentRequest(id);
    if (!paymentRequest || paymentRequest.status !== "Pending") {
      return undefined;
    }

    // Update client balance
    const client = await this.getClient(paymentRequest.clientId);
    if (!client) {
      return undefined;
    }

    // Update client wallet balance
    await this.updateClient(paymentRequest.clientId, {
      walletDeposited: client.walletDeposited + paymentRequest.amount
    });

    // Update payment request status
    const [updated] = await db.update(paymentRequests)
      .set({
        status: "Approved",
        adminNote: adminNote || null,
        processedBy: processedBy || null,
        processedDate: sql`now()`,
      })
      .where(eq(paymentRequests.id, id))
      .returning();
    
    return updated;
  }

  async rejectPaymentRequest(id: string, adminNote?: string, processedBy?: string): Promise<PaymentRequest | undefined> {
    const [updated] = await db.update(paymentRequests)
      .set({
        status: "Rejected",
        adminNote: adminNote || null,
        processedBy: processedBy || null,
        processedDate: sql`now()`,
      })
      .where(eq(paymentRequests.id, id))
      .returning();
    
    return updated;
  }

  // Project Management Methods

  // Project Type operations
  async getProjectTypes(): Promise<ProjectType[]> {
    return await db.select().from(projectTypes)
      .where(eq(projectTypes.isActive, true))
      .orderBy(desc(projectTypes.isDefault), desc(projectTypes.createdAt));
  }

  async getProjectType(id: string): Promise<ProjectType | undefined> {
    const result = await db.select().from(projectTypes).where(eq(projectTypes.id, id)).limit(1);
    return result[0];
  }

  async createProjectType(insertProjectType: InsertProjectType): Promise<ProjectType> {
    const [projectType] = await db.insert(projectTypes)
      .values(insertProjectType)
      .returning();
    return projectType;
  }

  async updateProjectType(id: string, updates: Partial<ProjectType>): Promise<ProjectType | undefined> {
    const [updated] = await db.update(projectTypes)
      .set(updates)
      .where(eq(projectTypes.id, id))
      .returning();
    return updated;
  }

  async deleteProjectType(id: string): Promise<boolean> {
    const result = await db.delete(projectTypes).where(eq(projectTypes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects)
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async getProjectWithDetails(id: string): Promise<ProjectWithDetails | undefined> {
    const project = await this.getProject(id);
    if (!project) return undefined;

    const [client, assignments, payments] = await Promise.all([
      project.clientId ? this.getClient(project.clientId) : Promise.resolve(undefined),
      this.getProjectAssignments(id),
      this.getProjectPayments(id)
    ]);

    // Get employee details for assignments
    const assignmentsWithEmployees = await Promise.all(
      assignments.map(async (assignment) => {
        const employee = await this.getEmployee(assignment.employeeId);
        return { ...assignment, employee: employee! };
      })
    );

    return { ...project, client, assignments: assignmentsWithEmployees, payments };
  }

  async getClientProjects(clientId: string): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(desc(projects.createdAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(insertProject).returning();
    return created;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [updated] = await db.update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees)
      .where(eq(employees.isActive, true))
      .orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
    return result[0];
  }

  async getEmployeeWithDetails(id: string): Promise<EmployeeWithDetails | undefined> {
    const employee = await this.getEmployee(id);
    if (!employee) return undefined;

    const [assignments, salaryPayments] = await Promise.all([
      this.getEmployeeAssignments(id),
      this.getSalaryPayments(id)
    ]);

    // Get project details for assignments
    const assignmentsWithProjects = await Promise.all(
      assignments.map(async (assignment) => {
        const project = await this.getProject(assignment.projectId);
        return { ...assignment, project: project! };
      })
    );

    return { ...employee, assignments: assignmentsWithProjects, salaryPayments };
  }

  async getEmployeeByPortalKey(portalKey: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees)
      .where(eq(employees.portalKey, portalKey))
      .limit(1);
    return result[0];
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const portalKey = insertEmployee.portalKey || Math.random().toString(36).slice(2, 7);
    const [created] = await db.insert(employees).values({
      ...insertEmployee,
      portalKey
    }).returning();
    return created;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const [updated] = await db.update(employees)
      .set(updates)
      .where(eq(employees.id, id))
      .returning();
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await db.update(employees)
      .set({ isActive: false })
      .where(eq(employees.id, id));
    return result.rowCount > 0;
  }

  // Project Assignment operations
  async getAllProjectAssignments(): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments)
      .orderBy(desc(projectAssignments.assignedDate));
  }

  async getProjectAssignments(projectId: string): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments)
      .where(eq(projectAssignments.projectId, projectId))
      .orderBy(desc(projectAssignments.assignedDate));
  }

  async getEmployeeAssignments(employeeId: string): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments)
      .where(eq(projectAssignments.employeeId, employeeId))
      .orderBy(desc(projectAssignments.assignedDate));
  }

  async createProjectAssignment(insertAssignment: InsertProjectAssignment): Promise<ProjectAssignment> {
    const [created] = await db.insert(projectAssignments).values(insertAssignment).returning();
    return created;
  }

  async updateProjectAssignment(id: string, updates: Partial<ProjectAssignment>): Promise<ProjectAssignment | undefined> {
    const [updated] = await db.update(projectAssignments)
      .set(updates)
      .where(eq(projectAssignments.id, id))
      .returning();
    return updated;
  }

  async deleteProjectAssignment(id: string): Promise<boolean> {
    const result = await db.delete(projectAssignments).where(eq(projectAssignments.id, id));
    return result.rowCount > 0;
  }

  // Project Payment operations
  async getProjectPayments(projectId: string): Promise<ProjectPayment[]> {
    return await db.select().from(projectPayments)
      .where(eq(projectPayments.projectId, projectId))
      .orderBy(desc(projectPayments.createdAt));
  }

  async createProjectPayment(insertPayment: InsertProjectPayment): Promise<ProjectPayment> {
    const [created] = await db.insert(projectPayments).values(insertPayment).returning();
    return created;
  }

  async updateProjectPayment(id: string, updates: Partial<ProjectPayment>): Promise<ProjectPayment | undefined> {
    const [updated] = await db.update(projectPayments)
      .set(updates)
      .where(eq(projectPayments.id, id))
      .returning();
    return updated;
  }

  async deleteProjectPayment(id: string): Promise<boolean> {
    const result = await db.delete(projectPayments).where(eq(projectPayments.id, id));
    return result.rowCount > 0;
  }

  // Salary Payment operations
  async getSalaryPayments(employeeId: string): Promise<SalaryPayment[]> {
    return await db.select().from(salaryPayments)
      .where(eq(salaryPayments.employeeId, employeeId))
      .orderBy(desc(salaryPayments.createdAt));
  }

  async getAllSalaryPayments(): Promise<SalaryPayment[]> {
    return await db.select().from(salaryPayments)
      .orderBy(desc(salaryPayments.createdAt));
  }

  async createSalaryPayment(insertPayment: InsertSalaryPayment): Promise<SalaryPayment> {
    const [created] = await db.insert(salaryPayments).values(insertPayment).returning();
    
    // Update employee totals based on payment type
    const employee = await this.getEmployee(insertPayment.employeeId);
    if (employee) {
      let updates: Partial<Employee> = {};
      
      if (insertPayment.type === "advance") {
        updates.totalAdvance = employee.totalAdvance + insertPayment.amount;
      } else if (insertPayment.type === "salary" || insertPayment.type === "project_payment" || insertPayment.type === "bonus") {
        updates.totalIncome = employee.totalIncome + insertPayment.amount;
        // Reduce due amount if this is a payment
        updates.totalDue = Math.max(0, employee.totalDue - insertPayment.amount);
      }
      
      if (Object.keys(updates).length > 0) {
        await this.updateEmployee(insertPayment.employeeId, updates);
      }
    }
    
    return created;
  }

  async updateSalaryPayment(id: string, updates: Partial<SalaryPayment>): Promise<SalaryPayment | undefined> {
    const [updated] = await db.update(salaryPayments)
      .set(updates)
      .where(eq(salaryPayments.id, id))
      .returning();
    return updated;
  }

  async deleteSalaryPayment(id: string): Promise<boolean> {
    const result = await db.delete(salaryPayments).where(eq(salaryPayments.id, id));
    return result.rowCount > 0;
  }
}
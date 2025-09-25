import { type Client, type InsertClient, type SpendLog, type InsertSpendLog, type Meeting, type InsertMeeting, type ClientWithLogs, type ClientWithDetails, type DashboardMetrics, type Todo, type InsertTodo, type WhatsappTemplate, type InsertWhatsappTemplate, type CompanySettings, type InsertCompanySettings, type ServiceScope, type InsertServiceScope, type ServiceAnalytics, type CustomButton, type InsertCustomButton, type WebsiteProject, type Upload, type InsertUpload, type InvoicePdf, type InsertInvoicePdf, clients, spendLogs, meetings, todos, whatsappTemplates, companySettings, serviceScopes, customButtons, websiteProjects, uploads, invoicePdfs } from "@shared/schema";
import { eq, desc, sum, count, sql, and, gte } from "drizzle-orm";
import { db } from "./db-cpanel";
import { IStorage } from "./storage";
import { randomUUID } from "crypto";

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
      id: randomUUID(), // Generate UUID in Node.js instead of database
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
      id: randomUUID(), // Generate UUID in Node.js
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
      id: randomUUID(), // Generate UUID in Node.js
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
    const todoData = {
      id: randomUUID(), // Generate UUID in Node.js
      ...insertTodo
    };
    const [todo] = await db.insert(todos).values(todoData).returning();
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
    const templateData = {
      id: randomUUID(), // Generate UUID in Node.js
      ...insertTemplate
    };
    const [template] = await db.insert(whatsappTemplates).values(templateData).returning();
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
    
    const settingsData = {
      id: randomUUID(), // Generate UUID in Node.js
      ...insertCompanySettings,
      isDefault: true,
    };
    const [settings] = await db.insert(companySettings).values(settingsData).returning();
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
    const serviceScopeData = {
      id: randomUUID(), // Generate UUID in Node.js
      ...insertServiceScope
    };
    const [serviceScope] = await db.insert(serviceScopes).values(serviceScopeData).returning();
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

    const buttonData = {
      id: randomUUID(), // Generate UUID in Node.js
      ...insertButton,
      sortOrder: nextOrder
    };
    const [button] = await db.insert(customButtons).values(buttonData).returning();
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

  // File upload operations
  async saveUpload(insertUpload: InsertUpload): Promise<Upload> {
    const uploadData = {
      id: randomUUID(), // Generate UUID in Node.js
      ...insertUpload
    };
    const [upload] = await db.insert(uploads).values(uploadData).returning();
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
    const invoicePdfData = {
      id: randomUUID(), // Generate UUID in Node.js
      ...insertInvoicePdf
    };
    const [invoicePdf] = await db.insert(invoicePdfs).values(invoicePdfData).returning();
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
}
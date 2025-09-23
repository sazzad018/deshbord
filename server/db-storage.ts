import { type Client, type InsertClient, type SpendLog, type InsertSpendLog, type Meeting, type InsertMeeting, type ClientWithLogs, type ClientWithDetails, type DashboardMetrics, type Invoice, type InsertInvoice, type InvoiceLineItem, type InsertInvoiceLineItem, type InvoiceWithLineItems, type Todo, type InsertTodo, type WhatsappTemplate, type InsertWhatsappTemplate, type CompanySettings, type InsertCompanySettings, type ServiceScope, type InsertServiceScope, type ServiceAnalytics, clients, spendLogs, meetings, invoices, invoiceLineItems, todos, whatsappTemplates, companySettings, serviceScopes } from "@shared/schema";
import { eq, desc, sum, count, sql, and, gte } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
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

    const [logs, serviceScopes] = await Promise.all([
      this.getSpendLogs(id),
      this.getServiceScopes(id)
    ]);
    return { ...client, logs, serviceScopes };
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const portalKey = Math.random().toString(36).slice(2, 7);
    
    const insertData = {
      name: insertClient.name,
      phone: insertClient.phone,
      fb: insertClient.fb || null,
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
      const [spendLogsCount, meetingsCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(spendLogs).where(eq(spendLogs.clientId, id)),
        db.select({ count: sql<number>`count(*)` }).from(meetings).where(eq(meetings.clientId, id))
      ]);

      if (spendLogsCount[0].count > 0 || meetingsCount[0].count > 0) {
        throw new Error("Cannot delete client with existing spend logs or meetings. Please remove them first.");
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

  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<InvoiceWithLineItems | undefined> {
    const invoice = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (invoice.length === 0) return undefined;

    const [client] = await db.select().from(clients).where(eq(clients.id, invoice[0].clientId)).limit(1);
    const lineItems = await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id));

    return {
      ...invoice[0],
      client,
      lineItems,
    };
  }

  async createInvoice(insertInvoice: InsertInvoice, lineItems: InsertInvoiceLineItem[]): Promise<Invoice> {
    // Generate invoice number
    const invoiceCount = await db.select({ count: sql<number>`count(*)` }).from(invoices);
    const invoiceNumber = `INV-${String(invoiceCount[0].count + 1).padStart(4, '0')}`;

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + ((item.quantity || 1) * item.rate), 0);
    const discountAmount = Math.round((subtotal * (insertInvoice.discount || 0)) / 100);
    const vatAmount = Math.round(((subtotal - discountAmount) * (insertInvoice.vat || 0)) / 100);
    const totalAmount = subtotal - discountAmount + vatAmount;

    // Create invoice
    const [invoice] = await db.insert(invoices).values({
      ...insertInvoice,
      invoiceNumber,
      subtotal,
      totalAmount,
    }).returning();

    // Create line items
    await db.insert(invoiceLineItems).values(
      lineItems.map(item => ({
        ...item,
        invoiceId: invoice.id,
        amount: (item.quantity || 1) * item.rate, // Calculate amount
      }))
    );

    return invoice;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();
    
    return updated;
  }

  async updateInvoiceStatus(id: string, status: "Paid" | "Due"): Promise<Invoice | undefined> {
    return this.updateInvoice(id, { status });
  }

  async deleteInvoice(id: string): Promise<boolean> {
    // Delete line items first
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id));
    
    // Delete invoice
    const result = await db.delete(invoices).where(eq(invoices.id, id));
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
}
import { type Client, type InsertClient, type SpendLog, type InsertSpendLog, type Meeting, type InsertMeeting, type ClientWithLogs, type DashboardMetrics, clients, spendLogs, meetings } from "@shared/schema";
import { eq, desc, sum, count } from "drizzle-orm";
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
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount > 0;
  }

  async getSpendLogs(clientId: string): Promise<SpendLog[]> {
    return await db.select()
      .from(spendLogs)
      .where(eq(spendLogs.clientId, clientId))
      .orderBy(spendLogs.date);
  }

  async createSpendLog(insertSpendLog: InsertSpendLog): Promise<SpendLog> {
    const [spendLog] = await db.insert(spendLogs).values({
      clientId: insertSpendLog.clientId,
      date: insertSpendLog.date,
      amount: insertSpendLog.amount,
      note: insertSpendLog.note || null,
    }).returning();

    // Update client's spent amount - increment existing amount
    const client = await this.getClient(insertSpendLog.clientId);
    if (client) {
      await db.update(clients)
        .set({
          walletSpent: client.walletSpent + insertSpendLog.amount,
        })
        .where(eq(clients.id, insertSpendLog.clientId));
    }

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
}
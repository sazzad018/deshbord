import { type Client, type InsertClient, type SpendLog, type InsertSpendLog, type Meeting, type InsertMeeting, type ClientWithLogs, type DashboardMetrics } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientWithLogs(id: string): Promise<ClientWithLogs | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Spend log operations
  getSpendLogs(clientId: string): Promise<SpendLog[]>;
  createSpendLog(spendLog: InsertSpendLog): Promise<SpendLog>;
  
  // Meeting operations
  getMeetings(): Promise<Meeting[]>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: string): Promise<boolean>;

  // Analytics
  getDashboardMetrics(): Promise<DashboardMetrics>;
}

export class MemStorage implements IStorage {
  private clients: Map<string, Client>;
  private spendLogs: Map<string, SpendLog>;
  private meetings: Map<string, Meeting>;

  constructor() {
    this.clients = new Map();
    this.spendLogs = new Map();
    this.meetings = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const client1: Client = {
      id: "CLT_1001",
      name: "রিয়াদ ট্রেডার্স",
      phone: "+8801XXXXXXXXX",
      fb: "https://fb.com/riyadtraders",
      status: "Active",
      walletDeposited: 50000,
      walletSpent: 10000,
      scopes: ["Facebook Marketing", "Landing Page Design"],
      portalKey: "rt-8x1",
      createdAt: new Date(),
    };

    const client2: Client = {
      id: "CLT_1002",
      name: "মীরা ফুডস",
      phone: "+8801YYYYYYYYY",
      fb: "https://fb.com/mirafoods",
      status: "Active",
      walletDeposited: 120000,
      walletSpent: 92000,
      scopes: ["Facebook Marketing", "Business Consultancy"],
      portalKey: "mf-3k9",
      createdAt: new Date(),
    };

    this.clients.set(client1.id, client1);
    this.clients.set(client2.id, client2);

    const log1: SpendLog = {
      id: "LOG_1",
      clientId: "CLT_1001",
      date: "2024-01-15",
      amount: 5000,
      note: "Ad spend",
      createdAt: new Date(),
    };

    const log2: SpendLog = {
      id: "LOG_2",
      clientId: "CLT_1001",
      date: "2024-01-16",
      amount: 5000,
      note: "Boost post",
      createdAt: new Date(),
    };

    const log3: SpendLog = {
      id: "LOG_3",
      clientId: "CLT_1002",
      date: "2024-01-14",
      amount: 40000,
      note: "Campaign boost",
      createdAt: new Date(),
    };

    const log4: SpendLog = {
      id: "LOG_4",
      clientId: "CLT_1002",
      date: "2024-01-15",
      amount: 52000,
      note: "Lead generation",
      createdAt: new Date(),
    };

    this.spendLogs.set(log1.id, log1);
    this.spendLogs.set(log2.id, log2);
    this.spendLogs.set(log3.id, log3);
    this.spendLogs.set(log4.id, log4);

    const meeting1: Meeting = {
      id: "MTG_1",
      clientId: "CLT_1001",
      title: "Kickoff Call",
      datetime: new Date("2024-01-20T11:30:00"),
      location: "Google Meet",
      reminders: ["1 day before", "3 hours before", "30 min before"],
      createdAt: new Date(),
    };

    this.meetings.set(meeting1.id, meeting1);
  }

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientWithLogs(id: string): Promise<ClientWithLogs | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const logs = Array.from(this.spendLogs.values())
      .filter(log => log.clientId === id)
      .sort((a, b) => a.date.localeCompare(b.date));

    return { ...client, logs };
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = `CLT_${Math.floor(Math.random() * 9000) + 1000}`;
    const portalKey = Math.random().toString(36).slice(2, 7);
    
    const client: Client = {
      ...insertClient,
      id,
      portalKey,
      fb: insertClient.fb || null,
      walletDeposited: 0,
      walletSpent: 0,
      scopes: (insertClient.scopes || ["Facebook Marketing"]) as string[],
      createdAt: new Date(),
    };

    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updatedClient = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  async getSpendLogs(clientId: string): Promise<SpendLog[]> {
    return Array.from(this.spendLogs.values())
      .filter(log => log.clientId === clientId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async createSpendLog(insertSpendLog: InsertSpendLog): Promise<SpendLog> {
    const id = randomUUID();
    const spendLog: SpendLog = {
      ...insertSpendLog,
      id,
      note: insertSpendLog.note || null,
      createdAt: new Date(),
    };

    this.spendLogs.set(id, spendLog);

    // Update client's spent amount
    const client = this.clients.get(insertSpendLog.clientId);
    if (client) {
      client.walletSpent += insertSpendLog.amount;
      this.clients.set(client.id, client);
    }

    return spendLog;
  }

  async getMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = `MTG_${Math.floor(Math.random() * 90000) + 10000}`;
    const meeting: Meeting = {
      ...insertMeeting,
      id,
      reminders: (insertMeeting.reminders || []) as string[],
      createdAt: new Date(),
    };

    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;

    const updatedMeeting = { ...meeting, ...updates };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    return this.meetings.delete(id);
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const clients = await this.getClients();
    const activeClients = clients.filter(c => c.status === "Active").length;
    
    const totals = clients.reduce(
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

import { DatabaseStorage } from "./db-storage";

export const storage = new DatabaseStorage();

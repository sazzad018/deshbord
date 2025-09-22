import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { clients, spendLogs, meetings } from "@shared/schema";
import { eq, desc, gt } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

// Initialize database with sample data if empty
export async function initializeDatabase() {
  try {
    // Check if we already have data
    const existingClients = await db.select().from(clients).limit(1);
    if (existingClients.length > 0) {
      console.log("Database already has data, skipping initialization");
      return;
    }

    console.log("Initializing database with sample data...");

    // Insert sample clients
    const [client1, client2] = await db.insert(clients).values([
      {
        name: "রিয়াদ ট্রেডার্স",
        phone: "+8801XXXXXXXXX",
        fb: "https://fb.com/riyadtraders",
        status: "Active",
        walletDeposited: 50000,
        walletSpent: 10000,
        scopes: ["Facebook Marketing", "Landing Page Design"],
        portalKey: "rt-8x1",
      },
      {
        name: "মীরা ফুডস",
        phone: "+8801YYYYYYYYY",
        fb: "https://fb.com/mirafoods",
        status: "Active",
        walletDeposited: 120000,
        walletSpent: 92000,
        scopes: ["Facebook Marketing", "Business Consultancy"],
        portalKey: "mf-3k9",
      }
    ]).returning();

    // Insert sample spend logs
    await db.insert(spendLogs).values([
      {
        clientId: client1.id,
        date: "2024-01-15",
        amount: 5000,
        note: "Ad spend",
      },
      {
        clientId: client1.id,
        date: "2024-01-16",
        amount: 5000,
        note: "Boost post",
      },
      {
        clientId: client2.id,
        date: "2024-01-14",
        amount: 40000,
        note: "Campaign boost",
      },
      {
        clientId: client2.id,
        date: "2024-01-15",
        amount: 52000,
        note: "Lead generation",
      },
    ]);

    // Insert sample meeting
    await db.insert(meetings).values([
      {
        clientId: client1.id,
        title: "Kickoff Call",
        datetime: new Date("2024-12-25T11:30:00"),
        location: "Google Meet",
        reminders: ["1 day before", "3 hours before", "30 min before"],
      }
    ]);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
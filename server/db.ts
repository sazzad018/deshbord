import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { clients, spendLogs, meetings, todos, whatsappTemplates } from "@shared/schema";
import { eq, desc, gt } from "drizzle-orm";
import { randomUUID } from "crypto";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

// Create MySQL connection pool
const pool = mysql.createPool(process.env.DATABASE_URL);
export const db = drizzle(pool);

// UUID helper function for MySQL
export function generateId(): string {
  return randomUUID();
}

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

    const client1Id = generateId();
    const client2Id = generateId();

    // Insert sample clients
    await db.insert(clients).values([
      {
        id: client1Id,
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
        id: client2Id,
        name: "মীরা ফুডস",
        phone: "+8801YYYYYYYYY",
        fb: "https://fb.com/mirafoods",
        status: "Active",
        walletDeposited: 120000,
        walletSpent: 92000,
        scopes: ["Facebook Marketing", "Business Consultancy"],
        portalKey: "mf-3k9",
      }
    ]);

    // Insert sample spend logs
    await db.insert(spendLogs).values([
      {
        id: generateId(),
        clientId: client1Id,
        date: "2024-01-15",
        amount: 5000,
        note: "Ad spend",
      },
      {
        id: generateId(),
        clientId: client1Id,
        date: "2024-01-16",
        amount: 5000,
        note: "Boost post",
      },
      {
        id: generateId(),
        clientId: client2Id,
        date: "2024-01-14",
        amount: 40000,
        note: "Campaign boost",
      },
      {
        id: generateId(),
        clientId: client2Id,
        date: "2024-01-15",
        amount: 52000,
        note: "Lead generation",
      },
    ]);

    // Insert sample meeting
    await db.insert(meetings).values([
      {
        id: generateId(),
        clientId: client1Id,
        title: "Kickoff Call",
        datetime: new Date("2024-12-25T11:30:00"),
        location: "Google Meet",
        reminders: ["1 day before", "3 hours before", "30 min before"],
      }
    ]);

    // Insert sample todos
    await db.insert(todos).values([
      {
        id: generateId(),
        title: "ক্লায়েন্ট প্রেজেন্টেশন তৈরি করুন",
        description: "নতুন প্রোডাক্ট লঞ্চের জন্য প্রেজেন্টেশন তৈরি করুন",
        priority: "High",
        status: "Pending",
        dueDate: new Date("2024-01-25"),
        clientId: client1Id,
      },
      {
        id: generateId(),
        title: "সোশ্যাল মিডিয়া ক্যাম্পেইন রিভিউ",
        description: "গত সপ্তাহের ক্যাম্পেইনের পারফরম্যান্স রিভিউ করুন",
        priority: "Medium",
        status: "Completed",
        dueDate: new Date("2024-01-20"),
        clientId: client2Id,
      },
      {
        id: generateId(),
        title: "ইনভয়েস জেনারেট করুন",
        description: "ডিসেম্বরের সার্ভিসের জন্য ইনভয়েস তৈরি করুন",
        priority: "High",
        status: "Pending",
        dueDate: new Date("2024-01-31"),
      }
    ]);

    // Insert sample WhatsApp templates
    await db.insert(whatsappTemplates).values([
      {
        id: generateId(),
        name: "ফলোআপ মেসেজ",
        message: "আসসালামু আলাইকুম {client_name}, আপনার প্রোজেক্টের আপডেট দিতে যোগাযোগ করলাম। আপনার সুবিধামত সময়ে কথা বলতে পারি কি?",
        isDefault: true,
      },
      {
        id: generateId(),
        name: "পেমেন্ট রিমাইন্ডার",
        message: "প্রিয় {client_name}, আপনার ইনভয়েস #{invoice_number} এর পেমেন্ট পেন্ডিং রয়েছে। অনুগ্রহ করে যত দ্রুত সম্ভব পেমেন্ট করুন।",
        isDefault: false,
      },
      {
        id: generateId(),
        name: "প্রোজেক্ট কমপ্লিট",
        message: "আপনার প্রোজেক্ট সফলভাবে সম্পন্ন হয়েছে। ফিডব্যাক দিতে এই লিংকে ক্লিক করুন।",
        isDefault: false,
      }
    ]);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

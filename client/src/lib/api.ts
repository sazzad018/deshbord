import { apiRequest } from "./queryClient";
import type { InsertClient, InsertSpendLog, InsertMeeting } from "@shared/schema";

export async function createClient(client: InsertClient) {
  const response = await apiRequest("POST", "/api/clients", client);
  return response.json();
}

export async function addFunds(clientId: string, amount: number) {
  const response = await apiRequest("POST", `/api/clients/${clientId}/add-funds`, { amount });
  return response.json();
}

export async function createSpendLog(spendLog: InsertSpendLog) {
  const response = await apiRequest("POST", "/api/spend-logs", spendLog);
  return response.json();
}

export async function createMeeting(meeting: InsertMeeting) {
  const response = await apiRequest("POST", "/api/meetings", meeting);
  return response.json();
}

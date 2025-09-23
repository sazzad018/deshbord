import type { Client, AIQueryResult } from "@shared/schema";

export function formatCurrency(amount: number): string {
  // Format in English numbers with BDT symbol
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('BDT', '৳');
}

export async function safeWriteToClipboard(
  text: string
): Promise<{ ok: boolean; method: "clipboard" | "execCommand" | "selectOnly"; error?: any }> {
  try {
    if (typeof window !== "undefined" && window.isSecureContext && navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: "clipboard" };
    }
  } catch {}
  
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand && document.execCommand("copy");
    document.body.removeChild(ta);
    if (ok) return { ok: true, method: "execCommand" };
  } catch {}
  
  return { ok: false, method: "selectOnly" };
}

export function contains(hay: string, needles: string[]): boolean {
  const h = hay.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

export function runAgentQuery(query: string, clients: Client[]): AIQueryResult {
  const text = (query || "").trim();
  const wantPhones = contains(text, ["হোয়াটসঅ্যাপ", "হোয়াটসঅ্যাপ", "whatsapp", "ফোন", "নাম্বার", "নম্বর", "phone"]);
  const wantFbLink = contains(text, ["ফেসবুক", "facebook", "fb", "পেইজ", "page"]);
  const wantBalance = contains(text, ["ব্যালেন্স", "balance", "current balance", "কত টাকা বাকি"]);
  const wantScopes = contains(text, ["স্কোপ", "scope", "services", "সার্ভিস"]);
  const wantDeposited = contains(text, ["ডিপোজিট", "জমা", "deposited"]);
  const wantSpent = contains(text, ["খরচ", "spent"]);

  const scopeMap: Record<string, string> = {
    facebook: "Facebook Marketing",
    "facebook marketing": "Facebook Marketing",
    ফেসবুক: "Facebook Marketing",
    consultancy: "Business Consultancy",
    consult: "Business Consultancy",
    ল্যান্ডিং: "Landing Page Design",
    website: "Website Development",
    কোর্স: "Course/Training",
  };
  
  const scopeKeys = Object.keys(scopeMap);
  const askedScope = scopeKeys.find((k) => contains(text, [k]));

  let rows = clients;
  
  // Check if this is a specific client name search
  const isSpecificSearch = !wantPhones && !wantFbLink && !wantBalance && !wantScopes && !wantDeposited && !wantSpent && !askedScope;
  
  if (askedScope) {
    const needle = scopeMap[askedScope];
    rows = rows.filter((c) => (c.scopes || []).some((s) => s.toLowerCase() === needle.toLowerCase()));
  } else if (isSpecificSearch) {
    // Filter by client name if it's not asking for specific data fields
    rows = rows.filter((c) => c.name.toLowerCase().includes(text.toLowerCase()));
  }

  const columns: { key: string; label: string }[] = [{ key: "name", label: "নাম" }];
  if (wantPhones) columns.push({ key: "phone", label: "হোয়াটসঅ্যাপ/ফোন" });
  if (wantFbLink) columns.push({ key: "fb", label: "Facebook Page" });
  if (wantDeposited) columns.push({ key: "deposited", label: "Deposited" });
  if (wantSpent) columns.push({ key: "spent", label: "Spent" });
  if (wantBalance) columns.push({ key: "balance", label: "Balance" });
  if (wantScopes || (!wantPhones && !wantFbLink && !wantDeposited && !wantSpent && !wantBalance))
    columns.push({ key: "scopes", label: "স্কোপ" });

  const results = rows.map((c) => ({
    name: c.name,
    phone: c.phone,
    fb: c.fb,
    deposited: formatCurrency(c.walletDeposited),
    spent: formatCurrency(c.walletSpent),
    balance: formatCurrency(c.walletDeposited - c.walletSpent),
    scopes: (c.scopes || []).join(", "),
  }));

  const summary = results.length === 0 
    ? "কোন ফলাফল পাওয়া যায়নি" 
    : `${results.length} টি ফলাফল পাওয়া গেছে` + (askedScope ? ` • Scope = ${scopeMap[askedScope]}` : "");
  
  return { columns, results, summary };
}

export function exportClientData(clientId: string) {
  // This would typically fetch client data and export it
  // For now, we'll create a simple export function
  const data = {
    clientId,
    exportDate: new Date().toISOString(),
    note: "Client data export functionality"
  };

  const csv = `Client ID,Export Date,Note\n"${data.clientId}","${data.exportDate}","${data.note}"`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `client_${clientId}_export.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportAllData() {
  const data = {
    exportDate: new Date().toISOString(),
    note: "Dashboard data export"
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `dashboard_export_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

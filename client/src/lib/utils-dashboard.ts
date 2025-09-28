import type { Client, AIQueryResult } from "@shared/schema";
import * as XLSX from 'xlsx';

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

export async function exportAllData() {
  try {
    // Fetch all clients data
    const response = await fetch('/api/clients');
    if (!response.ok) {
      throw new Error('Failed to fetch clients data');
    }
    
    const clients: Client[] = await response.json();
    
    // Prepare data for Excel export
    const excelData = clients.map((client, index) => ({
      'ক্রমিক নং': index + 1,
      'নাম': client.name,
      'মোবাইল নম্বর': client.phone,
      'Facebook Page Link': client.fb || 'N/A',
      'স্ট্যাটাস': client.status === 'Active' ? 'সক্রিয়' : 'নিষ্ক্রিয়',
      'মোট জমা (৳)': client.walletDeposited.toLocaleString(),
      'মোট খরচ (৳)': client.walletSpent.toLocaleString(),
      'বর্তমান ব্যালেন্স (৳)': (client.walletDeposited - client.walletSpent).toLocaleString(),
      'সার্ভিস স্কোপ': (client.scopes || []).join(', '),
      'Portal Key': client.portalKey,
      'তৈরির তারিখ': new Date(client.createdAt).toLocaleDateString('bn-BD')
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 8 },   // ক্রমিক নং
      { wch: 20 },  // নাম
      { wch: 15 },  // মোবাইল নম্বর
      { wch: 40 },  // Facebook Page Link
      { wch: 10 },  // স্ট্যাটাস
      { wch: 15 },  // মোট জমা
      { wch: 15 },  // মোট খরচ
      { wch: 18 },  // বর্তমান ব্যালেন্স
      { wch: 30 },  // সার্ভিস স্কোপ
      { wch: 12 },  // Portal Key
      { wch: 15 }   // তৈরির তারিখ
    ];
    ws['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Client Data');

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clients_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    console.log(`Successfully exported ${clients.length} clients to Excel`);
  } catch (error) {
    console.error('Export failed:', error);
    alert('এক্সপোর্ট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
  }
}

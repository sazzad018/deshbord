import React, { useMemo, useRef, useState } from "react";
import {
  Bell,
  Calendar,
  Wallet,
  Search,
  Users,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Download,
  Plus,
  AlarmClock,
  ClipboardList,
  DollarSign,
  Link as LinkIcon,
  Copy,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/********************
 * Minimal Module Split (Single file, small components)
 * - Keeps canvas light but preserves all features
 ********************/

// ------------------- In-memory Store (MVP, no external CRM) -------------------
const initialClients = [
  {
    id: "CLT_1001",
    name: "Riyad Traders",
    phone: "+8801XXXXXXXXX",
    fb: "https://fb.com/riyadtraders",
    status: "Active",
    wallet: { deposited: 50, spent: 10 },
    scopes: ["Facebook Marketing", "Landing Page"],
    portalKey: "rt-8x1",
    logs: [{ date: "2025-09-19", spend: 10, note: "Ad spend" }],
  },
  {
    id: "CLT_1002",
    name: "Mira Foods",
    phone: "+8801YYYYYYYYY",
    fb: "https://fb.com/mirafoods",
    status: "Active",
    wallet: { deposited: 120, spent: 92 },
    scopes: ["Facebook Marketing", "Consultancy"],
    portalKey: "mf-3k9",
    logs: [
      { date: "2025-09-18", spend: 40, note: "Boost" },
      { date: "2025-09-19", spend: 52, note: "Leads" },
    ],
  },
];

const initialMeetings = [
  {
    id: "MTG_1",
    clientId: "CLT_1001",
    title: "Kickoff Call",
    datetime: "2025-09-20T11:30",
    location: "Google Meet",
    reminders: ["1 day before", "3 hours before", "30 min before"],
  },
];

const spend7d = [
  { day: "সোম", spend: 18 },
  { day: "মঙ্গল", spend: 21 },
  { day: "বুধ", spend: 16.5 },
  { day: "বৃহস্পতি", spend: 25 },
  { day: "শুক্র", spend: 32 },
  { day: "শনি", spend: 14 },
  { day: "রবি", spend: 29 },
];

// ------------------- Utils -------------------
async function safeWriteToClipboard(
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

function contains(hay: string, needles: string[]) {
  const h = hay.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

function runAgentQuery(q: string, clients: typeof initialClients) {
  const text = (q || "").trim();
  const wantPhones = contains(text, ["হোয়াটসঅ্যাপ", "হোয়াটসঅ্যাপ", "whatsapp", "ফোন", "নাম্বার", "নম্বর", "phone"]);
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
  if (askedScope) {
    const needle = scopeMap[askedScope];
    rows = rows.filter((c) => (c.scopes || []).some((s) => s.toLowerCase() === needle.toLowerCase()));
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
    deposited: c.wallet.deposited.toFixed(2),
    spent: c.wallet.spent.toFixed(2),
    balance: (c.wallet.deposited - c.wallet.spent).toFixed(2),
    scopes: (c.scopes || []).join(", "),
  }));

  const summary = `${results.length} result(s)` + (askedScope ? ` • Scope = ${scopeMap[askedScope]}` : "");
  return { columns, results, summary };
}

/******************** UI Helpers ********************/
function Section({ title, subtitle, tag, children }: { title: string; subtitle?: string; tag?: string; children: React.ReactNode }) {
  return (
    <div className="col-span-12">
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">{tag}</div>
          <h2 className="text-lg font-semibold mt-0.5">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="h-[1px] bg-slate-200 mb-4" />
      {children}
    </div>
  );
}

function TopBar({ query, setQuery }: { query: string; setQuery: (s: string) => void }) {
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Badge className="rounded-2xl" variant="secondary">MVP</Badge>
          <h1 className="text-xl font-semibold">Agent CRM + Ops (In-App)</h1>
          <Badge className="rounded-2xl">Asia/Dhaka</Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-60" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="খুঁজুন: ক্লায়েন্ট/প্রোফাইল/স্কোপ" className="pl-8" />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />রিফ্রেশ
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />এক্সপোর্ট
          </Button>
        </div>
      </div>
    </div>
  );
}

/******************** Main Component ********************/
export default function AgentOpsDashboard() {
  // Global state
  const [clients, setClients] = useState(initialClients);
  const [meetings, setMeetings] = useState(initialMeetings);
  const [query, setQuery] = useState("");
  const [autoDigest, setAutoDigest] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [copyMsg, setCopyMsg] = useState<string>("");

  // Portal & Sheets helpers
  const [sheetId, setSheetId] = useState("");
  const portalInputRef = useRef<HTMLInputElement | null>(null);

  // Spend input (dated + note)
  const [spendDetail, setSpendDetail] = useState({ date: new Date().toISOString().slice(0, 10), amount: "", note: "" });

  // Agent query state
  const [agentQ, setAgentQ] = useState("");
  const [agentRes, setAgentRes] = useState<{ columns: { key: string; label: string }[]; results: any[]; summary: string } | null>(null);

  // Derived metrics
  const metrics = useMemo(() => {
    const totals = clients.reduce(
      (acc, c) => {
        acc.deposited += c.wallet.deposited;
        acc.spent += c.wallet.spent;
        return acc;
      },
      { deposited: 0, spent: 0 }
    );
    const balance = totals.deposited - totals.spent;
    return { ...totals, balance, active: clients.filter((c) => c.status === "Active").length };
  }, [clients]);

  const selectedClient = useMemo(() => clients.find((c) => c.id === selectedClientId), [clients, selectedClientId]);
  const portalUrl = useMemo(() => (selectedClient ? `https://portal.example.com/c/${selectedClient.id}?key=${selectedClient.portalKey}` : "#"), [selectedClient]);

  // ------------ Actions (MVP) ------------
  function createClient({ name, phone, fb }: { name: string; phone: string; fb: string }) {
    const id = `CLT_${Math.floor(Math.random() * 9000) + 1000}`;
    const portalKey = Math.random().toString(36).slice(2, 7);
    const newC = { id, name, phone, fb, status: "Active", wallet: { deposited: 0, spent: 0 }, scopes: ["Facebook Marketing"] as string[], portalKey, logs: [] as { date: string; spend: number; note?: string }[] };
    setClients((prev) => [newC, ...prev]);
    setSelectedClientId(id);
  }
  function addFunds(clientId: string, amount: number) {
    if (!amount || amount <= 0) return;
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, wallet: { ...c.wallet, deposited: +(c.wallet.deposited + amount).toFixed(2) } } : c)));
  }
  function recordSpend(clientId: string, amount: number, date?: string, note?: string) {
    if (!amount || amount <= 0) return;
    setClients((prev) => prev.map((c) => {
      if (c.id !== clientId) return c;
      const d = date || new Date().toISOString().slice(0, 10);
      const logs = [...(c.logs || []), { date: d, spend: +(+amount).toFixed(2), note: note || "Ad spend" }].sort((a, b) => a.date.localeCompare(b.date));
      return { ...c, wallet: { ...c.wallet, spent: +(c.wallet.spent + amount).toFixed(2) }, logs };
    }));
  }
  function addScope(clientId: string, scope: string) {
    if (!scope) return;
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, scopes: Array.from(new Set([...(c.scopes || []), scope])) } : c)));
  }
  function removeScope(clientId: string, scope: string) {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, scopes: (c.scopes || []).filter((s) => s !== scope) } : c)));
  }
  function scheduleMeeting({ clientId, title, datetime, location, reminders }: { clientId: string; title: string; datetime: string; location: string; reminders: string[] }) {
    const id = `MTG_${Math.floor(Math.random() * 90000) + 10000}`;
    setMeetings((prev) => [{ id, clientId, title, datetime, location, reminders }, ...prev]);
  }
  function exportCsv() {
    if (!selectedClient) return;
    const rows = [["Date", "Spend(USD)", "Note", "Balance After"]];
    const sorted = [...(selectedClient.logs || [])].sort((a, b) => a.date.localeCompare(b.date));
    let consumed = 0;
    sorted.forEach((log) => {
      consumed += log.spend;
      const balAfter = +(selectedClient.wallet.deposited - consumed).toFixed(2);
      rows.push([log.date, log.spend.toString(), log.note || "", balAfter.toString()]);
    });
    const csv = rows.map((r) => r.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedClient.name.replace(/\s+/g, "_")}_spend_log.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function handleCopyPortal() {
    if (!portalUrl || portalUrl === "#") return;
    setCopyMsg("");
    const res = await safeWriteToClipboard(portalUrl);
    if (res.ok) { setCopyMsg(res.method === "clipboard" ? "ক্লিপবোর্ডে কপি হয়েছে" : "কপি হয়েছে (fallback)"); return; }
    const input = portalInputRef.current; if (input) { input.focus(); input.select(); setCopyMsg("কপি ব্লকড — টেক্সট সিলেক্ট হয়েছে, Ctrl/Cmd + C চাপুন"); } else { setCopyMsg("কপি ব্লকড — লিংক সিলেক্ট করে নিজে কপি করুন"); }
  }

  // Forms
  const [newClient, setNewClient] = useState({ name: "", phone: "", fb: "" });
  const [walletAmount, setWalletAmount] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [scopeInput, setScopeInput] = useState("");
  const [mtg, setMtg] = useState({ title: "", date: "", time: "", location: "Google Meet", r1: true, r2: true, r3: true, r4: false });
  const rLabels = ["১ দিন আগে", "৩ ঘন্টা আগে", "৩০ মিনিট আগে", "১০ মিনিট আগে"];
  const chosenReminders = [mtg.r1, mtg.r2, mtg.r3, mtg.r4].map((v, i) => (v ? rLabels[i] : null)).filter(Boolean) as string[];

  /******************** Render ********************/
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <TopBar query={query} setQuery={setQuery} />

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-4">
        {/* S0: Overview */}
        <Section tag="S0" title="ওভারভিউ" subtitle="মোট জমা/খরচ/ব্যালেন্স, ৭ দিনের স্পেন্ড, অ্যালার্ট সেটিংস">
          <div className="grid grid-cols-12 gap-4">
            {/* KPI Cards */}
            <Card className="col-span-12 md:col-span-3 rounded-2xl shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><DollarSign className="h-4 w-4" />মোট জমা (USD)</CardTitle></CardHeader>
              <CardContent className="pt-0"><div className="text-2xl font-semibold">${metrics.deposited.toFixed(2)}</div><p className="text-xs text-slate-500 mt-1">Active: {metrics.active}</p></CardContent>
            </Card>
            <Card className="col-span-12 md:col-span-3 rounded-2xl shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">মোট খরচ (USD)</CardTitle></CardHeader>
              <CardContent className="pt-0"><div className="text-2xl font-semibold">${metrics.spent.toFixed(2)}</div><p className="text-xs text-slate-500 mt-1">গত ৭ দিন (চার্ট)</p></CardContent>
            </Card>
            <Card className="col-span-12 md:col-span-3 rounded-2xl shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">মোট ব্যালেন্স (USD)</CardTitle></CardHeader>
              <CardContent className="pt-0"><div className="text-2xl font-semibold">${metrics.balance.toFixed(2)}</div><p className="text-xs text-slate-500 mt-1">Deposited − Spent</p></CardContent>
            </Card>
            <Card className="col-span-12 md:col-span-3 rounded-2xl shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" />ক্লায়েন্ট</CardTitle></CardHeader>
              <CardContent className="pt-0"><div className="text-2xl font-semibold">{clients.length}</div><p className="text-xs text-slate-500 mt-1">Active: {metrics.active}</p></CardContent>
            </Card>

            {/* Spend & Alerts */}
            <Card className="col-span-12 lg:col-span-8 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-base">৭ দিনের Spend (USD)</CardTitle><Badge variant="secondary" className="rounded-2xl">All Clients</Badge></CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spend7d} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="spend" stroke="#0ea5e9" fill="url(#spend)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-12 lg:col-span-4 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />অ্যালার্ট ও ডাইজেস্ট</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3 text-sm">
                <div className="p-3 rounded-xl border">Low balance থ্রেশহোল্ড: $50 (কাস্টমাইজ করুন)</div>
                <div className="flex items-center gap-2"><Switch checked={autoDigest} onCheckedChange={setAutoDigest} id="digest" /><Label htmlFor="digest" className="text-sm">সকাল ৯টায় ডেইলি ডাইজেস্ট পাঠাও</Label></div>
                <div className="text-xs text-slate-500">নোট: রিমাইন্ডার/ডাইজেস্ট লাইভ করতে ব্যাকএন্ড/অটোমেশন দরকার হবে।</div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* S1: Client Setup */}
        <Section tag="S1" title="ক্লায়েন্ট সেটআপ" subtitle="প্রোফাইল, ওয়ালেট, স্কোপ/অফার—সব এক জায়গায়">
          <div className="grid grid-cols-12 gap-4">
            {/* Create Client */}
            <Card className="col-span-12 xl:col-span-4 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 flex items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" />নতুন ক্লায়েন্ট প্রোফাইল</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Input placeholder="নাম (উদা. হাসান)" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
                <Input placeholder="মোবাইল নম্বর" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
                <Input placeholder="Facebook পেইজ লিংক" value={newClient.fb} onChange={(e) => setNewClient({ ...newClient, fb: e.target.value })} />
                <Button className="w-full" onClick={() => { if (newClient.name) { createClient(newClient); setNewClient({ name: "", phone: "", fb: "" }); } }}>প্রোফাইল তৈরি করুন</Button>
                <div className="text-xs text-slate-500">ডিফল্ট স্কোপ: <b>Facebook Marketing</b> — বাকিগুলো পরে ম্যানুয়ালি যোগ করুন।</div>
              </CardContent>
            </Card>

            {/* Wallet */}
            <Card className="col-span-12 xl:col-span-4 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 flex items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" />ওয়ালেট (জমা/খরচ)</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger><SelectValue placeholder="ক্লায়েন্ট বাছাই" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 rounded-lg bg-slate-50 border"><div className="text-xs text-slate-500">Deposited</div><div className="font-semibold">${(selectedClient?.wallet.deposited || 0).toFixed(2)}</div></div>
                  <div className="p-2 rounded-lg bg-slate-50 border"><div className="text-xs text-slate-500">Spent</div><div className="font-semibold">${(selectedClient?.wallet.spent || 0).toFixed(2)}</div></div>
                  <div className="p-2 rounded-lg bg-slate-50 border"><div className="text-xs text-slate-500">Balance</div><div className="font-semibold">${(((selectedClient?.wallet.deposited || 0) - (selectedClient?.wallet.spent || 0)) || 0).toFixed(2)}</div></div>
                </div>
                <div className="flex gap-2">
                  <Input type="number" step="0.01" placeholder="$ amount" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} />
                  <Button variant="outline" onClick={() => { const a = parseFloat(walletAmount); if (selectedClientId) addFunds(selectedClientId, a); setWalletAmount(""); }}>+ ফান্ড</Button>
                </div>
                <div className="flex gap-2">
                  <Input type="number" step="0.01" placeholder="$ spend" value={spendAmount} onChange={(e) => setSpendAmount(e.target.value)} />
                  <Button variant="outline" onClick={() => { const a = parseFloat(spendAmount); if (selectedClientId) recordSpend(selectedClientId, a); setSpendAmount(""); }}>খরচ যোগ</Button>
                </div>
                <div className="text-xs text-slate-500">উদাহরণ: “হাসানের একাউন্টে $50 যোগ করো”, “আজ $10 খরচ হয়েছে”—এ দুটিই এখানে কাজ করবে।</div>
              </CardContent>
            </Card>

            {/* Scope Manual */}
            <Card className="col-span-12 xl:col-span-4 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 flex items-center justify_between"><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" />স্কোপ/কাজের লিস্ট</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="text-sm">ক্লায়েন্ট: <b>{selectedClient?.name || "--"}</b></div>
                <div className="flex gap-2">
                  <Input placeholder="স্কোপ যোগ করুন (উদা. Website, Landing Page, Consultancy, Course)" value={scopeInput} onChange={(e) => setScopeInput(e.target.value)} />
                  <Button variant="outline" onClick={() => { if (selectedClientId && scopeInput) { addScope(selectedClientId, scopeInput.trim()); setScopeInput(""); } }}>যোগ</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedClient?.scopes || []).map((s) => (
                    <Badge key={s} className="rounded-2xl gap-1">{s}<Button size="icon" variant="ghost" className="h-4 w-4 p-0" onClick={() => removeScope(selectedClientId, s)}>×</Button></Badge>
                  ))}
                  {(!selectedClient?.scopes || selectedClient.scopes.length === 0) && (<div className="text-xs text-slate-500">কিছু যোগ করা হয়নি</div>)}
                </div>
                <div className="text-xs text-slate-500">ডিফল্ট হিসেবে Facebook Marketing যুক্ত থাকে—বাকিগুলো এখানে ম্যানুয়ালি যোগ করুন।</div>
              </CardContent>
            </Card>

            {/* Preset Offers */}
            <Card className="col-span-12 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 flex items-center justify-between"><CardTitle className="text-base">স্কোপ/অফার (প্রিসেট)</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="text-sm">ক্লায়েন্ট: <b>{selectedClient?.name || "--"}</b></div>
                <div className="flex flex-wrap gap-2">{["Website Development", "Landing Page Design", "Business Consultancy", "Course/Training"].map((lbl) => (<Button key={lbl} variant="outline" onClick={() => selectedClientId && addScope(selectedClientId, lbl)}>{lbl}</Button>))}</div>
                <div className="text-xs text-slate-500">প্রিসেট বাটন চাপলেই স্কোপে যুক্ত হবে; ম্যানুয়াল সেকশন আগের মতোই রাখা হয়েছে।</div>
              </CardContent>
            </Card>

            {/* Client Portal + Daily Spend Log */}
            <Card className="col-span-12 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 flex items-center justify_between"><CardTitle className="text-base">ক্লায়েন্ট পোর্টাল + দৈনিক Spend Log</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="rounded-lg border p-2 text-sm flex flex-col md:flex-row md:items-center gap-2">
                  <div className="flex-1 flex items-center gap-2"><LinkIcon className="h-4 w-4" /><Input ref={portalInputRef} readOnly value={portalUrl} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" /></div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopyPortal} className="gap-1"><Copy className="h-3.5 w-3.5" /> কপি</Button>
                    <Button size="sm" variant="outline" onClick={exportCsv} className="gap-1"><Download className="h-3.5 w-3.5" /> CSV</Button>
                  </div>
                  {copyMsg && <div className="text-xs text-emerald-700 md:ml-2">{copyMsg}</div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input type="date" value={spendDetail.date} onChange={(e) => setSpendDetail({ ...spendDetail, date: e.target.value })} />
                  <Input type="number" step="0.01" placeholder="$ spend" value={spendDetail.amount} onChange={(e) => setSpendDetail({ ...spendDetail, amount: e.target.value })} />
                  <Input placeholder="নোট (ঐচ্ছিক)" value={spendDetail.note} onChange={(e) => setSpendDetail({ ...spendDetail, note: e.target.value })} />
                  <Button variant="outline" onClick={() => { const a = parseFloat(spendDetail.amount); if (selectedClientId && a) { recordSpend(selectedClientId, a, spendDetail.date, spendDetail.note); setSpendDetail({ ...spendDetail, amount: "", note: "" }); } }}>দৈনিক খরচ লগে যোগ</Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Input placeholder="Google Sheet ID (ঐচ্ছিক)" value={sheetId} onChange={(e) => setSheetId(e.target.value)} className="w-64" />
                  <Button variant="outline"><ExternalLink className="h-4 w-4 mr-1" />Sheet-এ Sync (প্রোড)</Button>
                  <Button variant="outline" onClick={() => { const name = selectedClient?.name || "Client"; const body = encodeURIComponent(`Add Funds request from ${name}`); window.open(`mailto:you@agency.com?subject=Add%20Funds%20-%20${encodeURIComponent(name)}&body=${body}`, "_blank"); }}>Add Funds (Email)</Button>
                  <Button variant="outline" onClick={() => { const name = selectedClient?.name || "Client"; const text = encodeURIComponent(`Add Funds request from ${name}`); window.open(`https://wa.me/8801XXXXXXXXX?text=${text}`, "_blank"); }}>Add Funds (WhatsApp)</Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>তারিখ</TableHead>
                        <TableHead>খরচ (USD)</TableHead>
                        <TableHead>নোট</TableHead>
                        <TableHead>ব্যালেন্স (এর পর)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedClient?.logs || [])
                        .slice()
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((log, idx, arr) => {
                          const spentUntil = arr.slice(0, idx + 1).reduce((s, x) => s + x.spend, 0);
                          const bal = +((selectedClient?.wallet.deposited || 0) - spentUntil).toFixed(2);
                          return (
                            <TableRow key={log.date + idx}>
                              <TableCell>{log.date}</TableCell>
                              <TableCell>${log.spend.toFixed(2)}</TableCell>
                              <TableCell className="text-xs">{log.note || "—"}</TableCell>
                              <TableCell className={bal < 50 ? "text-red-600 font-semibold" : ""}>${bal.toFixed(2)}</TableCell>
                            </TableRow>
                          );
                        })}
                      {(!selectedClient || (selectedClient.logs || []).length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-500 text-sm">কোন রেকর্ড নেই</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-xs text-slate-500">পোর্টাল পেজে <b>clientId + portalKey</b> দিয়ে এই টেবিলের read-only ভিউ দেখাবে।</div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* S2: Meetings */}
        <Section tag="S2" title="মিটিং" subtitle="শিডিউল করুন এবং তালিকা দেখুন">
          <div className="grid grid-cols-12 gap-4">
            {/* Schedule */}
            <Card className="col-span-12 lg:col-span-6 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 flex items_center justify-between"><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />মিটিং শিডিউল</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger><SelectValue placeholder="ক্লায়েন্ট" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                  </Select>
                  <Input placeholder="টাইটেল (উদা. স্ট্র্যাটেজি কল)" value={mtg.title} onChange={(e) => setMtg({ ...mtg, title: e.target.value })} />
                  <Input type="date" value={mtg.date} onChange={(e) => setMtg({ ...mtg, date: e.target.value })} />
                  <Input type="time" value={mtg.time} onChange={(e) => setMtg({ ...mtg, time: e.target.value })} />
                </div>
                <Input placeholder="লোকেশন (উদা. Google Meet লিংক)" value={mtg.location} onChange={(e) => setMtg({ ...mtg, location: e.target.value })} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["১ দিন আগে", "৩ ঘন্টা আগে", "৩০ মিনিট আগে", "১০ মিনিট আগে"].map((lbl, i) => (
                    <Button
                      key={lbl}
                      variant={[mtg.r1, mtg.r2, mtg.r3, mtg.r4][i] ? "default" : "outline"}
                      onClick={() =>
                        setMtg((prev) => ({
                          ...prev,
                          [(["r1", "r2", "r3", "r4"][i]) as "r1" | "r2" | "r3" | "r4"]: !([prev.r1, prev.r2, prev.r3, prev.r4][i]),
                        }))
                      }
                    >
                      <AlarmClock className="h-4 w-4 mr-1" />
                      {lbl}
                    </Button>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!selectedClientId || !mtg.title || !mtg.date || !mtg.time) return;
                    const dt = `${mtg.date}T${mtg.time}`;
                    scheduleMeeting({ clientId: selectedClientId, title: mtg.title, datetime: dt, location: mtg.location || "Google Meet", reminders: chosenReminders });
                    setMtg({ title: "", date: "", time: "", location: "Google Meet", r1: true, r2: true, r3: true, r4: false });
                  }}
                >
                  শিডিউল সেট করুন
                </Button>
                <div className="text-xs text-slate-500">উদাহরণ: “২৫ তারিখ হাসানের সাথে মিটিং, দিনে তিন-চারবার অ্যালার্ট দিও।”</div>
              </CardContent>
            </Card>

            {/* Meetings list */}
            <Card className="col-span-12 lg:col-span-6 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 flex items-center justify_between"><CardTitle className="text-base">মিটিং লিস্ট</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>তারিখ/সময়</TableHead>
                      <TableHead>ক্লায়েন্ট</TableHead>
                      <TableHead>টাইটেল</TableHead>
                      <TableHead>রিমাইন্ডার</TableHead>
                      <TableHead>লোকেশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetings.map((m) => {
                      const c = clients.find((x) => x.id === m.clientId);
                      const when = new Date(m.datetime);
                      return (
                        <TableRow key={m.id}>
                          <TableCell>{when.toLocaleString()}</TableCell>
                          <TableCell>{c?.name || m.clientId}</TableCell>
                          <TableCell>{m.title}</TableCell>
                          <TableCell className="text-xs">{m.reminders.join(" | ")}</TableCell>
                          <TableCell>
                            <a className="text-blue-600 hover:underline" href={m.location} target="_blank" rel="noreferrer">
                              Open
                              <ExternalLink className="inline h-3 w-3 ml-1" />
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* S3: Directory */}
        <Section tag="S3" title="সকল ক্লায়েন্ট" subtitle="কুইক সার্চ ও ব্যালেন্স ভিউ">
          <Card className="col-span-12 rounded-2xl shadow-sm">
            <CardHeader className="pb-2 flex items-center justify_between"><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />ক্লায়েন্ট তালিকা</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>নাম</TableHead>
                    <TableHead>ফোন</TableHead>
                    <TableHead>Facebook</TableHead>
                    <TableHead>Deposited</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>স্কোপ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients
                    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || !query)
                    .map((c) => {
                      const bal = c.wallet.deposited - c.wallet.spent;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.phone}</TableCell>
                          <TableCell>
                            <a data-kind="fb-link" href={c.fb} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Page</a>
                          </TableCell>
                          <TableCell>${c.wallet.deposited.toFixed(2)}</TableCell>
                          <TableCell>${c.wallet.spent.toFixed(2)}</TableCell>
                          <TableCell className={bal < 50 ? "text-red-600 font-semibold" : ""}>${bal.toFixed(2)}</TableCell>
                          <TableCell className="text-xs">{(c.scopes || []).join(", ") || "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Section>

        {/* S4: Agent Query (Beta) */}
        <Section tag="S4" title="এজেন্টকে জিজ্ঞাসা করুন (বিটা)" subtitle="প্রাকৃতিক ভাষায় সার্চ/ফিল্টার করে টেবিলে ফলাফল দেখায়">
          <Card className="col-span-12 rounded-2xl shadow-sm">
            <CardHeader className="pb-2 flex items-center justify-between"><CardTitle className="text-base flex items_center gap-2"><Bot className="h-4 w-4"/>Agent Query</CardTitle><Badge variant="secondary" className="rounded-2xl">বাংলা/English</Badge></CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex gap-2">
                <Input value={agentQ} onChange={(e)=>setAgentQ(e.target.value)} placeholder="উদা. 'ফেসবুক মার্কেটিং যারা নিচ্ছে তাদের হোয়াটসঅ্যাপ নাম্বার দাও'" />
                <Button onClick={()=> setAgentRes(runAgentQuery(agentQ, clients))}>খুঁজুন</Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  "ফেসবুক মার্কেটিং যারা নিচ্ছে তাদের লিস্ট",
                  "facebook marketing list with phone",
                  "Landing Page ক্লায়েন্টদের Facebook পেইজ দেখাও",
                  "consultancy যাদের আছে তাদের balance",
                  "সবাইয়ের স্কোপ দেখাও",
                ].map((s,i)=> (
                  <Button key={i} size="sm" variant="outline" onClick={()=>{ setAgentQ(s); setAgentRes(runAgentQuery(s, clients)); }}>{s}</Button>
                ))}
              </div>
              {agentRes ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">{agentRes.summary}</div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader data-testid="agent-table-head">
                        <TableRow>
                          {agentRes.columns.map(c=> <TableHead key={c.key}>{c.label}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agentRes.results.map((row, idx)=> (
                          <TableRow key={idx}>
                            {agentRes.columns.map(c=> <TableCell key={c.key}>{row[c.key]}</TableCell>)}
                          </TableRow>
                        ))}
                        {agentRes.results.length===0 && (
                          <TableRow>
                            <TableCell colSpan={agentRes.columns.length} className="text-center text-slate-500 text-sm">কোন ফলাফল নেই</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">কোন প্রশ্ন চালানো হয়নি—উপরে একটা প্রশ্ন লিখে “খুঁজুন” চাপুন।</div>
              )}
            </CardContent>
          </Card>
        </Section>

        {/* S5: Diagnostics & Tests */}
        <Section tag="S5" title="ডায়াগনস্টিক্স / টেস্টস" subtitle="Clipboard কপি ফিচার + Agent Query ফিচারের টেস্ট">
          <Card className="col-span-12 rounded-2xl shadow-sm">
            <CardHeader className="pb-2 flex items-center justify-between"><CardTitle className="text-base">Tests</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={async()=>{ const r = await safeWriteToClipboard("test-clipboard"); setCopyMsg(r.ok?`Clipboard OK via ${r.method}`:"Clipboard blocked — selection only"); }}>Clipboard Test</Button>
                <Button size="sm" variant="outline" onClick={()=>{ const q = "facebook marketing list with phone"; setAgentQ(q); setAgentRes(runAgentQuery(q, clients)); }}>Agent Query Test</Button>
                <Button size="sm" variant="outline" onClick={() => { const a = document.querySelector('a[data-kind="fb-link"]'); const t = a?.getAttribute('target'); setCopyMsg(t === '_blank' ? 'Directory link target OK (_blank)' : 'Directory link target = ' + (t || 'null')); }}>Directory Link Test</Button>
                <Button size="sm" variant="outline" onClick={() => { const first = document.querySelectorAll('[data-testid="agent-table-head"] th').length; const fallback = (agentRes?.columns?.length || 0); const heads = first || fallback; setCopyMsg('No Results Row colSpan check = ' + heads); }}>No Results Row Test</Button>
                <Button size="sm" variant="outline" onClick={() => { const hasHead = !!document.querySelector('[data-testid="agent-table-head"]'); setCopyMsg(hasHead ? 'Agent head present' : 'Agent head missing'); }}>Agent Head Presence Test</Button>
                <Button size="sm" variant="outline" onClick={() => { const footerIcon = document.querySelector('[data-testid="footer-status"] svg'); setCopyMsg(footerIcon ? 'Footer icon render OK' : 'Footer icon not found'); }}>Footer Icon Test</Button>
                {/* Extra tests */}
                <Button size="sm" variant="outline" onClick={() => { exportCsv(); setCopyMsg('CSV export triggered'); }}>CSV Export Test</Button>
                <Button size="sm" variant="outline" onClick={() => { handleCopyPortal(); }}>Copy Portal Test</Button>
                <Button size="sm" variant="outline" onClick={() => { const low = Array.from(document.querySelectorAll('td')).some(td => td.className.includes('text-red-600')); setCopyMsg(low ? 'Balance Highlight Test: OK' : 'Balance Highlight Test: Not found'); }}>Balance Highlight Test</Button>
                <Button size="sm" variant="outline" onClick={() => { const rows = document.querySelectorAll('table tbody tr').length; setCopyMsg('Directory Rows (approx): ' + rows); }}>Directory Row Count Test</Button>
                <Button size="sm" variant="outline" onClick={() => { const ok = (portalUrl.includes('/c/') && portalUrl.includes('?key=')); setCopyMsg(ok ? 'Portal URL format OK' : 'Portal URL format BAD'); }}>Portal URL Format Test</Button>
              </div>
              <div className="rounded-md bg-slate-50 border p-2 text-xs">Status: {copyMsg || "(idle)"}</div>
            </CardContent>
          </Card>
        </Section>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="text-xs text-slate-500 flex items-center gap-2" data-testid="footer-status">
          <CheckCircle2 className="h-3.5 w-3.5" />
          ডিজাইন স্ট্যাটাস: In-App CRM MVP — ডিফল্ট স্কোপ, পোর্টাল লিংক (কপি সেফ fallback সহ), তারিখভিত্তিক Spend Log, Agent Query (বিটা), মিটিং/রিমাইন্ডার, CSV এক্সপোর্ট।
        </div>
      </div>
    </div>
  );
}

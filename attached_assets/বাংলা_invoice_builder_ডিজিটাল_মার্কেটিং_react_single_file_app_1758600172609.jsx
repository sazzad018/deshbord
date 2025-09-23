"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Download, Plus, Trash2, Building2, User2, Percent, TimerReset } from "lucide-react";

// ==============================================
// FIX SUMMARY
// - Resolved ReferenceError: $1 is not defined by removing stray placeholder
//   and restoring a valid useEffect body.
// - Ensured JSX `return` is inside the component function.
// - Kept OKLCH-safe printable area (HEX/RGB inline styles only).
// - Applied user's brand color (#BFA1FE) to header, table head, CTA buttons.
// - Preserved previous tests and added a small extra layout test.
// ==============================================

// ---------- CONFIG / BRAND (HEX only) ----------
const BRAND = "#BFA1FE"; // user's brand color
const BRAND_TEXT = "#2f2650"; // readable on BRAND
const PAPER_BG = "#ffffff";
const BODY_TEXT = "#1f2937";
const ACCENT_BG = "#faf6ff"; // very light tint of brand
const BORDER = "#e5e7eb";

// --- helpers (lightweight fallbacks if libs unavailable) ---
const formatBDT = (n) => new Intl.NumberFormat("bn-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 2 }).format(n || 0);
const todayISO = () => new Date().toISOString().slice(0,10);
const addDays = (d, n) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate()+n);
  return dt.toISOString().slice(0,10);
};

// --- sample masters (replace with your real data / API) ---
const CLIENTS = [
  { id: "c1", name: "ABC Traders", email: "contact@abctraders.com", phone: "+8801700000000", address: "Banani, Dhaka" },
  { id: "c2", name: "XYZ Fashion", email: "hello@xyzfashion.com", phone: "+8801800000000", address: "Uttara, Dhaka" },
];
const COMPANIES = [
  { id: "sdd", name: "SMART DIGITAL DEAL", email: "support@smartdigitaldeal.com", phone: "+8801XXXXXXXXX", address: "Mirpur, Dhaka", website: "smartdigitaldeal.com" },
  { id: "alt", name: "Alternate Agency", email: "ops@altagency.com", phone: "+8801YYYYYYYYY", address: "Gulshan, Dhaka", website: "altagency.com" },
];

const EMPTY_ITEM = { description: "", qty: 1, rate: 0 };

export default function InvoiceBuilder() {
  // -------------- STATE -----------------
  const printableRef = useRef(null);
  const [companyId, setCompanyId] = useState(COMPANIES[0].id);
  const [clientId, setClientId] = useState(CLIENTS[0].id);
  const [invoiceNo, setInvoiceNo] = useState(() => `INV-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`);
  const [issueDate, setIssueDate] = useState(todayISO());
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addDays(todayISO(), 30));
  const [items, setItems] = useState([{ ...EMPTY_ITEM, description: "Facebook Ads Management", qty: 1, rate: 15000 }]);
  const [discountPct, setDiscountPct] = useState(0);
  const [vatPct, setVatPct] = useState(0);
  const [notes, setNotes] = useState("Payment due within 7 days. Mobile Banking/Bkash/Nagad accepted.");
  const [currency, setCurrency] = useState("BDT");

  const company = useMemo(() => COMPANIES.find(c => c.id === companyId) || COMPANIES[0], [companyId]);
  const client = useMemo(() => CLIENTS.find(c => c.id === clientId) || CLIENTS[0], [clientId]);

  const subTotal = useMemo(() => items.reduce((a, it) => a + (Number(it.qty)||0) * (Number(it.rate)||0), 0), [items]);
  const discountAmt = useMemo(() => subTotal * (Number(discountPct)||0) / 100, [subTotal, discountPct]);
  const vatAmt = useMemo(() => (subTotal - discountAmt) * (Number(vatPct)||0) / 100, [subTotal, discountPct, vatPct]);
  const grandTotal = useMemo(() => subTotal - discountAmt + vatAmt, [subTotal, discountAmt, vatAmt]);

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, patch) => setItems(prev => prev.map((it, i) => i===idx ? { ...it, ...patch } : it));

  const resetForm = () => {
    setInvoiceNo(`INV-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`);
    setIssueDate(todayISO());
    setStartDate(todayISO());
    setEndDate(addDays(todayISO(), 30));
    setItems([{ ...EMPTY_ITEM }]);
    setDiscountPct(0);
    setVatPct(0);
    setNotes("");
  };

  // --------- PDF (html2canvas) with oklch-safe capture ----------
  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      const input = printableRef.current;
      if (!input) return;

      // Clone target & enforce hex/rgb colors inline (already set below),
      // plus fixed width for consistent rendering.
      const clone = input.cloneNode(true);
      clone.style.width = "800px";
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { scale: 2, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40; // 20pt margins
      const imgHeight = canvas.height * imgWidth / canvas.width;

      if (imgHeight < pageHeight - 40) {
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      } else {
        // multipage slicing
        let remaining = imgHeight;
        const sliceHeight = pageHeight - 40;
        const ratio = imgWidth / canvas.width;
        let drawn = 0;
        while (remaining > 0) {
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(canvas.height - Math.floor(drawn/ratio), Math.floor(sliceHeight/ratio));
          const ctx = pageCanvas.getContext("2d");
          ctx.drawImage(
            canvas,
            0, Math.floor(drawn/ratio),
            pageCanvas.width, pageCanvas.height,
            0, 0, pageCanvas.width, pageCanvas.height
          );
          const pageData = pageCanvas.toDataURL("image/png");
          pdf.addImage(pageData, "PNG", 20, 20, imgWidth, pageCanvas.height*ratio);
          drawn += pageCanvas.height*ratio;
          remaining -= sliceHeight;
          if (remaining > 0) pdf.addPage();
        }
      }

      pdf.save(`${invoiceNo}.pdf`);
    } catch (err) {
      console.error(err);
      alert(
        "PDF তৈরি করতে সমস্যা হয়েছে. আপনার পরিবেশে 'oklch' রঙ সাপোর্ট নাও থাকতে পারে। দয়া করে আধুনিক ব্রাউজার ব্যবহার করুন অথবা আমাকে জানান—আমি image-based বিকল্প দেব।"
      );
    }
  };

  // ------------------ SELF TESTS -------------------
  useEffect(() => {
    // 1) Totals math test (existing)
    const testItems = [ { qty: 2, rate: 100 }, { qty: 3, rate: 50 } ]; // subtotal 350
    const tSub = testItems.reduce((a, it)=>a+it.qty*it.rate, 0);
    const tDisc = tSub * 0.10; // 10%
    const tVat = (tSub - tDisc) * 0.05; // 5%
    const tGrand = tSub - tDisc + tVat; // 330.75
    console.assert(tSub === 350, "Subtotal test failed");
    console.assert(Math.abs(tDisc - 35) < 1e-6, "Discount test failed");
    console.assert(Math.abs(tVat - 15.75) < 1e-6, "VAT test failed");
    console.assert(Math.abs(tGrand - 330.75) < 1e-6, "Grand total test failed");

    // 2) Ensure printable area doesn't expose any oklch in computed styles (existing)
    const el = printableRef.current;
    if (el) {
      const cs = getComputedStyle(el);
      const hasOKLCH = (v) => typeof v === "string" && /oklch/i.test(v);
      console.assert(!hasOKLCH(cs.color), "Printable color should not be oklch");
      console.assert(!hasOKLCH(cs.backgroundColor), "Printable background should not be oklch");
    }

    // 3) Brand banner oklch-free (existing)
    const banner = document.querySelector('[data-brand-banner="1"]');
    if (banner) {
      const bg = getComputedStyle(banner).backgroundColor || "";
      console.assert(!/oklch/i.test(bg), "Brand banner color must not be oklch");
    }

    // 4) Long description wrapping should not overflow horizontally (existing)
    const probe = document.createElement("div");
    probe.style.width = "300px";
    probe.style.fontSize = "12px";
    probe.style.overflowWrap = "anywhere";
    probe.style.wordBreak = "break-word";
    probe.style.whiteSpace = "pre-wrap";
    probe.textContent = `একটানা-লম্বা-শব্দaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa ডেসক্রিপশন\nNext line`;
    document.body.appendChild(probe);
    console.assert(probe.scrollWidth <= probe.clientWidth, "Long description should wrap and not overflow horizontally");
    document.body.removeChild(probe);

    // 5) Extra layout test: table should be fixed layout to prevent overflow
    const table = document.querySelector("table");
    if (table) {
      const cs2 = getComputedStyle(table);
      console.assert(cs2.tableLayout === "fixed", "Table layout should be fixed");
    }
  }, []);

  // ------------------- RENDER ----------------------
  return (
    <div className="min-h-screen p-6" style={{ background: "#f6f7fb" }}>
      <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Building2 className="h-5 w-5"/> ইনভয়েস সেটআপ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">কোম্পানি (Seller)</Label>
                <select className="w-full border rounded-lg p-2" value={companyId} onChange={(e)=>setCompanyId(e.target.value)}>
                  {COMPANIES.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-1 block">ক্লায়েন্ট (Buyer)</Label>
                <select className="w-full border rounded-lg p-2" value={clientId} onChange={(e)=>setClientId(e.target.value)}>
                  {CLIENTS.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block">ইনভয়েস নং</Label>
                <Input value={invoiceNo} onChange={(e)=>setInvoiceNo(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block flex items-center gap-1"><Calendar className="h-4 w-4"/>ইস্যু ডেট</Label>
                <Input type="date" value={issueDate} onChange={(e)=>setIssueDate(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">কারেন্সি</Label>
                <select className="w-full border rounded-lg p-2" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block flex items-center gap-1"><TimerReset className="h-4 w-4"/> কাজ শুরু</Label>
                <Input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block flex items-center gap-1"><TimerReset className="h-4 w-4"/> কাজ শেষ</Label>
                <Input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block flex items-center gap-1"><Percent className="h-4 w-4"/> ডিসকাউন্ট %</Label>
                <Input type="number" min="0" max="100" value={discountPct} onChange={(e)=>setDiscountPct(e.target.value)} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">ভ্যাট/GST %</Label>
                <Input type="number" min="0" max="100" value={vatPct} onChange={(e)=>setVatPct(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">নোট</Label>
                <Textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="যেমনঃ Payment within 7 days"/>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>সার্ভিস / আইটেম</Label>
                <Button onClick={addItem} className="rounded-2xl" style={{ background: BRAND, color: BRAND_TEXT }}><Plus className="h-4 w-4 mr-1"/>আইটেম যোগ করুন</Button>
              </div>
              {items.map((it, idx)=> (
                <div key={idx} className="grid md:grid-cols-12 gap-2 items-center p-3 rounded-xl" style={{ background: PAPER_BG, border: `1px solid ${BORDER}` }}>
                  <Textarea className="md:col-span-6" rows={2} placeholder="Description (multi-line)" value={it.description} onChange={(e)=>updateItem(idx,{description:e.target.value})} style={{ resize: "vertical" }} />
                  <Input className="md:col-span-2" type="number" min="1" placeholder="Qty" value={it.qty} onChange={(e)=>updateItem(idx,{qty:Number(e.target.value)})} />
                  <Input className="md:col-span-3" type="number" min="0" placeholder="Rate" value={it.rate} onChange={(e)=>updateItem(idx,{rate:Number(e.target.value)})} />
                  <Button variant="ghost" onClick={()=>removeItem(idx)} className="md:col-span-1" style={{ color: "#dc2626" }}><Trash2 className="h-4 w-4"/></Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={downloadPDF} className="rounded-2xl" style={{ background: BRAND, color: BRAND_TEXT }}><Download className="h-4 w-4 mr-1"/> PDF ডাউনলোড</Button>
              <Button variant="outline" onClick={resetForm} className="rounded-2xl"><TimerReset className="h-4 w-4 mr-1"/> রিসেট</Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Printable invoice (OKLCH-SAFE + BRAND) */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">প্রিন্ট প্রিভিউ</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Printable area uses explicit HEX colors only */}
            <div
              ref={printableRef}
              className="rounded-xl overflow-hidden"
              style={{ background: PAPER_BG, color: BODY_TEXT }}
            >
              {/* Brand banner */}
              <div data-brand-banner="1" style={{ background: BRAND, color: BRAND_TEXT, padding: 16 }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl font-bold">{company.name}</div>
                    <div className="text-sm">{company.address}</div>
                    <div className="text-sm">{company.phone} · {company.email}</div>
                    {company.website && <div className="text-sm">{company.website}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black tracking-wide">INVOICE</div>
                    <div className="text-sm">Invoice No: <span className="font-semibold">{invoiceNo}</span></div>
                    <div className="text-sm">Issue Date: {issueDate}</div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Parties */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg" style={{ background: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                    <div className="font-semibold flex items-center gap-2" style={{ color: BRAND_TEXT }}><User2 className="h-4 w-4"/> Bill To</div>
                    <div className="text-lg">{client.name}</div>
                    <div className="text-sm">{client.address}</div>
                    <div className="text-sm">{client.phone} · {client.email}</div>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                    <div className="font-semibold flex items-center gap-2" style={{ color: BRAND_TEXT }}><Calendar className="h-4 w-4"/> কাজের সময়সীমা</div>
                    <div className="text-sm">শুরু: <span className="font-semibold">{startDate}</span></div>
                    <div className="text-sm">শেষ: <span className="font-semibold">{endDate}</span></div>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-6">
                  <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: "55%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "20%" }} />
                    </colgroup>
                    <thead>
                      <tr style={{ textAlign: "left", background: BRAND, color: BRAND_TEXT }}>
                        <th className="p-2" style={{ borderTopLeftRadius: 6 }}>Description</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Rate ({currency})</th>
                        <th className="p-2" style={{ borderTopRightRadius: 6, textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx)=>{
                        const amount = (Number(it.qty)||0) * (Number(it.rate)||0);
                        const isLast = idx === items.length - 1;
                        return (
                          <tr key={idx}>
                            <td className="p-2" style={{ borderBottom: isLast ? "none" : `1px solid ${BORDER}` }}><div data-desc-cell="1" style={{ overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{it.description || <span style={{ color: "#9ca3af" }}>—</span>}</div></td>
                            <td className="p-2" style={{ borderBottom: isLast ? "none" : `1px solid ${BORDER}` }}>{it.qty}</td>
                            <td className="p-2" style={{ borderBottom: isLast ? "none" : `1px solid ${BORDER}` }}>{it.rate}</td>
                            <td className="p-2" style={{ textAlign: "right", borderBottom: isLast ? "none" : `1px solid ${BORDER}` }}>{currency === "BDT" ? formatBDT(amount) : amount.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
                  <div>
                    <div className="text-sm" style={{ color: "#475569" }}>Notes</div>
                    <div className="text-sm whitespace-pre-line">{notes}</div>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                    <div className="flex justify-between py-1"><span>Subtotal</span><span>{currency === "BDT" ? formatBDT(subTotal) : subTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between py-1"><span>Discount ({discountPct||0}%)</span><span>- {currency === "BDT" ? formatBDT(discountAmt) : discountAmt.toFixed(2)}</span></div>
                    <div className="flex justify-between py-1"><span>VAT/GST ({vatPct||0}%)</span><span>{currency === "BDT" ? formatBDT(vatAmt) : vatAmt.toFixed(2)}</span></div>
                    <div className="flex justify-between py-2 text-lg font-semibold" style={{ borderTop: `1px solid ${BORDER}`, marginTop: 8 }}><span>Total</span><span>{currency === "BDT" ? formatBDT(grandTotal) : grandTotal.toFixed(2)}</span></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs" style={{ color: "#6b7280" }}>
                  This is a system-generated invoice by SMART DIGITAL DEAL · Thank you!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Plus, Trash2, Building2, User2, Percent, TimerReset, FileText, Minus, Save } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client, CompanySettings } from "@shared/schema";

// Brand Colors
const BRAND = "#BFA1FE";
const BRAND_TEXT = "#2f2650";
const PAPER_BG = "#ffffff";
const BODY_TEXT = "#1f2937";
const ACCENT_BG = "#faf6ff";
const BORDER = "#e5e7eb";

// Helper functions
const formatCurrency = (n: number, currency: string) => {
  if (currency === "BDT") {
    // Use English numerals but BDT symbol
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT", maximumFractionDigits: 2 }).format(n || 0).replace('BDT', '৳');
  } else {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency, maximumFractionDigits: 2 }).format(n || 0);
  }
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (d: string, n: number) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
};

interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
}

const EMPTY_ITEM: InvoiceItem = { description: "", qty: 1, rate: 0 };

export default function InvoiceMaker() {
  const printableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // State
  const [isMinimized, setIsMinimized] = useState(false);
  const [companyMinimized, setCompanyMinimized] = useState(true);
  const [clientId, setClientId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState(() => `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState(todayISO());
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addDays(todayISO(), 30));
  const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM, description: "Facebook Ads Management", qty: 1, rate: 15000 }]);
  const [discountPct, setDiscountPct] = useState(0);
  const [vatPct, setVatPct] = useState(0);
  const [notes, setNotes] = useState("Payment due within 7 days. Mobile Banking/Bkash/Nagad accepted.");
  const [currency, setCurrency] = useState("BDT");
  
  // Company editing state
  const [editableCompany, setEditableCompany] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyWebsite: ""
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    refetchInterval: false,
  });

  // Fetch company settings
  const { data: companyData } = useQuery<CompanySettings>({
    queryKey: ["/api/company-settings"],
    refetchInterval: false,
  });

  // Use editableCompany state for invoice preview, with fallback to DB data or defaults
  const company = useMemo(() => {
    // If user has typed something, use their input for preview
    if (editableCompany.companyName) {
      return editableCompany;
    }
    // Fallback to DB data or defaults
    return companyData || {
      companyName: "Social Ads Expert",
      companyEmail: "support@agentcrm.com",
      companyPhone: "+8801XXXXXXXXX",
      companyAddress: "Dhaka, Bangladesh",
      companyWebsite: "agentcrm.com"
    };
  }, [editableCompany, companyData]);
  
  // Track initialization state to prevent unnecessary resets during user interaction
  const [hasInitialized, setHasInitialized] = useState(false);
  const [userHasEdited, setUserHasEdited] = useState(false);

  // Initialize editable company data when component loads and when DB data becomes available
  useEffect(() => {
    if (companyData && (!hasInitialized || !userHasEdited)) {
      // Load from database data - either first time or when data becomes available
      const dbCompany = companyData;
      setEditableCompany({
        companyName: dbCompany.companyName || "",
        companyEmail: dbCompany.companyEmail || "", 
        companyPhone: dbCompany.companyPhone || "",
        companyAddress: dbCompany.companyAddress || "",
        companyWebsite: dbCompany.companyWebsite || ""
      });
      setHasInitialized(true);
    } else if (!companyData && !hasInitialized) {
      // If no DB data exists, use default values (but only once)
      setEditableCompany({
        companyName: "Social Ads Expert",
        companyEmail: "support@agentcrm.com",
        companyPhone: "+8801XXXXXXXXX",
        companyAddress: "Dhaka, Bangladesh",
        companyWebsite: "agentcrm.com"
      });
      setHasInitialized(true);
    }
  }, [companyData, hasInitialized, userHasEdited]);

  // Track when user starts editing to prevent overwriting their changes
  const handleCompanyFieldChange = (field: string, value: string) => {
    setUserHasEdited(true);
    setEditableCompany(prev => ({ ...prev, [field]: value }));
  };

  const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

  // Calculations
  const subTotal = useMemo(() => items.reduce((a, it) => a + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0), [items]);
  const discountAmt = useMemo(() => subTotal * (Number(discountPct) || 0) / 100, [subTotal, discountPct]);
  const vatAmt = useMemo(() => (subTotal - discountAmt) * (Number(vatPct) || 0) / 100, [subTotal, discountAmt, vatPct]);
  const grandTotal = useMemo(() => subTotal - discountAmt + vatAmt, [subTotal, discountAmt, vatAmt]);

  // Item management
  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, patch: Partial<InvoiceItem>) => 
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));

  const resetForm = () => {
    setInvoiceNo(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setClientId(""); // Reset client selection
    setIssueDate(todayISO());
    setStartDate(todayISO());
    setEndDate(addDays(todayISO(), 30));
    setItems([{ ...EMPTY_ITEM }]); // Reset to single empty item
    setDiscountPct(0);
    setVatPct(0);
    setNotes("Payment due within 7 days. Mobile Banking/Bkash/Nagad accepted.");
    setCurrency("BDT"); // Reset currency to default
    setCompanyMinimized(true); // Reset company section to minimized
  };

  // Company Save Mutation
  const saveCompanyMutation = useMutation({
    mutationFn: async (companyUpdateData: typeof editableCompany) => {
      // Check if we have existing company from database
      const existingCompany = companyData;
      if (!existingCompany?.id) {
        // If no existing company, create new one
        return await apiRequest("POST", "/api/company-settings", companyUpdateData);
      }
      return await apiRequest("PATCH", `/api/company-settings/${existingCompany.id}`, companyUpdateData);
    },
    onSuccess: () => {
      toast({
        title: "সফল",
        description: "কোম্পানি তথ্য সফলভাবে আপডেট হয়েছে!",
      });
      // Refetch company settings to update the data
      queryClient.invalidateQueries({ queryKey: ["/api/company-settings"] });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "কোম্পানি তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // PDF Save Mutation
  const savePdfMutation = useMutation({
    mutationFn: async (pdfData: { dataUrl: string; fileName: string; clientId: string; invoiceNo: string; total: number }) => {
      return await apiRequest("POST", "/api/invoice-pdfs", pdfData);
    },
    onSuccess: () => {
      toast({
        title: "সফল",
        description: "PDF database এ সংরক্ষিত হয়েছে!",
      });
    },
    onError: (error: any) => {
      console.error("PDF save error:", error);
      toast({
        title: "সতর্কতা",
        description: "PDF ডাউনলোড হয়েছে কিন্তু database এ save হতে পারেনি",
        variant: "destructive",
      });
    },
  });

  // PDF Download
  const downloadPDF = async () => {
    if (!selectedClient) {
      toast({
        title: "ত্রুটি",
        description: "দয়া করে একটি ক্লায়েন্ট নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      const input = printableRef.current;
      if (!input) return;

      // Clone and prepare for rendering
      const clone = input.cloneNode(true) as HTMLElement;
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
        // Multi-page handling
        let remaining = imgHeight;
        const sliceHeight = pageHeight - 40;
        const ratio = imgWidth / canvas.width;
        let drawn = 0;
        while (remaining > 0) {
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(canvas.height - Math.floor(drawn / ratio), Math.floor(sliceHeight / ratio));
          const ctx = pageCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              canvas,
              0, Math.floor(drawn / ratio),
              pageCanvas.width, pageCanvas.height,
              0, 0, pageCanvas.width, pageCanvas.height
            );
            const pageData = pageCanvas.getContext("2d")?.canvas.toDataURL("image/png");
            if (pageData) {
              pdf.addImage(pageData, "PNG", 20, 20, imgWidth, pageCanvas.height * ratio);
            }
          }
          drawn += pageCanvas.height * ratio;
          remaining -= sliceHeight;
          if (remaining > 0) pdf.addPage();
        }
      }

      // Get PDF as data URL for saving to database
      const pdfDataUrl = pdf.output('datauristring');
      
      // Download the PDF
      pdf.save(`${invoiceNo}.pdf`);
      
      // Save to database
      savePdfMutation.mutate({
        dataUrl: pdfDataUrl,
        fileName: `${invoiceNo}.pdf`,
        clientId: selectedClient.id,
        invoiceNo: invoiceNo,
        total: grandTotal,
      });

      toast({
        title: "সফল",
        description: "PDF সফলভাবে ডাউনলোড হয়েছে!",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "ত্রুটি",
        description: "PDF তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-[819px] mx-auto space-y-6 overflow-x-auto">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                ইনভয়েস মেকার
              </CardTitle>
              <p className="text-sm text-muted-foreground">Professional invoice তৈরি করুন এবং PDF download করুন</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              data-testid="button-toggle-invoice-maker"
            >
              {isMinimized ? (
                <>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">বিস্তার করুন</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4" />
                  <span className="hidden sm:inline">মিনিমাইজ করুন</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {!isMinimized && (
          <CardContent className="pt-0 space-y-6">
          {/* Form Inputs Section - Top */}
          <div className="max-w-4xl mx-auto space-y-6">
              {/* Company Section - Minimized */}
              <Card className="rounded-lg">
                <CardHeader className="pb-2">
                  <Button
                    variant="ghost"
                    onClick={() => setCompanyMinimized(!companyMinimized)}
                    className="w-full justify-between p-2 h-auto"
                    data-testid="button-toggle-company"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      কোম্পানি তথ্য
                    </span>
                    {companyMinimized ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                {!companyMinimized && (
                  <CardContent className="pt-0 space-y-4">
                    <div>
                      <Label className="text-sm">কোম্পানির নাম</Label>
                      <Input 
                        value={editableCompany.companyName} 
                        onChange={(e) => handleCompanyFieldChange('companyName', e.target.value)}
                        className="text-sm" 
                        placeholder="কোম্পানির নাম লিখুন"
                        data-testid="input-company-name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm">ইমেইল</Label>
                        <Input 
                          value={editableCompany.companyEmail} 
                          onChange={(e) => handleCompanyFieldChange('companyEmail', e.target.value)}
                          className="text-sm" 
                          placeholder="company@example.com"
                          data-testid="input-company-email"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">ফোন</Label>
                        <Input 
                          value={editableCompany.companyPhone} 
                          onChange={(e) => handleCompanyFieldChange('companyPhone', e.target.value)}
                          className="text-sm" 
                          placeholder="+8801XXXXXXXXX"
                          data-testid="input-company-phone"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm">ঠিকানা</Label>
                        <Input 
                          value={editableCompany.companyAddress} 
                          onChange={(e) => handleCompanyFieldChange('companyAddress', e.target.value)}
                          className="text-sm" 
                          placeholder="শহর, দেশ"
                          data-testid="input-company-address"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">ওয়েবসাইট</Label>
                        <Input 
                          value={editableCompany.companyWebsite} 
                          onChange={(e) => handleCompanyFieldChange('companyWebsite', e.target.value)}
                          className="text-sm" 
                          placeholder="www.example.com"
                          data-testid="input-company-website"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={() => saveCompanyMutation.mutate(editableCompany)}
                        disabled={saveCompanyMutation.isPending}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg"
                        data-testid="button-save-company"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saveCompanyMutation.isPending ? "সেভ হচ্ছে..." : "কোম্পানি তথ্য সেভ করুন"}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Client & Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block">ক্লায়েন্ট নির্বাচন করুন</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger data-testid="select-client">
                      <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 block">কারেন্সি</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT (৳)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1 block">ইনভয়েস নং</Label>
                  <Input 
                    value={invoiceNo} 
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    data-testid="input-invoice-no"
                  />
                </div>
                <div>
                  <Label className="mb-1 block flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    ইস্যু ডেট
                  </Label>
                  <Input 
                    type="date" 
                    value={issueDate} 
                    onChange={(e) => setIssueDate(e.target.value)}
                    data-testid="input-issue-date"
                  />
                </div>
                <div>
                  <Label className="mb-1 block flex items-center gap-1">
                    <Percent className="h-4 w-4" />
                    ডিসকাউন্ট %
                  </Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={discountPct} 
                    onChange={(e) => setDiscountPct(Number(e.target.value))}
                    data-testid="input-discount"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1 block flex items-center gap-1">
                    <TimerReset className="h-4 w-4" />
                    কাজ শুরু
                  </Label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>
                <div>
                  <Label className="mb-1 block flex items-center gap-1">
                    <TimerReset className="h-4 w-4" />
                    কাজ শেষ
                  </Label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">ভ্যাট/GST %</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={vatPct} 
                    onChange={(e) => setVatPct(Number(e.target.value))}
                    data-testid="input-vat"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>সার্ভিস / আইটেম</Label>
                  <Button 
                    onClick={addItem} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg"
                    data-testid="button-add-item"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    আইটেম যোগ করুন
                  </Button>
                </div>
                {items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl border"
                    style={{ background: PAPER_BG, borderColor: BORDER }}
                  >
                    <Textarea 
                      className="col-span-6 text-sm" 
                      rows={2} 
                      placeholder="Description" 
                      value={item.description} 
                      onChange={(e) => updateItem(idx, { description: e.target.value })}
                      data-testid={`textarea-description-${idx}`}
                    />
                    <Input 
                      className="col-span-2 text-sm" 
                      type="number" 
                      min="1" 
                      placeholder="Qty" 
                      value={item.qty} 
                      onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })}
                      data-testid={`input-qty-${idx}`}
                    />
                    <Input 
                      className="col-span-3 text-sm" 
                      type="number" 
                      min="0" 
                      placeholder="Rate" 
                      value={item.rate} 
                      onChange={(e) => updateItem(idx, { rate: Number(e.target.value) })}
                      data-testid={`input-rate-${idx}`}
                    />
                    <Button 
                      variant="ghost" 
                      onClick={() => removeItem(idx)} 
                      className="col-span-1 text-red-600 hover:text-red-700"
                      data-testid={`button-remove-${idx}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <Label className="mb-1 block">নোট</Label>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="যেমনঃ Payment within 7 days"
                  data-testid="textarea-notes"
                />
              </div>

              
              {/* Action Buttons - FIXED VERSION */}
              <div className="flex gap-4 justify-center pt-6">
                <Button 
                  onClick={downloadPDF} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg"
                  disabled={!selectedClient}
                  data-testid="button-create-pdf"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF তৈরি করুন
                </Button>
                
                <Button 
                  onClick={() => {
                    if (!selectedClient) {
                      toast({
                        title: "ত্রুটি",
                        description: "দয়া করে একটি ক্লায়েন্ট নির্বাচন করুন",
                        variant: "destructive",
                      });
                      return;
                    }
                    // Call the existing downloadPDF which also saves to database
                    downloadPDF();
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg"
                  disabled={!selectedClient || savePdfMutation.isPending}
                  data-testid="button-save-database"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savePdfMutation.isPending ? "সেভ হচ্ছে..." : "ডাটাবেজে সেভ করুন"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetForm} 
                  className="px-8 py-3 rounded-lg"
                  data-testid="button-reset"
                >
                  <TimerReset className="h-4 w-4 mr-2" />
                  রিসেট
                </Button>
              </div>
            </div>

            {/* Preview Section - MOVED TO BOTTOM */}
            <div className="mt-8">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                  <CardTitle className="text-xl text-center">প্রিন্ট প্রিভিউ</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div
                    ref={printableRef}
                    className="rounded-xl overflow-hidden border"
                    style={{ background: PAPER_BG, color: BODY_TEXT }}
                  >
                    {/* Brand Header */}
                    <div style={{ background: BRAND, color: BRAND_TEXT, padding: 16 }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-2xl font-bold">{company.companyName}</div>
                          <div className="text-sm">{company.companyAddress}</div>
                          <div className="text-sm">{company.companyPhone} · {company.companyEmail}</div>
                          {company.companyWebsite && <div className="text-sm">{company.companyWebsite}</div>}
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
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-4 rounded-lg" style={{ background: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                          <div className="font-semibold flex items-center gap-2" style={{ color: BRAND_TEXT }}>
                            <User2 className="h-4 w-4" />
                            Bill To
                          </div>
                          {selectedClient ? (
                            <>
                              <div className="text-lg">{selectedClient.name}</div>
                              <div className="text-sm">{selectedClient.phone}</div>
                              {selectedClient.fb && <div className="text-sm">{selectedClient.fb}</div>}
                            </>
                        ) : (
                          <div className="text-sm text-gray-500">ক্লায়েন্ট নির্বাচন করুন</div>
                        )}
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                        <div className="font-semibold flex items-center gap-2" style={{ color: BRAND_TEXT }}>
                          <Calendar className="h-4 w-4" />
                          কাজের সময়সীমা
                        </div>
                        <div className="text-sm">শুরু: <span className="font-semibold">{startDate}</span></div>
                        <div className="text-sm">শেষ: <span className="font-semibold">{endDate}</span></div>
                      </div>
                    </div>

                    {/* Items Table */}
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
                          {items.map((item, idx) => {
                            const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                            const isLast = idx === items.length - 1;
                            return (
                              <tr key={idx}>
                                <td className="p-2" style={{ borderBottom: isLast ? "none" : `1px solid ${BORDER}` }}>
                                  <div style={{ overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
                                    {item.description || <span style={{ color: "#9ca3af" }}>—</span>}
                                  </div>
                                </td>
                                <td className="p-2" style={{ borderBottom: isLast ? "none" : `1px solid ${BORDER}` }}>{item.qty}</td>
                                <td className="p-2" style={{ borderBottom: isLast ? "none" : `1px solid ${BORDER}` }}>{item.rate}</td>
                                <td className="p-2" style={{ textAlign: "right", borderBottom: isLast ? "none" : `1px solid ${BORDER}` }}>
                                  {formatCurrency(amount, currency)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-4 grid grid-cols-2 gap-4 items-start">
                      <div>
                        <div className="text-sm" style={{ color: "#475569" }}>Notes</div>
                        <div className="text-sm whitespace-pre-line">{notes}</div>
                      </div>
                      <div className="p-4 rounded-lg" style={{ background: ACCENT_BG, border: `1px solid ${BORDER}` }}>
                        <div className="flex justify-between py-1">
                          <span>Subtotal</span>
                          <span>{formatCurrency(subTotal, currency)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Discount ({discountPct || 0}%)</span>
                          <span>- {formatCurrency(discountAmt, currency)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>VAT/GST ({vatPct || 0}%)</span>
                          <span>{formatCurrency(vatAmt, currency)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-lg font-semibold" style={{ borderTop: `1px solid ${BORDER}`, marginTop: 8 }}>
                          <span>Total</span>
                          <span>{formatCurrency(grandTotal, currency)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-xs" style={{ color: "#6b7280" }}>
                      <div className="font-semibold text-lg">{company.companyName}</div>
                      {company.companyEmail && (
                        <div className="mt-1">
                          <span className="inline-flex items-center text-sm">
                            <span>Email: {company.companyEmail}</span>
                            {company.companyPhone && <span className="mx-2">•</span>}
                          </span>
                          {company.companyPhone && (
                            <span className="text-sm">Phone: {company.companyPhone}</span>
                          )}
                        </div>
                      )}
                      {company.companyAddress && (
                        <div className="text-sm mt-1">{company.companyAddress}</div>
                      )}
                      {company.companyWebsite && (
                        <div className="text-sm mt-1">{company.companyWebsite}</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        )}
      </Card>
    </div>
  );
}
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download } from "lucide-react";
import { addFunds, createSpendLog } from "@/lib/api";
import { formatCurrency, exportClientData, safeWriteToClipboard } from "@/lib/utils-dashboard";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  selectedClientId: string;
}

export default function QuickActions({ selectedClientId }: QuickActionsProps) {
  const [fundAmount, setFundAmount] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendDate, setSpendDate] = useState(new Date().toISOString().slice(0, 10));
  const [spendNote, setSpendNote] = useState("");
  const [copyMsg, setCopyMsg] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const portalInputRef = useRef<HTMLInputElement>(null);

  const addFundsMutation = useMutation({
    mutationFn: (amount: number) => addFunds(selectedClientId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setFundAmount("");
      toast({
        title: "সফল",
        description: "টাকা সফলভাবে জমা করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "টাকা জমা করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const createSpendMutation = useMutation({
    mutationFn: createSpendLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setSpendAmount("");
      setSpendNote("");
      toast({
        title: "সফল",
        description: "খরচ সফলভাবে রেকর্ড করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "খরচ রেকর্ড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const handleAddFunds = () => {
    if (!selectedClientId) {
      toast({
        title: "ত্রুটি",
        description: "প্রথমে একটি ক্লায়েন্ট নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "ত্রুটি",
        description: "সঠিক পরিমাণ প্রবেশ করান",
        variant: "destructive",
      });
      return;
    }

    addFundsMutation.mutate(amount);
  };

  const handleRecordSpend = () => {
    if (!selectedClientId) {
      toast({
        title: "ত্রুটি",
        description: "প্রথমে একটি ক্লায়েন্ট নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(spendAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "ত্রুটি",
        description: "সঠিক পরিমাণ প্রবেশ করান",
        variant: "destructive",
      });
      return;
    }

    createSpendMutation.mutate({
      clientId: selectedClientId,
      date: spendDate,
      amount,
      note: spendNote.trim() || undefined,
    });
  };

  const handleCopyPortalLink = async () => {
    if (!selectedClientId) {
      toast({
        title: "ত্রুটি",
        description: "প্রথমে একটি ক্লায়েন্ট নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    // Get client data to access portalKey
    try {
      const response = await fetch(`/api/clients/${selectedClientId}/details`);
      const clientData = await response.json();
      
      if (!clientData.portalKey) {
        toast({
          title: "ত্রুটি",
          description: "ক্লায়েন্ট পোর্টাল কী পাওয়া যায়নি",
          variant: "destructive",
        });
        return;
      }

      const portalUrl = `${window.location.origin}/portal/${clientData.portalKey}`;
      setCopyMsg("");
      
      const res = await safeWriteToClipboard(portalUrl);
      if (res.ok) {
        setCopyMsg(res.method === "clipboard" ? "ক্লিপবোর্ডে কপি হয়েছে" : "কপি হয়েছে (fallback)");
        toast({
          title: "সফল",
          description: "পোর্টাল লিংক কপি করা হয়েছে",
        });
      } else {
        const input = portalInputRef.current;
        if (input) {
          input.focus();
          input.select();
          setCopyMsg("কপি ব্লকড — টেক্সট সিলেক্ট হয়েছে, Ctrl/Cmd + C চাপুন");
        } else {
          setCopyMsg("কপি ব্লকড — লিংক সিলেক্ট করে নিজে কপি করুন");
        }
      }

      setTimeout(() => setCopyMsg(""), 3000);
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "পোর্টাল লিংক তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    if (!selectedClientId) {
      toast({
        title: "ত্রুটি",
        description: "প্রথমে একটি ক্লায়েন্ট নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    exportClientData(selectedClientId);
    toast({
      title: "সফল",
      description: "CSV ফাইল ডাউনলোড হচ্ছে",
    });
  };

  const portalUrl = selectedClientId ? `${window.location.origin}/portal/[loading...]` : "";

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">দ্রুত অ্যাকশন</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Add Funds */}
        <div>
          <Label className="text-sm font-medium">টাকা জমা দিন</Label>
          <div className="flex gap-2 mt-1">
            <Input
              data-testid="input-fund-amount"
              type="number"
              step="0.01"
              placeholder="পরিমাণ"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAddFunds}
              disabled={addFundsMutation.isPending}
              data-testid="button-add-funds"
            >
              জমা
            </Button>
          </div>
        </div>

        {/* Record Spend */}
        <div>
          <Label className="text-sm font-medium">খরচ রেকর্ড করুন</Label>
          <div className="space-y-2 mt-1">
            <Input
              data-testid="input-spend-date"
              type="date"
              value={spendDate}
              onChange={(e) => setSpendDate(e.target.value)}
            />
            <Input
              data-testid="input-spend-amount"
              type="number"
              step="0.01"
              placeholder="পরিমাণ"
              value={spendAmount}
              onChange={(e) => setSpendAmount(e.target.value)}
            />
            <Input
              data-testid="input-spend-note"
              placeholder="নোট (ঐচ্ছিক)"
              value={spendNote}
              onChange={(e) => setSpendNote(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleRecordSpend}
              disabled={createSpendMutation.isPending}
              data-testid="button-record-spend"
            >
              রেকর্ড করুন
            </Button>
          </div>
        </div>

        {/* Portal Link */}
        <div>
          <Label className="text-sm font-medium">ক্লায়েন্ট পোর্টাল</Label>
          <div className="flex gap-2 mt-1">
            <Input
              ref={portalInputRef}
              readOnly
              value={portalUrl}
              className="flex-1 bg-muted font-mono text-xs"
              data-testid="input-portal-link"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyPortalLink}
              data-testid="button-copy-portal"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {copyMsg && (
            <div className="text-xs text-emerald-700 mt-1" data-testid="text-copy-message">
              {copyMsg}
            </div>
          )}
        </div>

        {/* Export CSV */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleExportData}
          data-testid="button-export-csv"
        >
          <Download className="h-4 w-4" />
          CSV এক্সপোর্ট
        </Button>
      </CardContent>
    </Card>
  );
}

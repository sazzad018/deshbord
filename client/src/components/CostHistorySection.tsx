import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt } from "lucide-react";
import type { ClientWithDetails, CompanySettings } from "@shared/schema";
import { createDualCurrencyDisplay, DEFAULT_USD_RATE } from "@shared/currency-utils";

interface CostHistorySectionProps {
  selectedClientId: string;
}

export default function CostHistorySection({ selectedClientId }: CostHistorySectionProps) {
  const { data: clientDetails } = useQuery<ClientWithDetails>({
    queryKey: ["/api/clients", selectedClientId, "details"],
    enabled: !!selectedClientId,
  });

  // Fetch company settings for USD exchange rate
  const { data: companySettings } = useQuery<CompanySettings>({ 
    queryKey: ['/api/company-settings'] 
  });

  const exchangeRate = companySettings?.usdExchangeRate || DEFAULT_USD_RATE;
  const currentBalance = clientDetails ? (clientDetails.walletDeposited - clientDetails.walletSpent) : 0;
  const balanceDisplay = clientDetails ? createDualCurrencyDisplay(currentBalance * 100, exchangeRate) : null;

  if (!selectedClientId || !clientDetails) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            খরচের ইতিহাস
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            একটি ক্লায়েন্ট নির্বাচন করুন খরচের ইতিহাস দেখতে
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          খরচের ইতিহাস - {clientDetails.name}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          <p>বর্তমান ব্যালেন্স: ৳{currentBalance.toLocaleString()}</p>
          {balanceDisplay && (
            <p className="text-xs text-slate-500 mt-0.5">USD: {balanceDisplay.usd}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {clientDetails.logs && clientDetails.logs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>খরচ (৳/USD)</TableHead>
                <TableHead>নোট</TableHead>
                <TableHead className="text-right">ব্যালেন্স (এর পর)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientDetails.logs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">৳{log.amount.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">
                        ${createDualCurrencyDisplay(log.amount * 100, exchangeRate).usdRaw.toFixed(2)} USD
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{log.note || "—"}</TableCell>
                  <TableCell className={`text-right font-medium ${log.balanceAfter < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <div>
                      <div>৳{log.balanceAfter.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 font-normal">
                        ${createDualCurrencyDisplay(log.balanceAfter * 100, exchangeRate).usdRaw.toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            কোনো খরচের রেকর্ড নেই
          </div>
        )}
      </CardContent>
    </Card>
  );
}
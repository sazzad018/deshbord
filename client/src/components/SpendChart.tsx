import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { SpendLog, CompanySettings } from "@shared/schema";
import { createDualCurrencyDisplay, DEFAULT_USD_RATE } from "@shared/currency-utils";

export default function SpendChart() {
  const [selectedCurrency, setSelectedCurrency] = useState<'BDT' | 'USD'>('BDT');
  
  const { data: allSpendLogs = [] } = useQuery<SpendLog[]>({
    queryKey: ["/api/spend-logs/all"],
  });

  // Fetch company settings for USD exchange rate
  const { data: companySettings } = useQuery<CompanySettings>({ 
    queryKey: ['/api/company-settings'] 
  });

  const exchangeRate = companySettings?.usdExchangeRate || DEFAULT_USD_RATE;

  // Generate last 7 days data from real spend logs
  const generateLast7DaysData = () => {
    const today = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Get spending for this date
      const daySpendingBDT = allSpendLogs
        .filter(log => {
          const logDate = new Date(log.date).toISOString().split('T')[0];
          return logDate === dateString;
        })
        .reduce((total, log) => total + log.amount, 0);
      
      // Convert to selected currency
      const daySpending = selectedCurrency === 'USD' 
        ? createDualCurrencyDisplay(daySpendingBDT * 100, exchangeRate).usdRaw
        : daySpendingBDT;
      
      const dayNames = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];
      
      last7Days.push({
        day: dayNames[date.getDay()],
        spend: daySpending,
        spendBDT: daySpendingBDT, // Keep original BDT for tooltip
        fullDate: date.toLocaleDateString()
      });
    }
    
    return last7Days;
  };

  const spend7d = generateLast7DaysData();
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">৭ দিনের খরচ বিশ্লেষণ</CardTitle>
        <div className="flex items-center gap-3">
          <Select value={selectedCurrency} onValueChange={(value: 'BDT' | 'USD') => setSelectedCurrency(value)}>
            <SelectTrigger className="w-20 h-8 rounded-xl border-blue-200 bg-blue-50/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BDT">৳ BDT</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="rounded-2xl">All Clients</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          গত সপ্তাহের দৈনিক খরচের ট্রেন্ড ({selectedCurrency === 'USD' ? 'ডলারে' : 'টাকায়'})
        </p>
        
        <div className="h-64" data-testid="chart-spend-analytics">
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
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => {
                  if (selectedCurrency === 'USD') {
                    return `$${value < 1000 ? value.toFixed(0) : (value / 1000).toFixed(1) + 'k'}`;
                  }
                  return `৳${(value / 1000)}k`;
                }}
              />
              <Tooltip 
                formatter={(value: number, name: any, props: any) => {
                  const spendBDT = props.payload?.spendBDT || 0;
                  const usdValue = createDualCurrencyDisplay(spendBDT * 100, exchangeRate).usdRaw;
                  
                  if (selectedCurrency === 'USD') {
                    return [
                      <div key="tooltip">
                        <div className="font-semibold">${value.toFixed(2)} USD</div>
                        <div className="text-xs text-gray-500">৳{spendBDT.toLocaleString()} BDT</div>
                      </div>, 
                      "দৈনিক খরচ"
                    ];
                  } else {
                    return [
                      <div key="tooltip">
                        <div className="font-semibold">৳{value.toLocaleString()} BDT</div>
                        <div className="text-xs text-gray-500">${usdValue.toFixed(2)} USD</div>
                      </div>, 
                      "দৈনিক খরচ"
                    ];
                  }
                }}
                labelStyle={{ color: "#64748b" }}
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="spend" 
                stroke="#0ea5e9" 
                fill="url(#spend)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

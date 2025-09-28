import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { SpendLog, CompanySettings } from "@shared/schema";
import { createDualCurrencyDisplay, DEFAULT_USD_RATE } from "@shared/currency-utils";

export default function SpendChart() {
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
      const daySpending = allSpendLogs
        .filter(log => {
          const logDate = new Date(log.date).toISOString().split('T')[0];
          return logDate === dateString;
        })
        .reduce((total, log) => total + log.amount, 0);
      
      const dayNames = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];
      
      last7Days.push({
        day: dayNames[date.getDay()],
        spend: daySpending,
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
        <Badge variant="secondary" className="rounded-2xl">All Clients</Badge>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">গত সপ্তাহের দৈনিক খরচের ট্রেন্ড</p>
        
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
                tickFormatter={(value) => `৳${(value / 1000)}k`}
              />
              <Tooltip 
                formatter={(value: number) => {
                  const usdValue = createDualCurrencyDisplay(value * 100, exchangeRate).usdRaw.toFixed(2);
                  return [
                    <div key="tooltip">
                      <div>৳{value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">${usdValue} USD</div>
                    </div>, 
                    "দৈনিক খরচ"
                  ];
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

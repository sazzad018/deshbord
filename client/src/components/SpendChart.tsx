import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const spend7d = [
  { day: "সোম", spend: 18000 },
  { day: "মঙ্গল", spend: 21000 },
  { day: "বুধ", spend: 16500 },
  { day: "বৃহস্পতি", spend: 25000 },
  { day: "শুক্র", spend: 32000 },
  { day: "শনি", spend: 14000 },
  { day: "রবি", spend: 29000 },
];

export default function SpendChart() {
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
                formatter={(value: number) => [`৳${value.toLocaleString()}`, "দৈনিক খরচ"]}
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

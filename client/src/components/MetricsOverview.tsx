import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Wallet, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import type { DashboardMetrics } from "@shared/schema";

export default function MetricsOverview() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const getCardColors = (index: number) => {
    const cardStyles = [
      {
        gradient: "from-emerald-400 to-emerald-500",
        bgColor: "bg-emerald-50/70",
        borderColor: "border-emerald-200/60",
        textColor: "text-emerald-700",
        valueColor: "text-emerald-800"
      },
      {
        gradient: "from-rose-400 to-rose-500",
        bgColor: "bg-rose-50/70",
        borderColor: "border-rose-200/60",
        textColor: "text-rose-700",
        valueColor: "text-rose-800"
      },
      {
        gradient: "from-blue-400 to-blue-500",
        bgColor: "bg-blue-50/70",
        borderColor: "border-blue-200/60",
        textColor: "text-blue-700",
        valueColor: "text-blue-800"
      },
      {
        gradient: "from-violet-400 to-violet-500",
        bgColor: "bg-violet-50/70",
        borderColor: "border-violet-200/60",
        textColor: "text-violet-700",
        valueColor: "text-violet-800"
      }
    ];
    return cardStyles[index] || cardStyles[0];
  };

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => {
          const cardColors = getCardColors(i);
          return (
            <Card key={i} className={`rounded-3xl shadow-lg border-2 ${cardColors.borderColor} ${cardColors.bgColor}`}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl"></div>
                    <div className="h-4 bg-slate-300/70 rounded-lg w-1/2"></div>
                  </div>
                  <div className="h-8 bg-slate-300/70 rounded-lg w-3/4"></div>
                  <div className="h-6 bg-slate-200/70 rounded-xl w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    );
  }

  const metricCards = [
    {
      title: "মোট জমা",
      value: formatCurrency(metrics?.totalDeposited || 0),
      icon: Wallet,
      subtitle: `Active: ${metrics?.activeClients || 0}`,
    },
    {
      title: "মোট খরচ",
      value: formatCurrency(metrics?.totalSpent || 0),
      icon: DollarSign,
      subtitle: "গত ৭ দিন (চার্ট)",
    },
    {
      title: "বর্তমান ব্যালেন্স",
      value: formatCurrency(metrics?.balance || 0),
      icon: TrendingUp,
      subtitle: "Deposited − Spent",
    },
    {
      title: "সক্রিয় ক্লায়েন্ট",
      value: metrics?.activeClients?.toString() || "0",
      icon: Users,
      subtitle: `Total: ${metrics?.activeClients || 0}`,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => {
        const IconComponent = metric.icon;
        const cardColors = getCardColors(index);
        return (
          <Card 
            key={index} 
            className={`rounded-3xl shadow-lg border-2 ${cardColors.borderColor} ${cardColors.bgColor} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl backdrop-blur-sm`} 
            data-testid={`card-metric-${index}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${cardColors.gradient} shadow-md ring-2 ring-white/20`}>
                  <IconComponent className={`h-5 w-5 text-white drop-shadow-sm`} />
                </div>
                <span className={`${cardColors.textColor} font-semibold`}>{metric.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className={`text-3xl font-bold ${cardColors.valueColor} tracking-tight`} data-testid={`text-metric-value-${index}`}>
                {metric.value}
              </div>
              <p className={`text-xs font-medium mt-2 ${cardColors.bgColor} ${cardColors.textColor}/70 px-3 py-2 rounded-xl inline-block border ${cardColors.borderColor}`} data-testid={`text-metric-subtitle-${index}`}>
                {metric.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

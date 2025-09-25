import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Wallet, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import type { DashboardMetrics } from "@shared/schema";

export default function MetricsOverview() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const getIconGradient = (index: number): string => {
    const gradients = [
      "from-emerald-500 to-emerald-600", // Green for deposit
      "from-red-500 to-red-600",        // Red for spent  
      "from-blue-500 to-blue-600",      // Blue for balance
      "from-purple-500 to-purple-600"   // Purple for clients
    ];
    return gradients[index] || "from-gray-500 to-gray-600";
  };

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  const metricCards = [
    {
      title: "মোট জমা",
      value: formatCurrency(metrics?.totalDeposited || 0),
      icon: Wallet,
      color: "text-green-600",
      subtitle: `Active: ${metrics?.activeClients || 0}`,
    },
    {
      title: "মোট খরচ",
      value: formatCurrency(metrics?.totalSpent || 0),
      icon: DollarSign,
      color: "text-red-600",
      subtitle: "গত ৭ দিন (চার্ট)",
    },
    {
      title: "বর্তমান ব্যালেন্স",
      value: formatCurrency(metrics?.balance || 0),
      icon: TrendingUp,
      color: "text-blue-600",
      subtitle: "Deposited − Spent",
    },
    {
      title: "সক্রিয় ক্লায়েন্ট",
      value: metrics?.activeClients?.toString() || "0",
      icon: Users,
      color: "text-purple-600",
      subtitle: `Total: ${metrics?.activeClients || 0}`,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <Card key={index} className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" data-testid={`card-metric-${index}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${getIconGradient(index)} shadow-sm`}>
                  <IconComponent className={`h-4 w-4 text-white`} />
                </div>
                <span className="text-slate-700">{metric.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-slate-800" data-testid={`text-metric-value-${index}`}>
                {metric.value}
              </div>
              <p className="text-xs text-slate-500 mt-1 bg-slate-50 px-2 py-1 rounded-lg inline-block" data-testid={`text-metric-subtitle-${index}`}>
                {metric.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

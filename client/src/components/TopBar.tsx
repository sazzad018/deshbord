import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Download, Bot, FileText, CheckSquare, MessageCircle, BarChart3, CreditCard, Menu } from "lucide-react";
import { exportAllData } from "@/lib/utils-dashboard";
import { Link, useLocation } from "wouter";

interface TopBarProps {
  query: string;
  setQuery: (query: string) => void;
  onToggleSidebar: () => void;
}

export default function TopBar({ query, setQuery, onToggleSidebar }: TopBarProps) {
  const [location] = useLocation();
  
  const handleRefresh = () => {
    window.location.reload();
  };

  const navItems = [
    { path: "/dashboard", label: "ড্যাশবোর্ড", icon: BarChart3 },
    { path: "/website-projects", label: "প্রজেক্ট", icon: FileText },
    { path: "/payment-management", label: "পেমেন্ট", icon: CreditCard },
    { path: "/todo-list", label: "টু-ডু", icon: CheckSquare },
    { path: "/whatsapp-messaging", label: "হোয়াটসঅ্যাপ", icon: MessageCircle },
  ];

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-50/80 via-white/95 to-violet-50/80 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-blue-200/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 hover:text-blue-700 rounded-xl"
              data-testid="button-toggle-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-blue-600 shadow-xl ring-2 ring-white/20">
                  <Bot className="h-5 w-5 text-white drop-shadow-sm" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700 bg-clip-text text-transparent">Social Ads Expert</h1>
              </div>
              <Badge variant="secondary" className="rounded-2xl bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300/60 shadow-sm font-semibold">MVP</Badge>
              <Badge className="rounded-2xl bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300/60 shadow-sm font-semibold">Asia/Dhaka</Badge>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`flex items-center gap-2 transition-all duration-300 rounded-xl ${
                        isActive 
                          ? "bg-gradient-to-r from-blue-500 via-violet-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:via-violet-600 hover:to-blue-700 ring-2 ring-white/20" 
                          : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 hover:text-blue-700 hover:shadow-md border border-transparent hover:border-blue-200/50"
                      }`}
                      data-testid={`nav-${item.path.replace("/", "")}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                data-testid="input-global-search"
                type="text"
                placeholder="খুঁজুন: ক্লায়েন্ট/প্রোফাইল/স্কোপ"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-gradient-to-r from-blue-50/50 to-violet-50/50 border-blue-200/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl"
              />
            </div>
            
            <Button 
              data-testid="button-refresh"
              variant="outline" 
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 shadow-sm rounded-xl" 
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              রিফ্রেশ
            </Button>
            
            <Button 
              data-testid="button-export"
              className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-lg hover:shadow-xl rounded-xl ring-2 ring-white/20" 
              onClick={exportAllData}
            >
              <Download className="h-4 w-4" />
              এক্সপোর্ট
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Download, Bot, FileText, CheckSquare, MessageCircle, BarChart3 } from "lucide-react";
import { exportAllData } from "@/lib/utils-dashboard";
import { Link, useLocation } from "wouter";

interface TopBarProps {
  query: string;
  setQuery: (query: string) => void;
}

export default function TopBar({ query, setQuery }: TopBarProps) {
  const [location] = useLocation();
  
  const handleRefresh = () => {
    window.location.reload();
  };

  const navItems = [
    { path: "/dashboard", label: "ড্যাশবোর্ড", icon: BarChart3 },
    { path: "/todo-list", label: "টু-ডু", icon: CheckSquare },
    { path: "/whatsapp-messaging", label: "হোয়াটসঅ্যাপ", icon: MessageCircle },
  ];

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-white via-blue-50/30 to-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-blue-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Social Ads Expert</h1>
              </div>
              <Badge variant="secondary" className="rounded-2xl bg-blue-100 text-blue-700 border-blue-200">MVP</Badge>
              <Badge className="rounded-2xl bg-emerald-100 text-emerald-700 border-emerald-200">Asia/Dhaka</Badge>
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
                      className={`flex items-center gap-2 transition-all duration-200 ${
                        isActive 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700" 
                          : "hover:bg-blue-50 hover:text-blue-700"
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
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="input-global-search"
                type="text"
                placeholder="খুঁজুন: ক্লায়েন্ট/প্রোফাইল/স্কোপ"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              data-testid="button-refresh"
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              রিফ্রেশ
            </Button>
            
            <Button 
              data-testid="button-export"
              className="flex items-center gap-2" 
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

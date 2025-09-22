import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Download, Bot } from "lucide-react";
import { exportAllData } from "@/lib/utils-dashboard";

interface TopBarProps {
  query: string;
  setQuery: (query: string) => void;
}

export default function TopBar({ query, setQuery }: TopBarProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Agent CRM + Ops</h1>
            </div>
            <Badge variant="secondary" className="rounded-2xl">MVP</Badge>
            <Badge className="rounded-2xl bg-green-100 text-green-800">Asia/Dhaka</Badge>
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

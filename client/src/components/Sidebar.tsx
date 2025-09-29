import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  FileText, 
  CheckSquare, 
  MessageCircle, 
  CreditCard, 
  BarChart3,
  Settings,
  Bot,
  Briefcase,
  Calendar,
  DollarSign,
  UserPlus,
  Building2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();

  const mainNavItems = [
    { path: "/dashboard", label: "ড্যাশবোর্ড", icon: Home, description: "মূল ড্যাশবোর্ড" },
    { path: "/project-management", label: "CRM + Project Management", icon: Briefcase, description: "সম্পূর্ণ প্রজেক্ট ম্যানেজমেন্ট সিস্টেম" },
  ];

  const projectNavItems = [
    { path: "/website-projects", label: "ওয়েবসাইট প্রজেক্ট", icon: FileText, description: "ওয়েবসাইট প্রজেক্ট সমূহ" },
    { path: "/payment-management", label: "পেমেন্ট ম্যানেজমেন্ট", icon: CreditCard, description: "পেমেন্ট ও বিলিং" },
  ];

  const toolsNavItems = [
    { path: "/todo-list", label: "টু-ডু লিস্ট", icon: CheckSquare, description: "কাজের তালিকা" },
    { path: "/whatsapp-messaging", label: "হোয়াটসঅ্যাপ মেসেজিং", icon: MessageCircle, description: "গ্রাহক যোগাযোগ" },
    { path: "/employee-portal", label: "কর্মচারী পোর্টাল", icon: UserPlus, description: "কর্মচারী ম্যানেজমেন্ট" },
    { path: "/clients", label: "ক্লায়েন্ট ম্যানেজমেন্ট", icon: Users, description: "ক্লায়েন্ট তথ্য ব্যবস্থাপনা" },
    { path: "/invoice-maker", label: "ইনভয়েস মেকার", icon: FileText, description: "বিল ও ইনভয়েস তৈরি" },
  ];

  const quickActions = [
    { path: "/clients", label: "নতুন ক্লায়েন্ট", icon: Users, description: "ক্লায়েন্ট যোগ করুন" },
    { path: "/meetings", label: "মিটিং শিডিউল", icon: Calendar, description: "মিটিং সেট করুন" },
    { path: "/reports", label: "রিপোর্ট", icon: BarChart3, description: "ডেটা রিপোর্ট" },
  ];

  const isActive = (path: string) => {
    return location === path || (location === "/" && path === "/dashboard");
  };

  const renderNavSection = (title: string, items: any[]) => (
    <div className="space-y-2">
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto p-3 text-left",
                  active 
                    ? "bg-gradient-to-r from-blue-500 via-violet-500 to-blue-600 text-white shadow-lg" 
                    : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 hover:text-blue-700"
                )}
                onClick={() => onToggle()}
                data-testid={`sidebar-nav-${item.path.replace("/", "")}`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.label}</div>
                  {item.description && (
                    <div className={cn(
                      "text-xs opacity-75 truncate",
                      active ? "text-white/80" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  )}
                </div>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-screen w-80 bg-white border-r border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-blue-600 shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700 bg-clip-text text-transparent">
                  Social Ads Expert
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">MVP</Badge>
                  <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">Asia/Dhaka</Badge>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggle}
              className="p-2"
              data-testid="button-close-sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
          {renderNavSection("প্রধান মেনু", mainNavItems)}
          <Separator />
          {renderNavSection("প্রজেক্ট ম্যানেজমেন্ট", projectNavItems)}
          <Separator />
          {renderNavSection("টুলস ও ইউটিলিটি", toolsNavItems)}
          <Separator />
          {renderNavSection("দ্রুত অ্যাকশন", quickActions)}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700 font-medium">আজকের সংক্ষিপ্ত তথ্য</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded-lg p-2">
                <div className="text-gray-500">সক্রিয় প্রজেক্ট</div>
                <div className="font-bold text-blue-600">৫টি</div>
              </div>
              <div className="bg-white rounded-lg p-2">
                <div className="text-gray-500">মোট আয়</div>
                <div className="font-bold text-emerald-600">৳১,৯৮,৫০০</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
import { useState } from "react";
import TopBar from "@/components/TopBar";
import MetricsOverview from "@/components/MetricsOverview";
import ClientManagement from "@/components/ClientManagement";
import MeetingScheduler from "@/components/MeetingScheduler";
import AIQuerySystem from "@/components/AIQuerySystem";
import SpendChart from "@/components/SpendChart";
import ClientDetailsPanel from "@/components/ClientDetailsPanel";
import WebsiteServicesSection from "@/components/WebsiteServicesSection";
import QuickActions from "@/components/QuickActions";
import ControlPanel from "@/components/ControlPanel";
import InvoiceMaker from "@/components/InvoiceMaker";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <TopBar query={query} setQuery={setQuery} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MetricsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <ClientManagement
              query={query}
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
            />
            <AIQuerySystem />
            <SpendChart />
            <WebsiteServicesSection selectedClientId={selectedClientId} />
          </div>
          
          <div className="space-y-6">
            <ClientDetailsPanel
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
            />
            <QuickActions selectedClientId={selectedClientId} />
            <MeetingScheduler selectedClientId={selectedClientId} />
            <ControlPanel />
          </div>
        </div>
        
        {/* Invoice Maker - Where Control Panel used to be */}
        <InvoiceMaker />
      </div>
    </div>
  );
}

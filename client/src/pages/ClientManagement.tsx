import { useState } from "react";
import ClientManagement from "@/components/ClientManagement";

export default function ClientManagementPage() {
  const [selectedClientId, setSelectedClientId] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-8">ক্লায়েন্ট ম্যানেজমেন্ট</h1>
        <ClientManagement
          query=""
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
        />
      </div>
    </div>
  );
}
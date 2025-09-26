import { useState } from "react";
import { WebsiteProjectsManagement } from "@/components/WebsiteProjectsManagement";
import TopBar from "@/components/TopBar";

export default function WebsiteProjectsPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <TopBar query={query} setQuery={setQuery} />
      <div className="container mx-auto px-4 py-8">
        <WebsiteProjectsManagement />
      </div>
    </div>
  );
}
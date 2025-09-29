import { useState } from "react";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import RunningProjectsPanel from "@/components/RunningProjectsPanel";
import AdminProjectManagement from "@/components/AdminProjectManagement";
import ProjectListPanel from "@/components/ProjectListPanel";
import SalaryManagementPanel from "@/components/SalaryManagementPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, Clock } from "lucide-react";

export default function ProjectManagement() {
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <TopBar 
        query={query} 
        setQuery={setQuery} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            CRM + প্রোজেক্ট ম্যানেজমেন্ট সিস্টেম
          </h1>
          <p className="text-lg text-slate-600">
            ক্লায়েন্ট ম্যানেজমেন্ট, প্রোজেক্ট ট্র্যাকিং এবং টিম ম্যানেজমেন্ট সিস্টেম
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Running Projects Section */}
            <Card className="border-2 border-emerald-200 bg-emerald-50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  চলমান প্রোজেক্টসমূহ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RunningProjectsPanel />
              </CardContent>
            </Card>

            {/* Admin Project Management Section */}
            <Card className="border-2 border-blue-200 bg-blue-50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  অ্যাডমিন প্রোজেক্ট ম্যানেজমেন্ট
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminProjectManagement />
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Project List Section */}
            <Card className="border-2 border-purple-200 bg-purple-50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-purple-800 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  প্রোজেক্ট তালিকা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectListPanel />
              </CardContent>
            </Card>

            {/* Salary Management Section */}
            <Card className="border-2 border-orange-200 bg-orange-50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-orange-800 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  স্যালারি ম্যানেজমেন্ট
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SalaryManagementPanel />
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
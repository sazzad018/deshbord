import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User, DollarSign, CheckSquare } from "lucide-react";
import { Link } from "wouter";
import type { Project, Client, ProjectAssignment } from "@shared/schema";

interface ProjectWithDetails extends Project {
  client?: Client;
  assignments?: ProjectAssignment[];
  remainingTasks?: number;
}

const statusConfig = {
  planning: { text: "পরিকল্পনা", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  in_progress: { text: "চলমান", color: "bg-blue-100 text-blue-700 border-blue-300" },
  completed: { text: "সম্পন্ন", color: "bg-green-100 text-green-700 border-green-300" },
  cancelled: { text: "বাতিল", color: "bg-red-100 text-red-700 border-red-300" },
};

export default function RecentProjectsSummary() {
  // Fetch data
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: assignments = [] } = useQuery<ProjectAssignment[]>({
    queryKey: ["/api/project-assignments"],
  });

  // Create projects with additional details and get only last 7
  const recentProjects: ProjectWithDetails[] = projects
    .map(project => {
      const client = clients.find(c => c.id === project.clientId);
      const projectAssignments = assignments.filter(a => a.projectId === project.id);
      
      // Calculate remaining tasks (for demo: based on progress)
      const totalTasks = 10; // Assuming 10 tasks per project for demo
      const remainingTasks = Math.max(0, Math.floor(totalTasks * (100 - project.progress) / 100));
      
      return {
        ...project,
        client,
        assignments: projectAssignments,
        remainingTasks,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 7); // Get only last 7 projects

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            সাম্প্রতিক প্রজেক্টসমূহ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border-blue-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            সাম্প্রতিক প্রজেক্টসমূহ
            <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              {recentProjects.length}টি
            </Badge>
          </CardTitle>
          <Link href="/project-management">
            <Button size="sm" variant="outline" className="hover:bg-blue-50">
              সবগুলো দেখুন
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recentProjects.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <CheckSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm">কোন প্রজেক্ট নেই</p>
            <p className="text-xs text-slate-400 mt-1">নতুন প্রজেক্ট শুরু করুন</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project) => {
              const status = statusConfig[project.status as keyof typeof statusConfig];
              
              return (
                <div
                  key={project.id}
                  className="bg-gradient-to-r from-white to-blue-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                  data-testid={`project-summary-${project.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{project.client?.name || "ক্লায়েন্ট নেই"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{project.endDate ? new Date(project.endDate).toLocaleDateString('bn-BD') : "তারিখ নেই"}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={status.color}>{status.text}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-2 border">
                      <div className="flex items-center gap-1 text-gray-500 mb-1">
                        <DollarSign className="h-3 w-3" />
                        <span>বকেয়া</span>
                      </div>
                      <div className="font-semibold text-orange-600">
                        ৳{project.dueAmount.toLocaleString('bn-BD')}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-2 border">
                      <div className="flex items-center gap-1 text-gray-500 mb-1">
                        <CheckSquare className="h-3 w-3" />
                        <span>বাকি কাজ</span>
                      </div>
                      <div className="font-semibold text-blue-600">
                        {project.remainingTasks || 0}টি
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-2 border">
                      <div className="text-gray-500 text-xs mb-1">অগ্রগতি</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{project.progress}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, Users, Globe, Clock, CheckCircle, AlertTriangle, Eye, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import type { ProjectWithDetails, Employee } from "@shared/schema";

const STATUS_CONFIG = {
  "pending": { 
    icon: Clock, 
    color: "bg-yellow-500", 
    text: "অপেক্ষমান",
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-700"
  },
  "in_progress": { 
    icon: AlertTriangle, 
    color: "bg-blue-500", 
    text: "চলমান",
    bgColor: "bg-blue-50 border-blue-200", 
    textColor: "text-blue-700"
  },
  "completed": { 
    icon: CheckCircle, 
    color: "bg-green-500", 
    text: "সম্পূর্ণ",
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-700"
  },
  "cancelled": { 
    icon: AlertTriangle, 
    color: "bg-red-500", 
    text: "বাতিল",
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-700"
  },
};

export default function RunningProjectsPanel() {
  const { data: projects = [], isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Filter running projects (not completed/cancelled)
  const runningProjects = projects.filter(p => 
    p.status === "pending" || p.status === "in_progress"
  );

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm border-purple-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            চলমান প্রজেক্টসমূহ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border-purple-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            চলমান প্রজেক্টসমূহ
            <Badge variant="secondary" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
              {runningProjects.length}টি
            </Badge>
          </CardTitle>
          <Button size="sm" variant="outline" className="hover:bg-purple-50">
            <Plus className="h-4 w-4 mr-1" />
            নতুন প্রজেক্ট
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {runningProjects.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Globe className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm">কোন চলমান প্রজেক্ট নেই</p>
            <p className="text-xs text-slate-400 mt-1">নতুন প্রজেক্ট শুরু করুন</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {runningProjects.map((project) => {
              const statusConfig = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusConfig.icon;
              const assignedEmployees = employees.filter(emp => 
                project.assignments?.some(assignment => assignment.employeeId === emp.id)
              );

              return (
                <div 
                  key={project.id} 
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${statusConfig.bgColor}`}
                  data-testid={`project-card-${project.id}`}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {project.name}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 text-xs`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.text}
                        </Badge>
                      </div>
                      
                      {/* Project Type */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Badge variant="outline" className="text-xs border-gray-300">
                          {project.type === "website" ? "ওয়েবসাইট" : "ল্যান্ডিং পেজ"}
                        </Badge>
                        {project.client && (
                          <span className="text-gray-500">• {project.client.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>অগ্রগতি</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress 
                      value={project.progress} 
                      className="h-2 bg-gray-200"
                      data-testid={`progress-${project.id}`}
                    />
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Financial Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="h-3 w-3" />
                        <span>মোট: {formatCurrency(project.totalAmount)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>অগ্রিম: {formatCurrency(project.advanceReceived)}</span>
                      </div>
                      {project.dueAmount > 0 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="h-3 w-3" />
                          <span>বাকি: {formatCurrency(project.dueAmount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Team & Timeline */}
                    <div className="space-y-1">
                      {assignedEmployees.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{assignedEmployees.length}জন ডেভেলপার</span>
                        </div>
                      )}
                      {project.startDate && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(project.startDate).toLocaleDateString('bn-BD')}</span>
                        </div>
                      )}
                      {project.publicUrl && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Eye className="h-3 w-3" />
                          <a 
                            href={project.publicUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                            data-testid={`project-url-${project.id}`}
                          >
                            লাইভ দেখুন
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features Progress */}
                  {project.features && project.features.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>ফিচার সম্পন্ন</span>
                        <span>
                          {project.completedFeatures?.length || 0}/{project.features.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.features.slice(0, 3).map((feature, index) => {
                          const isCompleted = project.completedFeatures?.includes(feature);
                          return (
                            <Badge 
                              key={index}
                              variant={isCompleted ? "default" : "outline"}
                              className={`text-xs ${
                                isCompleted 
                                  ? "bg-green-100 text-green-700 border-green-300" 
                                  : "bg-gray-100 text-gray-600 border-gray-300"
                              }`}
                            >
                              {feature}
                            </Badge>
                          );
                        })}
                        {project.features.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                            +{project.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
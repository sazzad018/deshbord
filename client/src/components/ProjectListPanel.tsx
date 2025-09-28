import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FolderOpen,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Globe,
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  List
} from "lucide-react";
import type { Project, Client, Employee, ProjectAssignment } from "@shared/schema";

// Status configuration
const PROJECT_STATUS_CONFIG = {
  "planning": { 
    icon: Clock, 
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    text: "পরিকল্পনায়",
    count: 0
  },
  "in_progress": { 
    icon: AlertTriangle, 
    color: "bg-blue-100 text-blue-700 border-blue-300",
    text: "চলমান",
    count: 0
  },
  "completed": { 
    icon: CheckCircle, 
    color: "bg-green-100 text-green-700 border-green-300",
    text: "সম্পূর্ণ",
    count: 0
  },
  "cancelled": { 
    icon: AlertTriangle, 
    color: "bg-red-100 text-red-700 border-red-300",
    text: "বাতিল",
    count: 0
  },
};

interface ProjectWithDetails extends Project {
  client?: Client;
  assignments?: ProjectAssignment[];
}

export default function ProjectListPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Fetch data
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: assignments = [] } = useQuery<ProjectAssignment[]>({
    queryKey: ["/api/project-assignments"],
  });

  // Create projects with additional details
  const projectsWithDetails: ProjectWithDetails[] = projects.map(project => {
    const client = clients.find(c => c.id === project.clientId);
    const projectAssignments = assignments.filter(a => a.projectId === project.id);
    
    return {
      ...project,
      client,
      assignments: projectAssignments,
    };
  });

  // Filter and sort projects
  const filteredProjects = projectsWithDetails
    .filter(project => {
      if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !project.client?.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== "all" && project.type !== typeFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return b.progress - a.progress;
        case "budget":
          return b.totalAmount - a.totalAmount;
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Calculate statistics
  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === "planning").length,
    inProgress: projects.filter(p => p.status === "in_progress").length,
    completed: projects.filter(p => p.status === "completed").length,
    totalBudget: projects.reduce((sum, p) => sum + p.totalAmount, 0),
    avgProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0,
  };

  // Group projects by status for tabs
  const groupedProjects = {
    all: filteredProjects,
    planning: filteredProjects.filter(p => p.status === "planning"),
    in_progress: filteredProjects.filter(p => p.status === "in_progress"),
    completed: filteredProjects.filter(p => p.status === "completed"),
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const ProjectCard = ({ project }: { project: ProjectWithDetails }) => {
    const progressColor = getProgressColor(project.progress);
    const statusConfig = PROJECT_STATUS_CONFIG[project.status as keyof typeof PROJECT_STATUS_CONFIG];
    const StatusIcon = statusConfig.icon;

    return (
      <Card className="hover:shadow-md transition-shadow" data-testid={`project-card-${project.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-3 w-3" />
                <span>{project.client?.name || "আনএসাইনড"}</span>
                {project.type && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {project.type === "website" ? "ওয়েবসাইট" : "ল্যান্ডিং পেজ"}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`${statusConfig.color} text-xs`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.text}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>একশন</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    বিস্তারিত দেখুন
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    সম্পাদনা করুন
                  </DropdownMenuItem>
                  {project.publicUrl && (
                    <DropdownMenuItem asChild>
                      <a href={project.publicUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        লাইভ দেখুন
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    ডিলিট করুন
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">অগ্রগতি</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2">
              <div 
                className={`h-full ${progressColor} transition-all`}
                style={{ width: `${project.progress}%` }}
              />
            </Progress>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-gray-500" />
              <span className="text-gray-600">বাজেট:</span>
              <span className="font-medium">{formatCurrency(project.totalAmount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-gray-500" />
              <span className="text-gray-600">ডেভেলপার:</span>
              <span className="font-medium">{project.assignments?.length || 0}</span>
            </div>
          </div>

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-1">
                ফিচার ({project.completedFeatures?.length || 0}/{project.features.length})
              </p>
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

          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>তৈরি: {new Date(project.createdAt).toLocaleDateString('bn-BD')}</span>
            </div>
            {project.endDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>ডেডলাইন: {new Date(project.endDate).toLocaleDateString('bn-BD')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <FolderOpen className="h-6 w-6 text-purple-600" />
            প্রজেক্ট লিস্ট ও ট্র্যাকিং
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              data-testid="button-list-view"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              data-testid="button-grid-view"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">মোট প্রজেক্ট</p>
                <p className="text-lg font-bold text-blue-900" data-testid="stat-total">{stats.total}</p>
              </div>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 font-medium">পরিকল্পনায়</p>
                <p className="text-lg font-bold text-yellow-900" data-testid="stat-planning">{stats.planning}</p>
              </div>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">চলমান</p>
                <p className="text-lg font-bold text-orange-900" data-testid="stat-in-progress">{stats.inProgress}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">সম্পূর্ণ</p>
                <p className="text-lg font-bold text-green-900" data-testid="stat-completed">{stats.completed}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">গড় অগ্রগতি</p>
                <p className="text-lg font-bold text-purple-900" data-testid="stat-avg-progress">{Math.round(stats.avgProgress)}%</p>
              </div>
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="প্রজেক্ট বা ক্লায়েন্ট খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-projects"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
              <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              <SelectItem value="planning">পরিকল্পনায়</SelectItem>
              <SelectItem value="in_progress">চলমান</SelectItem>
              <SelectItem value="completed">সম্পূর্ণ</SelectItem>
              <SelectItem value="cancelled">বাতিল</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-type-filter">
              <SelectValue placeholder="টাইপ ফিল্টার" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব ধরন</SelectItem>
              <SelectItem value="website">ওয়েবসাইট</SelectItem>
              <SelectItem value="landing_page">ল্যান্ডিং পেজ</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-sort">
              <SelectValue placeholder="সর্ট করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">সাম্প্রতিক</SelectItem>
              <SelectItem value="name">নাম অনুযায়ী</SelectItem>
              <SelectItem value="progress">অগ্রগতি অনুযায়ী</SelectItem>
              <SelectItem value="budget">বাজেট অনুযায়ী</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              সব ({groupedProjects.all.length})
            </TabsTrigger>
            <TabsTrigger value="planning">
              পরিকল্পনায় ({groupedProjects.planning.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              চলমান ({groupedProjects.in_progress.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              সম্পূর্ণ ({groupedProjects.completed.length})
            </TabsTrigger>
          </TabsList>

          {Object.entries(groupedProjects).map(([status, projects]) => (
            <TabsContent key={status} value={status} className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">লোড হচ্ছে...</p>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">কোন প্রজেক্ট পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className={`grid gap-4 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
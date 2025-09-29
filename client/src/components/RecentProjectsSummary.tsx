import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, Calendar, User, DollarSign, CheckSquare, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    status: "",
    progress: 0,
    totalAmount: 0,
    advanceReceived: 0,
  });

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

  // Mutations
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "সফল!",
        description: "প্রজেক্ট আপডেট করা হয়েছে",
      });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "প্রজেক্ট আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "সফল!",
        description: "প্রজেক্ট ডিলিট করা হয়েছে",
      });
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "প্রজেক্ট ডিলিট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleViewProject = (project: ProjectWithDetails) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
  };

  const handleEditProject = (project: ProjectWithDetails) => {
    setSelectedProject(project);
    setEditFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      progress: project.progress,
      totalAmount: project.totalAmount,
      advanceReceived: project.advanceReceived,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteProject = (project: ProjectWithDetails) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleSaveProject = () => {
    if (!selectedProject) return;
    updateProjectMutation.mutate({
      id: selectedProject.id,
      data: editFormData,
    });
  };

  const confirmDeleteProject = () => {
    if (!selectedProject) return;
    deleteProjectMutation.mutate(selectedProject.id);
  };

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
                    <div className="flex items-center gap-2">
                      <Badge className={status.color}>{status.text}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            data-testid={`button-menu-${project.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewProject(project)}
                            data-testid={`button-view-${project.id}`}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            বিস্তারিত
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditProject(project)}
                            data-testid={`button-edit-${project.id}`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            সম্পাদনা
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProject(project)}
                            className="text-red-600"
                            data-testid={`button-delete-${project.id}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            ডিলিট
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

      {/* View Project Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">প্রজেক্ট বিস্তারিত</DialogTitle>
            <DialogDescription>প্রজেক্টের সম্পূর্ণ তথ্য দেখুন</DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">নাম</Label>
                  <p className="text-sm">{selectedProject.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">স্ট্যাটাস</Label>
                  <Badge className={statusConfig[selectedProject.status as keyof typeof statusConfig].color}>
                    {statusConfig[selectedProject.status as keyof typeof statusConfig].text}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">অগ্রগতি</Label>
                  <p className="text-sm">{selectedProject.progress}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">মোট পরিমাণ</Label>
                  <p className="text-sm">৳{selectedProject.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">অগ্রিম</Label>
                  <p className="text-sm">৳{selectedProject.advanceReceived.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">ক্লায়েন্ট</Label>
                  <p className="text-sm">{selectedProject.client?.name || "আনএসাইনড"}</p>
                </div>
              </div>
              
              {selectedProject.description && (
                <div>
                  <Label className="text-sm font-medium">বিবরণ</Label>
                  <p className="text-sm">{selectedProject.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">প্রজেক্ট সম্পাদনা</DialogTitle>
            <DialogDescription>প্রজেক্টের তথ্য আপডেট করুন</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">প্রজেক্টের নাম</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">স্ট্যাটাস</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">পরিকল্পনা</SelectItem>
                    <SelectItem value="in_progress">চলমান</SelectItem>
                    <SelectItem value="completed">সম্পন্ন</SelectItem>
                    <SelectItem value="cancelled">বাতিল</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-progress">অগ্রগতি (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.progress}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-total">মোট পরিমাণ (৳)</Label>
                <Input
                  id="edit-total"
                  type="number"
                  value={editFormData.totalAmount}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, totalAmount: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-advance">অগ্রিম (৳)</Label>
                <Input
                  id="edit-advance"
                  type="number"
                  value={editFormData.advanceReceived}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, advanceReceived: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">বিবরণ</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updateProjectMutation.isPending}
              >
                বাতিল
              </Button>
              <Button
                onClick={handleSaveProject}
                disabled={updateProjectMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                সেভ করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">প্রজেক্ট ডিলিট করুন</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে আপনি এই প্রজেক্টটি ডিলিট করতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-900">{selectedProject.name}</p>
                <p className="text-sm text-red-700">ক্লায়েন্ট: {selectedProject.client?.name || "আনএসাইনড"}</p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteProjectMutation.isPending}
                >
                  বাতিল
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteProject}
                  disabled={deleteProjectMutation.isPending}
                >
                  ডিলিট করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
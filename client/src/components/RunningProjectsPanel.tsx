import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, DollarSign, Users, Globe, Clock, CheckCircle, AlertTriangle, Eye, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    progress: 0,
    totalAmount: 0,
    advanceReceived: 0,
    dueAmount: 0,
    publicUrl: "",
    adminNotes: "",
    // Payment tracking fields (20%+ progress)
    secondPaymentDate: "",
    thirdPaymentDate: "",
    paymentCompleted: false,
    // Credentials (20%+ progress)
    wpUsername: "",
    wpPassword: "",
    cpanelUsername: "",
    cpanelPassword: "",
  });

  const { data: projects = [], isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      apiRequest("PATCH", `/api/projects/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditDialogOpen(false);
      toast({
        title: "সফল!",
        description: "প্রজেক্ট আপডেট করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "প্রজেক্ট আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "সফল!",
        description: "প্রজেক্ট ডিলিট করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "প্রজেক্ট ডিলিট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Action handlers
  const handleViewProject = (project: ProjectWithDetails) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
  };

  const handleEditProject = (project: ProjectWithDetails) => {
    setSelectedProject(project);
    setEditFormData({
      name: project.name,
      description: project.description || "",
      progress: project.progress,
      totalAmount: project.totalAmount,
      advanceReceived: project.advanceReceived,
      dueAmount: project.dueAmount,
      publicUrl: project.publicUrl || "",
      adminNotes: project.adminNotes || "",
      secondPaymentDate: project.secondPaymentDate ? new Date(project.secondPaymentDate).toISOString().split('T')[0] : "",
      thirdPaymentDate: project.thirdPaymentDate ? new Date(project.thirdPaymentDate).toISOString().split('T')[0] : "",
      paymentCompleted: project.paymentCompleted || false,
      wpUsername: project.wpUsername || "",
      wpPassword: project.wpPassword || "",
      cpanelUsername: project.cpanelUsername || "",
      cpanelPassword: project.cpanelPassword || "",
    });
    setEditDialogOpen(true);
  };

  const handleDeleteProject = (project: ProjectWithDetails) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${project.name}" প্রজেক্টটি ডিলিট করতে চান?`)) {
      deleteProjectMutation.mutate(project.id);
    }
  };

  const handleSaveProject = () => {
    if (!selectedProject) return;
    
    const updates = {
      ...editFormData,
      dueAmount: editFormData.totalAmount - editFormData.advanceReceived,
      secondPaymentDate: editFormData.secondPaymentDate ? new Date(editFormData.secondPaymentDate) : null,
      thirdPaymentDate: editFormData.thirdPaymentDate ? new Date(editFormData.thirdPaymentDate) : null,
    };
    
    updateProjectMutation.mutate({ id: selectedProject.id, updates });
  };

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
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProject(project)}
                        className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        data-testid={`button-view-${project.id}`}
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProject(project)}
                        className="h-7 w-7 p-0 text-gray-500 hover:text-green-600 hover:bg-green-50"
                        data-testid={`button-edit-${project.id}`}
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project)}
                        className="h-7 w-7 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        data-testid={`button-delete-${project.id}`}
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
                  <Label className="text-sm font-medium">টাইপ</Label>
                  <p className="text-sm">{selectedProject.type === "website" ? "ওয়েবসাইট" : "ল্যান্ডিং পেজ"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">স্ট্যাটাস</Label>
                  <Badge className={STATUS_CONFIG[selectedProject.status as keyof typeof STATUS_CONFIG].bgColor}>
                    {STATUS_CONFIG[selectedProject.status as keyof typeof STATUS_CONFIG].text}
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
              </div>
              
              {selectedProject.description && (
                <div>
                  <Label className="text-sm font-medium">বিবরণ</Label>
                  <p className="text-sm">{selectedProject.description}</p>
                </div>
              )}
              
              {selectedProject.adminNotes && (
                <div>
                  <Label className="text-sm font-medium">এডমিন নোট</Label>
                  <p className="text-sm">{selectedProject.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">প্রজেক্ট সম্পাদনা</DialogTitle>
            <DialogDescription>প্রজেক্টের তথ্য আপডেট করুন</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">মূল তথ্য</h3>
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
              
              <div>
                <Label htmlFor="edit-url">পাবলিক URL</Label>
                <Input
                  id="edit-url"
                  value={editFormData.publicUrl}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, publicUrl: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-notes">এডমিন নোট</Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.adminNotes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>

            {/* 20%+ Progress Fields */}
            {editFormData.progress >= 20 && (
              <>
                {/* Payment Tracking */}
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-800">পেমেন্ট ট্র্যাকিং (২০%+ অগ্রগতি)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-second-payment">দ্বিতীয় পেমেন্টের তারিখ</Label>
                      <Input
                        id="edit-second-payment"
                        type="date"
                        value={editFormData.secondPaymentDate}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, secondPaymentDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-third-payment">তৃতীয় পেমেন্টের তারিখ</Label>
                      <Input
                        id="edit-third-payment"
                        type="date"
                        value={editFormData.thirdPaymentDate}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, thirdPaymentDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="edit-payment-completed"
                      type="checkbox"
                      checked={editFormData.paymentCompleted}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, paymentCompleted: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="edit-payment-completed">পেমেন্ট সম্পূর্ণ</Label>
                  </div>
                </div>

                {/* Website Credentials */}
                <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                  <h3 className="text-lg font-semibold text-green-800">ওয়েবসাইট ক্রেডেনশিয়াল (২০%+ অগ্রগতি)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-wp-username">WordPress ইউজারনেম</Label>
                      <Input
                        id="edit-wp-username"
                        value={editFormData.wpUsername}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, wpUsername: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-wp-password">WordPress পাসওয়ার্ড</Label>
                      <Input
                        id="edit-wp-password"
                        type="password"
                        value={editFormData.wpPassword}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, wpPassword: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cpanel-username">cPanel ইউজারনেম</Label>
                      <Input
                        id="edit-cpanel-username"
                        value={editFormData.cpanelUsername}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, cpanelUsername: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cpanel-password">cPanel পাসওয়ার্ড</Label>
                      <Input
                        id="edit-cpanel-password"
                        type="password"
                        value={editFormData.cpanelPassword}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, cpanelPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updateProjectMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                বাতিল
              </Button>
              <Button
                onClick={handleSaveProject}
                disabled={updateProjectMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                সেভ করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
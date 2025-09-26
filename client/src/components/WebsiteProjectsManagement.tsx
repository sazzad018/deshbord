import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Globe, CheckCircle, Clock, AlertCircle, PlayCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client, WebsiteProject, InsertWebsiteProject } from "@shared/schema";

// Project status configuration with Bengali labels and colors
const PROJECT_STATUSES = [
  { value: "Planning", label: "পরিকল্পনা", icon: AlertCircle, color: "bg-yellow-500" },
  { value: "In Progress", label: "চলমান", icon: PlayCircle, color: "bg-blue-500" },
  { value: "Testing", label: "পরীক্ষা", icon: Clock, color: "bg-orange-500" },
  { value: "Completed", label: "সম্পন্ন", icon: CheckCircle, color: "bg-green-500" },
  { value: "On Hold", label: "স্থগিত", icon: AlertCircle, color: "bg-gray-500" },
] as const;

// Form validation schema
const projectFormSchema = z.object({
  clientId: z.string().min(1, "ক্লায়েন্ট নির্বাচন করুন"),
  projectName: z.string().min(1, "প্রজেক্টের নাম প্রয়োজন"),
  projectStatus: z.string().min(1, "স্ট্যাটাস নির্বাচন করুন"),
  websiteUrl: z.string().optional(),
  notes: z.string().optional(),
  portalKey: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

// Project card component
function ProjectCard({ 
  project, 
  clients, 
  onEdit, 
  onDelete 
}: { 
  project: WebsiteProject; 
  clients: Client[]; 
  onEdit: (project: WebsiteProject) => void;
  onDelete: (id: string) => void;
}) {
  const client = clients.find(c => c.id === project.clientId);
  const statusConfig = PROJECT_STATUSES.find(s => s.value === project.projectStatus);
  const StatusIcon = statusConfig?.icon || PlayCircle;

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`project-card-${project.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {project.projectName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {client?.name || "Unknown Client"}
              </Badge>
              <Badge 
                className={`text-white text-xs flex items-center gap-1 ${statusConfig?.color || 'bg-gray-500'}`}
                data-testid={`project-status-${project.id}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig?.label || project.projectStatus}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(project)}
              data-testid={`edit-project-${project.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(project.id)}
              className="text-red-600 hover:text-red-700"
              data-testid={`delete-project-${project.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {project.websiteUrl && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Globe className="w-4 h-4" />
              <a 
                href={project.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
                data-testid={`project-website-${project.id}`}
              >
                {project.websiteUrl}
              </a>
            </div>
          )}
          
          {project.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {project.notes}
            </p>
          )}
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Portal Key: {project.portalKey}</span>
            <span>{new Date(project.createdAt).toLocaleDateString('bn-BD')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main component
export function WebsiteProjectsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<WebsiteProject | null>(null);
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form handling
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      clientId: "",
      projectName: "",
      projectStatus: "Planning",
      websiteUrl: "",
      notes: "",
      portalKey: "",
    },
  });

  // Queries
  const { data: projects = [], isLoading: projectsLoading } = useQuery<WebsiteProject[]>({
    queryKey: ["/api/website-projects"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: InsertWebsiteProject) => {
      const response = await fetch("/api/website-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-projects"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "প্রজেক্ট সফলভাবে তৈরি হয়েছে!" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "প্রজেক্ট তৈরি করতে সমস্যা হয়েছে", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WebsiteProject> }) => {
      const response = await fetch(`/api/website-projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-projects"] });
      setIsDialogOpen(false);
      setEditingProject(null);
      form.reset();
      toast({ title: "প্রজেক্ট সফলভাবে আপডেট হয়েছে!" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "প্রজেক্ট আপডেট করতে সমস্যা হয়েছে", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/website-projects/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-projects"] });
      toast({ title: "প্রজেক্ট সফলভাবে মুছে ফেলা হয়েছে!" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "প্রজেক্ট মুছতে সমস্যা হয়েছে", variant: "destructive" });
    },
  });

  // Handle form submission
  const onSubmit = (data: ProjectFormData) => {
    // Generate portal key if not provided
    const projectData = {
      ...data,
      portalKey: data.portalKey || `${data.projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: projectData });
    } else {
      createMutation.mutate(projectData);
    }
  };

  // Handle edit
  const handleEdit = (project: WebsiteProject) => {
    setEditingProject(project);
    form.reset({
      clientId: project.clientId,
      projectName: project.projectName,
      projectStatus: project.projectStatus,
      websiteUrl: project.websiteUrl || "",
      notes: project.notes || "",
      portalKey: project.portalKey,
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে এই প্রজেক্টটি মুছে ফেলতে চান?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const clientMatch = filterClient === "all" || project.clientId === filterClient;
    const statusMatch = filterStatus === "all" || project.projectStatus === filterStatus;
    return clientMatch && statusMatch;
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingProject(null);
      form.reset();
    }
  }, [isDialogOpen, form]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ওয়েবসাইট সার্ভিস প্রজেক্ট
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            ক্লায়েন্টদের ওয়েবসাইট প্রজেক্ট ম্যানেজমেন্ট এবং ট্র্যাকিং
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-project-button">
              <Plus className="w-4 h-4 mr-2" />
              নতুন প্রজেক্ট
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "প্রজেক্ট এডিট করুন" : "নতুন প্রজেক্ট যোগ করুন"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">ক্লায়েন্ট *</Label>
                <Select 
                  value={form.watch("clientId")} 
                  onValueChange={(value) => form.setValue("clientId", value)}
                >
                  <SelectTrigger data-testid="select-client">
                    <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.clientId && (
                  <p className="text-sm text-red-600">{form.formState.errors.clientId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectName">প্রজেক্টের নাম *</Label>
                <Input
                  id="projectName"
                  {...form.register("projectName")}
                  placeholder="যেমন: ই-কমার্স ওয়েবসাইট"
                  data-testid="input-project-name"
                />
                {form.formState.errors.projectName && (
                  <p className="text-sm text-red-600">{form.formState.errors.projectName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectStatus">প্রজেক্ট স্ট্যাটাস *</Label>
                <Select 
                  value={form.watch("projectStatus")} 
                  onValueChange={(value) => form.setValue("projectStatus", value)}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <status.icon className="w-4 h-4" />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">ওয়েবসাইট URL (ঐচ্ছিক)</Label>
                <Input
                  id="websiteUrl"
                  {...form.register("websiteUrl")}
                  placeholder="https://example.com"
                  data-testid="input-website-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portalKey">Portal Key (ঐচ্ছিক)</Label>
                <Input
                  id="portalKey"
                  {...form.register("portalKey")}
                  placeholder="অটো জেনারেট হবে"
                  data-testid="input-portal-key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">নোট (ঐচ্ছিক)</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="প্রজেক্ট সম্পর্কে অতিরিক্ত তথ্য..."
                  rows={3}
                  data-testid="input-notes"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                  data-testid="submit-project"
                >
                  {editingProject ? "আপডেট করুন" : "তৈরি করুন"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  বাতিল
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="filter-client">ক্লায়েন্ট ফিল্টার:</Label>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-48" data-testid="filter-client">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব ক্লায়েন্ট</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="filter-status">স্ট্যাটাস ফিল্টার:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40" data-testid="filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              {PROJECT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              clients={clients}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              কোন প্রজেক্ট পাওয়া যায়নি
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filterClient !== "all" || filterStatus !== "all" 
                ? "ফিল্টার অনুযায়ী কোন প্রজেক্ট পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন।"
                : "এখনো কোন ওয়েবসাইট প্রজেক্ট যোগ করা হয়নি।"
              }
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              প্রথম প্রজেক্ট যোগ করুন
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Project Statistics */}
      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {PROJECT_STATUSES.map((status) => {
            const count = filteredProjects.filter((p) => p.projectStatus === status.value).length;
            return (
              <Card key={status.value} className="text-center p-4">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${status.color}`}>
                  <status.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{status.label}</div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
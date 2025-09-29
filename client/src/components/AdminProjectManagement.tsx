import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus,
  FolderPlus, 
  Users, 
  User, 
  Settings, 
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  UserPlus,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, Client, Employee, ProjectAssignment } from "@shared/schema";

// Form schemas
const projectFormSchema = z.object({
  name: z.string().min(1, "প্রজেক্টের নাম প্রয়োজন"),
  description: z.string().optional(),
  type: z.enum(["website", "landing_page"]),
  clientId: z.string().min(1, "ক্লায়েন্ট নির্বাচন করুন"),
  totalAmount: z.number().min(0, "বাজেট ০ বা তার বেশি হতে হবে"),
  deadline: z.string().optional(),
  features: z.string().optional(),
  status: z.enum(["planning", "in_progress", "completed", "cancelled"]).default("planning"),
});

const assignmentFormSchema = z.object({
  projectId: z.string().min(1, "প্রজেক্ট নির্বাচন করুন"),
  employeeId: z.string().min(1, "ডেভেলপার নির্বাচন করুন"),
  hourlyRate: z.number().min(0, "ঘন্টার হার ০ বা তার বেশি হতে হবে"),
  assignedFeatures: z.string().optional(),
  role: z.string().default("developer"),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;
type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

export default function AdminProjectManagement() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAssignDeveloperOpen, setIsAssignDeveloperOpen] = useState(false);
  const { toast } = useToast();

  // Queries
  const { data: projects = [] } = useQuery<Project[]>({
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

  // Forms
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "website",
      totalAmount: 0,
      status: "planning",
    },
  });

  const assignmentForm = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      hourlyRate: 0,
      role: "developer",
    },
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) => 
      apiRequest("POST", "/api/projects", {
        ...data,
        features: data.features ? data.features.split(',').map(f => f.trim()) : [],
        endDate: data.deadline ? new Date(data.deadline).toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "সফল!",
        description: "নতুন প্রজেক্ট তৈরি হয়েছে",
      });
      setIsCreateProjectOpen(false);
      projectForm.reset();
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "প্রজেক্ট তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const assignDeveloperMutation = useMutation({
    mutationFn: (data: AssignmentFormData) =>
      apiRequest("POST", "/api/project-assignments", {
        ...data,
        assignedFeatures: data.assignedFeatures ? data.assignedFeatures.split(',').map(f => f.trim()) : [],
        status: "assigned",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "সফল!",
        description: "ডেভেলপার এসাইন করা হয়েছে",
      });
      setIsAssignDeveloperOpen(false);
      assignmentForm.reset();
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "ডেভেলপার এসাইন করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Get project statistics
  const projectStats = {
    total: projects.length,
    planning: projects.filter(p => p.status === "planning").length,
    inProgress: projects.filter(p => p.status === "in_progress").length,
    completed: projects.filter(p => p.status === "completed").length,
  };

  // Get unassigned projects
  const assignedProjectIds = new Set(assignments.map(a => a.projectId));
  const unassignedProjects = projects.filter(p => !assignedProjectIds.has(p.id));

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Settings className="h-6 w-6 text-blue-600" />
            প্রজেক্ট ম্যানেজমেন্ট
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-create-project"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  নতুন প্রজেক্ট
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FolderPlus className="h-5 w-5 text-blue-600" />
                    নতুন প্রজেক্ট তৈরি করুন
                  </DialogTitle>
                </DialogHeader>
                <Form {...projectForm}>
                  <form onSubmit={projectForm.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={projectForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>প্রজেক্টের নাম *</FormLabel>
                            <FormControl>
                              <Input placeholder="প্রজেক্টের নাম লিখুন" {...field} data-testid="input-project-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={projectForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>প্রজেক্টের ধরন *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-project-type">
                                  <SelectValue placeholder="ধরন নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="website">ওয়েবসাইট</SelectItem>
                                <SelectItem value="landing_page">ল্যান্ডিং পেজ</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={projectForm.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ক্লায়েন্ট *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-client">
                                <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={projectForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>বর্ণনা</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="প্রজেক্টের বিস্তারিত বর্ণনা লিখুন" 
                              {...field} 
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={projectForm.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>মোট খরচ (BDT) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-total-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={projectForm.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ডেডলাইন</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-deadline" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={projectForm.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ফিচারসমূহ</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="কমা দিয়ে আলাদা করে ফিচার লিখুন (যেমন: Login System, Dashboard, Payment Gateway)" 
                              {...field} 
                              data-testid="textarea-features"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={projectForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>স্ট্যাটাস</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="planning">পরিকল্পনা</SelectItem>
                              <SelectItem value="in_progress">চলমান</SelectItem>
                              <SelectItem value="completed">সম্পূর্ণ</SelectItem>
                              <SelectItem value="cancelled">বাতিল</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateProjectOpen(false)}
                        data-testid="button-cancel-project"
                      >
                        বাতিল
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createProjectMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="button-submit-project"
                      >
                        {createProjectMutation.isPending ? "তৈরি হচ্ছে..." : "প্রজেক্ট তৈরি করুন"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAssignDeveloperOpen} onOpenChange={setIsAssignDeveloperOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  data-testid="button-assign-developer"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  ডেভেলপার এসাইন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-green-600" />
                    ডেভেলপার এসাইন করুন
                  </DialogTitle>
                </DialogHeader>
                <Form {...assignmentForm}>
                  <form onSubmit={assignmentForm.handleSubmit((data) => assignDeveloperMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={assignmentForm.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>প্রজেক্ট *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-assignment-project">
                                <SelectValue placeholder="প্রজেক্ট নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assignmentForm.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ডেভেলপার *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-employee">
                                <SelectValue placeholder="ডেভেলপার নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.filter(emp => emp.isActive).map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name} ({employee.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assignmentForm.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ঘন্টার হার (BDT) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-hourly-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assignmentForm.control}
                      name="assignedFeatures"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>এসাইন করা ফিচার</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="কমা দিয়ে আলাদা করে ফিচার লিখুন" 
                              {...field} 
                              data-testid="textarea-assigned-features"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAssignDeveloperOpen(false)}
                        data-testid="button-cancel-assignment"
                      >
                        বাতিল
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={assignDeveloperMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-submit-assignment"
                      >
                        {assignDeveloperMutation.isPending ? "এসাইন হচ্ছে..." : "এসাইন করুন"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Project Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">মোট প্রজেক্ট</p>
                <p className="text-2xl font-bold text-blue-900" data-testid="stat-total-projects">{projectStats.total}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">পরিকল্পনায়</p>
                <p className="text-2xl font-bold text-yellow-900" data-testid="stat-planning-projects">{projectStats.planning}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">চলমান</p>
                <p className="text-2xl font-bold text-orange-900" data-testid="stat-active-projects">{projectStats.inProgress}</p>
              </div>
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">সম্পূর্ণ</p>
                <p className="text-2xl font-bold text-green-900" data-testid="stat-completed-projects">{projectStats.completed}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Unassigned Projects Alert */}
        {unassignedProjects.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">আনএসাইনড প্রজেক্ট</h4>
                <p className="text-sm text-orange-700 mt-1">
                  {unassignedProjects.length}টি প্রজেক্টে এখনো কোন ডেভেলপার এসাইন করা হয়নি
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {unassignedProjects.slice(0, 3).map((project) => (
                    <Badge key={project.id} variant="outline" className="text-orange-700 border-orange-300">
                      {project.name}
                    </Badge>
                  ))}
                  {unassignedProjects.length > 3 && (
                    <Badge variant="outline" className="text-orange-600">
                      +{unassignedProjects.length - 3} আরো
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Projects List */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            সাম্প্রতিক প্রজেক্টসমূহ
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {projects.slice(0, 6).map((project) => {
              const client = clients.find(c => c.id === project.clientId);
              const projectAssignments = assignments.filter(a => a.projectId === project.id);
              
              return (
                <div key={project.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{project.name}</h5>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {client?.name || "আনএসাইনড"}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ৳{project.totalAmount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {projectAssignments.length} ডেভেলপার
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={project.status === "completed" ? "default" : "secondary"}
                      className={
                        project.status === "planning" ? "bg-yellow-100 text-yellow-700" :
                        project.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        project.status === "completed" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }
                    >
                      {project.status === "planning" ? "পরিকল্পনায়" :
                       project.status === "in_progress" ? "চলমান" :
                       project.status === "completed" ? "সম্পূর্ণ" : "বাতিল"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
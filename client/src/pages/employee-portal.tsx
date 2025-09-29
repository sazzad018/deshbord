import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Globe, 
  User, 
  CreditCard,
  AlertTriangle,
  Calendar,
  Target,
  Trophy,
  Briefcase,
  Users,
  Eye
} from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import type { EmployeeWithDetails, ProjectAssignment, SalaryPayment, Employee } from "@shared/schema";

// Status configuration for projects
const PROJECT_STATUS_CONFIG = {
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

// Payment type configuration
const PAYMENT_TYPE_CONFIG = {
  "salary": { text: "বেতন", color: "bg-blue-100 text-blue-700" },
  "advance": { text: "অগ্রিম", color: "bg-orange-100 text-orange-700" },
  "bonus": { text: "বোনাস", color: "bg-green-100 text-green-700" },
  "project_payment": { text: "প্রজেক্ট পেমেন্ট", color: "bg-purple-100 text-purple-700" },
};

export default function EmployeePortal() {
  const { toast } = useToast();
  
  // Fetch all employees data
  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Get URL employeeId if provided (for backward compatibility)
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmployeeId = urlParams.get('id') || urlParams.get('employeeId');

  // Use first active employee as default if no URL param
  const defaultEmployee = employees.find(emp => emp.isActive) || employees[0];
  const selectedEmployeeId = urlEmployeeId || defaultEmployee?.id;

  // Fetch specific employee details
  const { data: employee, isLoading, error, refetch } = useQuery<EmployeeWithDetails>({
    queryKey: ["/api/employees", selectedEmployeeId],
    enabled: !!selectedEmployeeId,
  });

  // Mark feature as complete mutation
  const markFeatureCompleteMutation = useMutation({
    mutationFn: async ({ assignmentId, feature }: { assignmentId: string; feature: string }) => {
      const assignment = employee?.assignments?.find(a => a.id === assignmentId);
      if (!assignment) throw new Error("Assignment not found");
      
      const completedFeatures = [...(assignment.completedFeatures || [])];
      if (!completedFeatures.includes(feature)) {
        completedFeatures.push(feature);
      }

      return apiRequest("PATCH", `/api/project-assignments/${assignmentId}`, {
        completedFeatures,
        status: completedFeatures.length === assignment.assignedFeatures?.length ? "completed" : "working"
      });
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/project-assignments"] });
      toast({
        title: "সফল!",
        description: "ফিচার সম্পূর্ণ হিসেবে চিহ্নিত করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "ফিচার আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Loading state
  if (employeesLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">ডেটা লোড হচ্ছে...</p>
            <p className="text-xs text-gray-500 mt-2">কর্মচারী পোর্টাল প্রস্তুত করা হচ্ছে...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show general employee portal if no specific employee found but employees exist
  if (!employee && employees.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">কর্মচারী পোর্টাল</h1>
              <p className="text-gray-600 mb-4">স্বাগতম! এখানে কর্মচারীদের তথ্য এবং প্রজেক্ট পরিচালনার সুবিধা রয়েছে।</p>
              
              {/* Show available employees */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">উপলব্ধ কর্মচারীগণ:</h3>
                <div className="grid gap-3">
                  {employees.filter(emp => emp.isActive).map((emp) => (
                    <Card key={emp.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.location.href = `/employee-portal?id=${emp.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <h4 className="font-medium">{emp.name}</h4>
                          <p className="text-sm text-gray-600">{emp.role}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          পোর্টাল দেখুন
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state - no employees found
  if (employees.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">কর্মচারী পোর্টাল</h1>
            <p className="text-gray-600 mb-4">কোন কর্মচারীর তথ্য এখনো যোগ করা হয়নি</p>
            <p className="text-sm text-gray-500">প্রশাসনিক প্যানেল থেকে কর্মচারী যোগ করুন</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Additional safety check
  if (!employee?.name) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">ডেটা সমস্যা</h2>
            <p className="text-gray-600 mb-4">Employee data incomplete</p>
            <p className="text-sm text-gray-500">Selected ID: {selectedEmployeeId}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals (with null checks)
  const totalEarned = employee?.totalIncome || 0;
  const totalAdvance = employee?.totalAdvance || 0;
  const totalDue = employee?.totalDue || 0;
  const netBalance = totalEarned - totalAdvance;

  // Get active projects
  const activeProjects = employee?.assignments?.filter(assignment => 
    assignment.status === "assigned" || assignment.status === "working"
  ) || [];

  // Get recent payments
  const recentPayments = employee?.salaryPayments?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900" data-testid="text-employee-name">
                  {employee?.name}
                </h1>
                <p className="text-gray-600 capitalize">{employee?.role}</p>
              </div>
            </div>
            <Badge 
              variant={employee?.isActive ? "default" : "secondary"}
              className={employee?.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
            >
              {employee?.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">মোট আয়</p>
                  <p className="text-2xl font-bold text-blue-900" data-testid="text-total-income">
                    {formatCurrency(totalEarned)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">মোট অগ্রিম</p>
                  <p className="text-2xl font-bold text-orange-900" data-testid="text-total-advance">
                    {formatCurrency(totalAdvance)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">নেট ব্যালেন্স</p>
                  <p className="text-2xl font-bold text-green-900" data-testid="text-net-balance">
                    {formatCurrency(netBalance)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">বকেয়া</p>
                  <p className="text-2xl font-bold text-purple-900" data-testid="text-total-due">
                    {formatCurrency(totalDue)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Projects */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  ডেভেলপার প্রজেক্ট ড্যাশবোর্ড
                  <Badge variant="secondary" className="ml-2">
                    {activeProjects.length}টি
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm">কোন assigned প্রজেক্ট নেই</p>
                  <p className="text-xs text-gray-400 mt-1">Admin আপনাকে প্রজেক্ট assign করলে এখানে দেখা যাবে</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {activeProjects.map((assignment) => {
                    const project = assignment.project;
                    if (!project) return null;

                    const statusConfig = PROJECT_STATUS_CONFIG[project.status as keyof typeof PROJECT_STATUS_CONFIG];
                    const StatusIcon = statusConfig.icon;
                    const completedFeatures = assignment.completedFeatures?.length || 0;
                    const totalFeatures = assignment.assignedFeatures?.length || 0;
                    const progress = totalFeatures > 0 ? (completedFeatures / totalFeatures) * 100 : 0;

                    return (
                      <div 
                        key={assignment.id} 
                        className={`p-4 rounded-lg border-2 ${statusConfig.bgColor}`}
                        data-testid={`assignment-card-${assignment.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {project.type === "website" ? "ওয়েবসাইট" : "ল্যান্ডিং পেজ"}
                              </Badge>
                              <span>• ৳{assignment.hourlyRate}/ঘন্টা</span>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 text-xs`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.text}
                          </Badge>
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>অগ্রগতি</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2 bg-gray-200" />
                        </div>

                        {/* Assigned Features with Completion */}
                        {assignment.assignedFeatures && assignment.assignedFeatures.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-800 mb-3">
                              নির্ধারিত ফিচারসমূহ ({completedFeatures}/{totalFeatures})
                            </h5>
                            <div className="space-y-2">
                              {assignment.assignedFeatures.map((feature, index) => {
                                const isCompleted = assignment.completedFeatures?.includes(feature);
                                
                                return (
                                  <div 
                                    key={index} 
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                      isCompleted 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                    data-testid={`feature-${assignment.id}-${index}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {isCompleted ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                      ) : (
                                        <Clock className="h-5 w-5 text-gray-400" />
                                      )}
                                      <span className={`${isCompleted ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                                        {feature}
                                      </span>
                                    </div>
                                    {!isCompleted && (
                                      <Button
                                        size="sm"
                                        onClick={() => markFeatureCompleteMutation.mutate({ 
                                          assignmentId: assignment.id, 
                                          feature 
                                        })}
                                        disabled={markFeatureCompleteMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        data-testid={`button-complete-${assignment.id}-${index}`}
                                      >
                                        {markFeatureCompleteMutation.isPending ? (
                                          <Clock className="h-4 w-4 animate-spin" />
                                        ) : (
                                          "সম্পূর্ণ"
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Earnings */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <DollarSign className="h-3 w-3" />
                            <span>আয়: {formatCurrency(assignment.totalEarned)}</span>
                          </div>
                          {project.publicUrl && (
                            <a 
                              href={project.publicUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                              data-testid={`project-url-${project.id}`}
                            >
                              <Eye className="h-3 w-3" />
                              লাইভ দেখুন
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                সাম্প্রতিক পেমেন্ট
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm">কোন পেমেন্ট রেকর্ড নেই</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentPayments.map((payment) => {
                    const typeConfig = PAYMENT_TYPE_CONFIG[payment.type as keyof typeof PAYMENT_TYPE_CONFIG];
                    
                    return (
                      <div 
                        key={payment.id} 
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        data-testid={`payment-card-${payment.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant="secondary" 
                            className={`${typeConfig.color} text-xs`}
                          >
                            {typeConfig.text}
                          </Badge>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(payment.paymentDate).toLocaleDateString('bn-BD')}
                            </span>
                          </div>
                          
                          {payment.paymentMethod && (
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              <span>{payment.paymentMethod}</span>
                              {payment.transactionId && (
                                <span className="text-gray-400">• {payment.transactionId}</span>
                              )}
                            </div>
                          )}
                          
                          {payment.notes && (
                            <p className="mt-1 text-gray-500 italic">{payment.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
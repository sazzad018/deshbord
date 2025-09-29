import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import type { EmployeeWithDetails, ProjectAssignment, SalaryPayment } from "@shared/schema";

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
  // Get employee ID from URL parameters
  const [location] = useLocation();
  // Use window.location.search for query parameters since wouter's location doesn't include query string
  const urlParams = new URLSearchParams(window.location.search);
  const employeeId = urlParams.get('id');

  // Simple test return for now
  if (!employeeId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Employee Portal</h1>
            <p className="text-gray-600">No Employee ID provided in URL</p>
            <p className="text-sm text-gray-500 mt-2">URL: {window.location.href}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch employee data using employee ID
  const { data: employee, isLoading, error } = useQuery<EmployeeWithDetails>({
    queryKey: ["/api/employees", employeeId],
    enabled: !!employeeId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">ডেটা লোড হচ্ছে...</p>
            <p className="text-xs text-gray-500 mt-2">Employee ID: {employeeId}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">ত্রুটি</h2>
            <p className="text-gray-600 mb-4">
              ইমপ্লয়ী তথ্য লোড করতে সমস্যা হয়েছে। লিংকটি সঠিক কিনা যাচাই করুন।
            </p>
            <p className="text-xs text-gray-500">Employee ID: {employeeId}</p>
            <p className="text-xs text-gray-500">Error: {error?.message || 'Unknown'}</p>
            <p className="text-xs text-gray-500">Has Employee: {employee ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug check - Fallback if employee exists but data is somehow invalid
  if (!employee.name) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">ডেটা সমস্যা</h2>
            <p className="text-gray-600 mb-4">Employee data received but name is missing</p>
            <pre className="text-xs text-left">{JSON.stringify(employee, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const totalEarned = employee.totalIncome || 0;
  const totalAdvance = employee.totalAdvance || 0;
  const totalDue = employee.totalDue || 0;
  const netBalance = totalEarned - totalAdvance;

  // Get active projects
  const activeProjects = employee.assignments?.filter(assignment => 
    assignment.status === "assigned" || assignment.status === "working"
  ) || [];

  // Get recent payments
  const recentPayments = employee.salaryPayments?.slice(0, 5) || [];

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
                  {employee.name}
                </h1>
                <p className="text-gray-600 capitalize">{employee.role}</p>
              </div>
            </div>
            <Badge 
              variant={employee.isActive ? "default" : "secondary"}
              className={employee.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
            >
              {employee.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
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
                  সক্রিয় প্রজেক্টসমূহ
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
                  <p className="text-sm">কোন সক্রিয় প্রজেক্ট নেই</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
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

                        {/* Features */}
                        {assignment.assignedFeatures && assignment.assignedFeatures.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-2">
                              ফিচারসমূহ ({completedFeatures}/{totalFeatures})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {assignment.assignedFeatures.slice(0, 3).map((feature, index) => {
                                const isCompleted = assignment.completedFeatures?.includes(feature);
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
                              {assignment.assignedFeatures.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                                  +{assignment.assignedFeatures.length - 3}
                                </Badge>
                              )}
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
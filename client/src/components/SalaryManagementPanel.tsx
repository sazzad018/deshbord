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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  DollarSign,
  CreditCard,
  TrendingUp,
  Calendar,
  User,
  Plus,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  PiggyBank,
  Wallet,
  BarChart3,
  Users,
  Download,
  Filter,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils-dashboard";
import type { Employee, SalaryPayment } from "@shared/schema";

// Form schemas
const salaryPaymentFormSchema = z.object({
  employeeId: z.string().min(1, "ডেভেলপার নির্বাচন করুন"),
  amount: z.number().min(1, "পরিমাণ ০ এর বেশি হতে হবে"),
  type: z.enum(["salary", "advance", "bonus", "project_payment"]),
  paymentDate: z.string().min(1, "তারিখ প্রয়োজন"),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

type SalaryPaymentFormData = z.infer<typeof salaryPaymentFormSchema>;

// Payment type configuration
const PAYMENT_TYPE_CONFIG = {
  "salary": { 
    text: "বেতন", 
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: Wallet 
  },
  "advance": { 
    text: "অগ্রিম", 
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: CreditCard 
  },
  "bonus": { 
    text: "বোনাস", 
    color: "bg-green-100 text-green-700 border-green-300",
    icon: TrendingUp 
  },
  "project_payment": { 
    text: "প্রজেক্ট পেমেন্ট", 
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: FileText 
  },
};

interface EmployeeWithSalaryDetails {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  portalKey: string;
  createdAt: Date;
  totalIncome?: number;
  totalAdvance?: number;
  totalDue?: number;
  salaryPayments?: SalaryPayment[];
}

export default function SalaryManagementPanel() {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Queries
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<EmployeeWithSalaryDetails[]>({
    queryKey: ["/api/employees"],
  });

  const { data: allSalaryPayments = [], isLoading: isLoadingPayments } = useQuery<SalaryPayment[]>({
    queryKey: ["/api/salary-payments"],
  });

  // Form
  const paymentForm = useForm<SalaryPaymentFormData>({
    resolver: zodResolver(salaryPaymentFormSchema),
    defaultValues: {
      amount: 0,
      type: "salary",
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  // Mutations
  const addPaymentMutation = useMutation({
    mutationFn: (data: SalaryPaymentFormData) =>
      apiRequest("/api/salary-payments", "POST", {
        ...data,
        paymentDate: new Date(data.paymentDate),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salary-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "সফল!",
        description: "পেমেন্ট রেকর্ড যোগ করা হয়েছে",
      });
      setIsAddPaymentOpen(false);
      paymentForm.reset();
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "পেমেন্ট যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter payments
  const filteredPayments = allSalaryPayments.filter(payment => {
    if (selectedEmployee !== "all" && payment.employeeId !== selectedEmployee) {
      return false;
    }
    if (selectedMonth !== "all") {
      const paymentMonth = new Date(payment.paymentDate).getMonth() + 1;
      if (paymentMonth.toString() !== selectedMonth) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  // Calculate statistics
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.isActive).length,
    totalPaid: allSalaryPayments.reduce((sum, payment) => sum + payment.amount, 0),
    totalAdvances: allSalaryPayments.filter(p => p.type === "advance").reduce((sum, p) => sum + p.amount, 0),
    paymentsThisMonth: allSalaryPayments.filter(p => {
      const paymentDate = new Date(p.paymentDate);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + p.amount, 0),
  };

  // Calculate employee salary summary
  const employeeSalarySummary = employees.map(emp => {
    const empPayments = allSalaryPayments.filter(p => p.employeeId === emp.id);
    const totalSalary = empPayments.filter(p => p.type === "salary").reduce((sum, p) => sum + p.amount, 0);
    const totalAdvance = empPayments.filter(p => p.type === "advance").reduce((sum, p) => sum + p.amount, 0);
    const totalBonus = empPayments.filter(p => p.type === "bonus").reduce((sum, p) => sum + p.amount, 0);
    const totalProjectPayment = empPayments.filter(p => p.type === "project_payment").reduce((sum, p) => sum + p.amount, 0);
    const totalIncome = totalSalary + totalBonus + totalProjectPayment;
    const netBalance = totalIncome - totalAdvance;

    return {
      ...emp,
      totalSalary,
      totalAdvance,
      totalBonus,
      totalProjectPayment,
      totalIncome,
      netBalance,
      paymentCount: empPayments.length,
      lastPayment: empPayments.length > 0 ? empPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0] : null,
    };
  });

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <PiggyBank className="h-6 w-6 text-green-600" />
            বেতন ম্যানেজমেন্ট সিস্টেম
          </CardTitle>
          <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-add-payment"
              >
                <Plus className="h-4 w-4 mr-1" />
                পেমেন্ট যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  নতুন পেমেন্ট রেকর্ড
                </DialogTitle>
              </DialogHeader>
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit((data) => addPaymentMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={paymentForm.control}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={paymentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>পেমেন্টের ধরন *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="salary">বেতন</SelectItem>
                              <SelectItem value="advance">অগ্রিম</SelectItem>
                              <SelectItem value="bonus">বোনাস</SelectItem>
                              <SelectItem value="project_payment">প্রজেক্ট পেমেন্ট</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>পরিমাণ (BDT) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={paymentForm.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>পেমেন্ট তারিখ *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-payment-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>পেমেন্ট মাধ্যম</FormLabel>
                          <FormControl>
                            <Input placeholder="যেমন: bKash, নগদ, ব্যাংক" {...field} data-testid="input-payment-method" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={paymentForm.control}
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ট্রানজেকশন আইডি</FormLabel>
                        <FormControl>
                          <Input placeholder="ট্রানজেকশন আইডি (যদি থাকে)" {...field} data-testid="input-transaction-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={paymentForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>নোট</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="অতিরিক্ত নোট বা মন্তব্য" 
                            {...field} 
                            data-testid="textarea-notes"
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
                      onClick={() => setIsAddPaymentOpen(false)}
                      data-testid="button-cancel-payment"
                    >
                      বাতিল
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addPaymentMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-submit-payment"
                    >
                      {addPaymentMutation.isPending ? "যোগ হচ্ছে..." : "পেমেন্ট যোগ করুন"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">মোট ডেভেলপার</p>
                <p className="text-2xl font-bold text-blue-900" data-testid="stat-total-employees">{stats.totalEmployees}</p>
                <p className="text-xs text-blue-600">সক্রিয়: {stats.activeEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">মোট পেমেন্ট</p>
                <p className="text-2xl font-bold text-green-900" data-testid="stat-total-paid">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">মোট অগ্রিম</p>
                <p className="text-2xl font-bold text-orange-900" data-testid="stat-total-advances">
                  {formatCurrency(stats.totalAdvances)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">এই মাসে</p>
                <p className="text-2xl font-bold text-purple-900" data-testid="stat-this-month">
                  {formatCurrency(stats.paymentsThisMonth)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees">ডেভেলপার সামারি</TabsTrigger>
            <TabsTrigger value="payments">পেমেন্ট ইতিহাস</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-4">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ডেভেলপার খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-employees"
                />
              </div>
            </div>

            {/* Employee Summary */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEmployees.map((emp) => {
                const summary = employeeSalarySummary.find(s => s.id === emp.id);
                if (!summary) return null;

                return (
                  <Card key={emp.id} className="p-4" data-testid={`employee-summary-${emp.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{emp.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            {emp.role}
                          </Badge>
                          <Badge 
                            variant={emp.isActive ? "default" : "secondary"}
                            className={emp.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                          >
                            {emp.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">নেট ব্যালেন্স</p>
                        <p className={`font-bold ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(summary.netBalance)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">মোট আয়</p>
                        <p className="font-medium">{formatCurrency(summary.totalIncome)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">মোট অগ্রিম</p>
                        <p className="font-medium text-orange-600">{formatCurrency(summary.totalAdvance)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">পেমেন্ট সংখ্যা</p>
                        <p className="font-medium">{summary.paymentCount}টি</p>
                      </div>
                      <div>
                        <p className="text-gray-600">শেষ পেমেন্ট</p>
                        <p className="font-medium">
                          {summary.lastPayment 
                            ? new Date(summary.lastPayment.paymentDate).toLocaleDateString('bn-BD')
                            : "নেই"
                          }
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-employee-filter">
                  <SelectValue placeholder="ডেভেলপার নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ডেভেলপার</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-month-filter">
                  <SelectValue placeholder="মাস নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব মাস</SelectItem>
                  <SelectItem value="1">জানুয়ারি</SelectItem>
                  <SelectItem value="2">ফেব্রুয়ারি</SelectItem>
                  <SelectItem value="3">মার্চ</SelectItem>
                  <SelectItem value="4">এপ্রিল</SelectItem>
                  <SelectItem value="5">মে</SelectItem>
                  <SelectItem value="6">জুন</SelectItem>
                  <SelectItem value="7">জুলাই</SelectItem>
                  <SelectItem value="8">আগস্ট</SelectItem>
                  <SelectItem value="9">সেপ্টেম্বর</SelectItem>
                  <SelectItem value="10">অক্টোবর</SelectItem>
                  <SelectItem value="11">নভেম্বর</SelectItem>
                  <SelectItem value="12">ডিসেম্বর</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                রিপোর্ট ডাউনলোড
              </Button>
            </div>

            {/* Payment History */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">কোন পেমেন্ট রেকর্ড পাওয়া যায়নি</p>
                </div>
              ) : (
                filteredPayments.map((payment) => {
                  const employee = employees.find(emp => emp.id === payment.employeeId);
                  const typeConfig = PAYMENT_TYPE_CONFIG[payment.type as keyof typeof PAYMENT_TYPE_CONFIG];
                  const TypeIcon = typeConfig.icon;

                  return (
                    <Card key={payment.id} className="p-4" data-testid={`payment-record-${payment.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="secondary" 
                              className={`${typeConfig.color} text-sm`}
                            >
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {typeConfig.text}
                            </Badge>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {employee?.name || "অজানা ডেভেলপার"}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(payment.paymentDate).toLocaleDateString('bn-BD')}</span>
                          </div>
                          {payment.paymentMethod && (
                            <div className="flex items-center gap-1 mt-1">
                              <CreditCard className="h-3 w-3" />
                              <span>{payment.paymentMethod}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {payment.transactionId && (
                        <p className="text-xs text-gray-500 mb-1">
                          ট্রানজেকশন: {payment.transactionId}
                        </p>
                      )}
                      
                      {payment.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-2">
                          {payment.notes}
                        </p>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
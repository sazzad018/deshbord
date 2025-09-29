import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { 
  Users, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Plus,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Employee, InsertEmployee } from "@shared/schema";

// Employee creation form schema
const employeeFormSchema = z.object({
  name: z.string().min(1, "নাম প্রয়োজন"),
  email: z.string().email("সঠিক ইমেইল লিখুন").optional().or(z.literal("")),
  phone: z.string().min(1, "ফোন নম্বর প্রয়োজন"),
  role: z.string().min(1, "ভূমিকা নির্বাচন করুন"),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

export default function EmployeeListPanel() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Employee creation form
  const employeeForm = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
    },
  });

  // Employee creation mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const employeeData: InsertEmployee = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
        role: data.role,
        portalKey: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique portal key
      };
      return apiRequest("POST", "/api/employees", employeeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsCreateDialogOpen(false);
      employeeForm.reset();
      toast({
        title: "সফল",
        description: "নতুন ইমপ্লয়ী সফলভাবে যোগ করা হয়েছে",
      });
    },
    onError: (error) => {
      console.error("Employee creation error:", error);
      toast({
        title: "ত্রুটি",
        description: "ইমপ্লয়ী যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Employee delete/deactivate mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: (employeeId: string) => apiRequest("PATCH", `/api/employees/${employeeId}`, { isActive: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "সফল",
        description: "ইমপ্লয়ী নিষ্ক্রিয় করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ইমপ্লয়ী নিষ্ক্রিয় করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Filter active employees
  const activeEmployees = employees.filter(emp => emp.isActive);
  const inactiveEmployees = employees.filter(emp => !emp.isActive);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'frontend developer':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'backend developer':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'designer':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'manager':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            ইমপ্লয়ী লিস্ট
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
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
            <Users className="h-5 w-5 text-blue-600" />
            ইমপ্লয়ী লিস্ট
            <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              {activeEmployees.length}জন সক্রিয়
            </Badge>
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid="button-add-employee">
                <Plus className="h-4 w-4 mr-1" />
                নতুন ইমপ্লয়ী
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm">কোন ইমপ্লয়ী নেই</p>
            <p className="text-xs text-slate-400 mt-1">নতুন ইমপ্লয়ী যোগ করুন</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Employees */}
            {activeEmployees.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  সক্রিয় ইমপ্লয়ী ({activeEmployees.length}জন)
                </h3>
                <div className="space-y-3">
                  {activeEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="bg-gradient-to-r from-white to-blue-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                      data-testid={`employee-card-${employee.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600">
                            <AvatarFallback className="text-white font-semibold">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                              <Badge className={getRoleColor(employee.role)}>
                                {employee.role}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              {employee.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{employee.email}</span>
                                </div>
                              )}
                              {employee.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{employee.phone}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Salary Summary */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="bg-white rounded-lg p-2 border">
                                <div className="flex items-center gap-1 text-gray-500 mb-1">
                                  <TrendingUp className="h-3 w-3" />
                                  <span className="text-xs">আয়</span>
                                </div>
                                <div className="font-semibold text-green-600 text-sm">
                                  ৳{employee.totalIncome?.toLocaleString('bn-BD') || '0'}
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-lg p-2 border">
                                <div className="flex items-center gap-1 text-gray-500 mb-1">
                                  <TrendingDown className="h-3 w-3" />
                                  <span className="text-xs">অগ্রিম</span>
                                </div>
                                <div className="font-semibold text-orange-600 text-sm">
                                  ৳{employee.totalAdvance?.toLocaleString('bn-BD') || '0'}
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-lg p-2 border">
                                <div className="flex items-center gap-1 text-gray-500 mb-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span className="text-xs">বকেয়া</span>
                                </div>
                                <div className="font-semibold text-blue-600 text-sm">
                                  ৳{employee.totalDue?.toLocaleString('bn-BD') || '0'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Link href={`/employee-portal?id=${employee.id}`}>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="hover:bg-blue-50 border-blue-200 text-blue-700"
                              data-testid={`button-employee-portal-${employee.id}`}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              পোর্টাল
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                            disabled={deleteEmployeeMutation.isPending}
                            className="hover:bg-red-50 border-red-200 text-red-700"
                            data-testid={`button-delete-employee-${employee.id}`}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            ডিলিট
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Inactive Employees */}
            {inactiveEmployees.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-500" />
                  নিষ্ক্রিয় ইমপ্লয়ী ({inactiveEmployees.length}জন)
                </h3>
                <div className="space-y-2">
                  {inactiveEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 opacity-60"
                      data-testid={`inactive-employee-card-${employee.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-gray-400">
                          <AvatarFallback className="text-white text-sm">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-gray-700">{employee.name}</h4>
                          <p className="text-sm text-gray-500">{employee.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Employee Creation Dialog */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন ইমপ্লয়ী যোগ করুন</DialogTitle>
        </DialogHeader>
        <Form {...employeeForm}>
          <form onSubmit={employeeForm.handleSubmit((data) => createEmployeeMutation.mutate(data))} className="space-y-4">
            <FormField
              control={employeeForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>নাম *</FormLabel>
                  <FormControl>
                    <Input placeholder="ইমপ্লয়ীর নাম লিখুন" {...field} data-testid="input-employee-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={employeeForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ইমেইল</FormLabel>
                  <FormControl>
                    <Input placeholder="ইমেইল ঠিকানা" type="email" {...field} data-testid="input-employee-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={employeeForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ফোন নম্বর *</FormLabel>
                  <FormControl>
                    <Input placeholder="ফোন নম্বর" {...field} data-testid="input-employee-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={employeeForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ভূমিকা *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-employee-role">
                        <SelectValue placeholder="ভূমিকা নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="frontend developer">Frontend Developer</SelectItem>
                      <SelectItem value="backend developer">Backend Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
                data-testid="button-cancel-employee"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={createEmployeeMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="button-submit-employee"
              >
                {createEmployeeMutation.isPending ? "যোগ করছি..." : "যোগ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Card>
  );
}
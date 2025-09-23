import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, CheckSquare, Plus, Clock, User, Filter, Search, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueDate: Date | null;
  clientId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const todoFormSchema = z.object({
  title: z.string().min(1, "টাইটেল লিখুন"),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.date().optional(),
  clientId: z.string().optional(),
});

export default function TodoList() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<z.infer<typeof todoFormSchema>>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
    },
  });

  // Fetch todos
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["/api/todos"],
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Create todo mutation
  const createTodoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof todoFormSchema>) => {
      const response = await apiRequest("POST", "/api/todos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({ title: "সফল", description: "নতুন টাস্ক যোগ করা হয়েছে!" });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "টাস্ক তৈরি করতে সমস্যা হয়েছে", variant: "destructive" });
    },
  });

  // Update todo mutation
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Todo> }) => {
      const response = await apiRequest("PATCH", `/api/todos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({ title: "সফল", description: "টাস্ক আপডেট হয়েছে!" });
      setEditingTodo(null);
    },
  });

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/todos/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({ title: "সফল", description: "টাস্ক ডিলিট করা হয়েছে!" });
    },
  });

  const onSubmit = (values: z.infer<typeof todoFormSchema>) => {
    // Convert "none" to undefined for clientId
    const processedValues = {
      ...values,
      clientId: values.clientId === "none" ? undefined : values.clientId
    };
    
    if (editingTodo) {
      updateTodoMutation.mutate({ 
        id: editingTodo.id, 
        data: processedValues 
      });
    } else {
      createTodoMutation.mutate(processedValues);
    }
  };

  const toggleTodoStatus = (todo: Todo) => {
    const newStatus = todo.status === "Completed" ? "Pending" : "Completed";
    updateTodoMutation.mutate({
      id: todo.id,
      data: { status: newStatus }
    });
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    form.reset({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      clientId: todo.clientId || undefined,
    });
    setIsCreateDialogOpen(true);
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingTodo(null);
    form.reset();
  };

  const openCreateDialog = () => {
    setEditingTodo(null);
    form.reset({
      title: "",
      description: "",
      priority: "Medium",
      clientId: "none",
    });
    setIsCreateDialogOpen(true);
  };

  // Filter todos
  const filteredTodos = (todos as Todo[]).filter((todo: Todo) => {
    const matchesStatus = statusFilter === "all" || todo.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || todo.priority === priorityFilter;
    const matchesSearch = searchQuery === "" || 
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Sort todos by priority and due date
  const sortedTodos = filteredTodos.sort((a: Todo, b: Todo) => {
    // First by status (Pending, In Progress, Completed)
    const statusOrder = { "Pending": 0, "In Progress": 1, "Completed": 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // Then by priority (High, Medium, Low)
    const priorityOrder = { "High": 0, "Medium": 1, "Low": 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Finally by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    return 0;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "In Progress": return "secondary";
      case "Pending": return "outline";
      default: return "outline";
    }
  };

  const getPriorityBangla = (priority: string) => {
    switch (priority) {
      case "High": return "জরুরি";
      case "Medium": return "মধ্যম";
      case "Low": return "কম";
      default: return priority;
    }
  };

  const getStatusBangla = (status: string) => {
    switch (status) {
      case "Completed": return "সম্পন্ন";
      case "In Progress": return "চলমান";
      case "Pending": return "অপেক্ষমান";
      default: return status;
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">টু-ডু লিস্ট</h1>
          <p className="text-muted-foreground">দৈনন্দিন কাজ ও প্রোজেক্ট টাস্ক পরিচালনা করুন</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-todo" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              নতুন টাস্ক
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTodo ? "টাস্ক এডিট করুন" : "নতুন টাস্ক যোগ করুন"}
              </DialogTitle>
              <DialogDescription>
                {editingTodo ? "টাস্কের তথ্য আপডেট করুন" : "নতুন কাজ বা প্রোজেক্ট টাস্ক যোগ করুন"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>টাস্ক টাইটেল *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="যেমন: ক্লায়েন্ট প্রেজেন্টেশন তৈরি করুন"
                          {...field}
                          data-testid="input-todo-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>বিস্তারিত বিবরণ</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="টাস্কের বিস্তারিত তথ্য"
                          {...field}
                          data-testid="textarea-todo-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>প্রাধিকার</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue placeholder="প্রাধিকার নির্বাচন" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="High">জরুরি</SelectItem>
                            <SelectItem value="Medium">মধ্যম</SelectItem>
                            <SelectItem value="Low">কম</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>শেষ তারিখ</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-due-date"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>তারিখ নির্বাচন</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্লায়েন্ট (ঐচ্ছিক)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="ক্লায়েন্ট নির্বাচন (যদি প্রযোজ্য হয়)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">কোনো ক্লায়েন্ট নেই</SelectItem>
                          {(clients as any[]).map((client: any) => (
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

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={closeDialog}
                    data-testid="button-cancel-todo"
                  >
                    বাতিল
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTodoMutation.isPending || updateTodoMutation.isPending}
                    data-testid="button-submit-todo"
                  >
                    {(createTodoMutation.isPending || updateTodoMutation.isPending) ? "সেভ হচ্ছে..." : 
                     editingTodo ? "আপডেট করুন" : "টাস্ক যোগ করুন"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="টাস্ক খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
            data-testid="input-search-todos"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="Pending">অপেক্ষমান</SelectItem>
            <SelectItem value="In Progress">চলমান</SelectItem>
            <SelectItem value="Completed">সম্পন্ন</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40" data-testid="select-priority-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব প্রাধিকার</SelectItem>
            <SelectItem value="High">জরুরি</SelectItem>
            <SelectItem value="Medium">মধ্যম</SelectItem>
            <SelectItem value="Low">কম</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="outline" data-testid="text-todo-count">
          মোট: {filteredTodos.length} টি টাস্ক
        </Badge>
      </div>

      {/* Todo List */}
      <div className="grid gap-4">
        {sortedTodos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all" 
                  ? "কোনো টাস্ক পাওয়া যায়নি"
                  : "এখনো কোনো টাস্ক যোগ করা হয়নি"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন"
                  : "উপরের বাটনে ক্লিক করে নতুন টাস্ক যোগ করুন"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedTodos.map((todo: Todo) => {
            const client = (clients as any[]).find((c: any) => c.id === todo.clientId);
            const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== "Completed";
            
            return (
              <Card 
                key={todo.id} 
                className={cn(
                  "hover:shadow-md transition-shadow",
                  todo.status === "Completed" && "opacity-75",
                  isOverdue && "border-destructive"
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={todo.status === "Completed"}
                      onCheckedChange={() => toggleTodoStatus(todo)}
                      className="mt-1"
                      data-testid={`checkbox-complete-${todo.id}`}
                    />
                    <div className="flex-1">
                      <CardTitle 
                        className={cn(
                          "text-lg",
                          todo.status === "Completed" && "line-through text-muted-foreground"
                        )}
                        data-testid={`text-todo-title-${todo.id}`}
                      >
                        {todo.title}
                      </CardTitle>
                      {todo.description && (
                        <CardDescription className="mt-1">
                          {todo.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={getPriorityColor(todo.priority)}
                          data-testid={`badge-priority-${todo.id}`}
                        >
                          {getPriorityBangla(todo.priority)}
                        </Badge>
                        <Badge 
                          variant={getStatusColor(todo.status)}
                          data-testid={`badge-status-${todo.id}`}
                        >
                          {getStatusBangla(todo.status)}
                        </Badge>
                        {todo.dueDate && (
                          <Badge 
                            variant={isOverdue ? "destructive" : "outline"}
                            data-testid={`badge-due-date-${todo.id}`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(todo.dueDate), "PPP")}
                            {isOverdue && " (মেয়াদোত্তীর্ণ)"}
                          </Badge>
                        )}
                        {client && (
                          <Badge variant="outline">
                            <User className="h-3 w-3 mr-1" />
                            {client.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(todo)}
                      data-testid={`button-edit-${todo.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTodoMutation.mutate(todo.id)}
                      disabled={deleteTodoMutation.isPending}
                      data-testid={`button-delete-${todo.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
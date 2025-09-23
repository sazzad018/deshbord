import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Clock, User, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

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

interface Client {
  id: string;
  name: string;
}

interface TodoListShortProps {
  selectedClientId?: string;
}

export default function TodoListShort({ selectedClientId }: TodoListShortProps) {
  const { toast } = useToast();
  const [newTodoTitle, setNewTodoTitle] = useState("");

  // Fetch todos
  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Create todo mutation
  const createTodoMutation = useMutation({
    mutationFn: async (todoData: { title: string; priority: string; clientId?: string }) => {
      return await apiRequest("POST", "/api/todos", todoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setNewTodoTitle("");
      toast({
        title: "সফল",
        description: "টাস্ক যোগ করা হয়েছে",
      });
    },
  });

  // Toggle todo status mutation
  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/todos/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  // Filter and sort todos - show only pending and in progress, limit to 5
  const displayTodos = todos
    .filter(todo => todo.status !== "Completed")
    .filter(todo => !selectedClientId || todo.clientId === selectedClientId || !todo.clientId)
    .sort((a, b) => {
      // Sort by priority: High > Medium > Low
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 5); // Limit to 5 items for compact view

  const handleCreateTodo = () => {
    if (!newTodoTitle.trim()) return;
    
    createTodoMutation.mutate({
      title: newTodoTitle.trim(),
      priority: "Medium",
      clientId: selectedClientId,
    });
  };

  const handleToggleTodo = (todo: Todo) => {
    const newStatus = todo.status === "Pending" ? "Completed" : "Pending";
    toggleTodoMutation.mutate({ id: todo.id, status: newStatus });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    const client = clients.find(c => c.id === clientId);
    return client?.name;
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            টুডু লিস্ট
          </CardTitle>
          <Link href="/todos">
            <Button variant="ghost" size="sm" data-testid="link-full-todo">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Quick add todo */}
        <div className="flex gap-2">
          <Input
            placeholder="নতুন টাস্ক যোগ করুন..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateTodo()}
            className="text-sm"
            data-testid="input-quick-todo"
          />
          <Button 
            size="sm" 
            onClick={handleCreateTodo}
            disabled={!newTodoTitle.trim() || createTodoMutation.isPending}
            data-testid="button-add-todo"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Todo list */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {displayTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              কোন টাস্ক নেই
            </p>
          ) : (
            displayTodos.map((todo) => {
              const clientName = getClientName(todo.clientId);
              return (
                <div
                  key={todo.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <Checkbox
                    checked={todo.status === "Completed"}
                    onCheckedChange={() => handleToggleTodo(todo)}
                    className="mt-1"
                    data-testid={`checkbox-todo-${todo.id}`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm ${todo.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>
                        {todo.title}
                      </span>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </Badge>
                    </div>
                    
                    {clientName && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {clientName}
                      </div>
                    )}
                    
                    {todo.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(todo.dueDate).toLocaleDateString('bn-BD')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>মোট: {todos.length}</span>
          <span>সম্পন্ন: {todos.filter(t => t.status === "Completed").length}</span>
        </div>
      </CardContent>
    </Card>
  );
}
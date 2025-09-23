import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Undo2, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";

export default function DeletedClientsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deletedClients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients/deleted"],
  });

  const restoreClientMutation = useMutation({
    mutationFn: (clientId: string) => apiRequest("PATCH", `/api/clients/${clientId}/restore`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients/deleted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "সফল",
        description: "ক্লায়েন্ট পুনরুদ্ধার করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ক্লায়েন্ট পুনরুদ্ধার করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (clientId: string) => apiRequest("DELETE", `/api/clients/${clientId}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients/deleted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "সফল",
        description: "ক্লায়েন্ট স্থায়ীভাবে ডিলিট করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ক্লায়েন্ট স্থায়ীভাবে ডিলিট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">ট্র্যাশ করা ক্লায়েন্ট</CardTitle>
        <p className="text-sm text-muted-foreground">ডিলিট করা ক্লায়েন্টদের তালিকা ও পুনরুদ্ধার</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-testid="table-deleted-clients">
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>জমা</TableHead>
                  <TableHead>খরচ</TableHead>
                  <TableHead>ব্যালেন্স</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8" data-testid="text-no-deleted-clients">
                      কোন ডিলিট করা ক্লায়েন্ট নেই
                    </TableCell>
                  </TableRow>
                ) : (
                  deletedClients.map((client) => {
                    const balance = client.walletDeposited - client.walletSpent;
                    return (
                      <TableRow 
                        key={client.id} 
                        className="opacity-60"
                        data-testid={`row-deleted-client-${client.id}`}
                      >
                        <TableCell className="font-medium" data-testid={`text-deleted-client-name-${client.id}`}>
                          <div className="space-y-1">
                            <div>{client.name}</div>
                            {client.scopes && client.scopes.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {client.scopes.slice(0, 3).map((scope, index) => (
                                  <Badge key={index} variant="outline" className="text-xs px-1 py-0 opacity-60">
                                    {scope}
                                  </Badge>
                                ))}
                                {client.scopes.length > 3 && (
                                  <Badge variant="outline" className="text-xs px-1 py-0 opacity-60">
                                    +{client.scopes.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800" data-testid={`badge-deleted-client-status-${client.id}`}>
                            ডিলিট হয়েছে
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-deleted-client-deposited-${client.id}`}>
                          {formatCurrency(client.walletDeposited)}
                        </TableCell>
                        <TableCell data-testid={`text-deleted-client-spent-${client.id}`}>
                          {formatCurrency(client.walletSpent)}
                        </TableCell>
                        <TableCell 
                          className={balance < 0 ? "text-red-600" : "text-green-600"}
                          data-testid={`text-deleted-client-balance-${client.id}`}
                        >
                          {formatCurrency(balance)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => {
                                if (confirm("আপনি কি নিশ্চিত যে এই ক্লায়েন্টটি পুনরুদ্ধার করতে চান?")) {
                                  restoreClientMutation.mutate(client.id);
                                }
                              }}
                              disabled={restoreClientMutation.isPending}
                              data-testid={`button-restore-client-${client.id}`}
                            >
                              <Undo2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm("আপনি কি নিশ্চিত যে এই ক্লায়েন্টটি স্থায়ীভাবে ডিলিট করতে চান? এটি আর পুনরুদ্ধার করা যাবে না।")) {
                                  permanentDeleteMutation.mutate(client.id);
                                }
                              }}
                              disabled={permanentDeleteMutation.isPending}
                              data-testid={`button-permanent-delete-client-${client.id}`}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
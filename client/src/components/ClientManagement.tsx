import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import { createClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";

interface ClientManagementProps {
  query: string;
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
}

export default function ClientManagement({ query, selectedClientId, onSelectClient }: ClientManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    fb: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setIsDialogOpen(false);
      setNewClient({ name: "", phone: "", fb: "" });
      toast({
        title: "সফল",
        description: "নতুন ক্লায়েন্ট সফলভাবে যোগ করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ক্লায়েন্ট যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const handleCreateClient = () => {
    if (!newClient.name.trim() || !newClient.phone.trim()) {
      toast({
        title: "ত্রুটি",
        description: "নাম এবং ফোন নাম্বার আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    createClientMutation.mutate({
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      fb: newClient.fb.trim() || undefined,
      status: "Active",
      scopes: ["Facebook Marketing"],
    });
  };

  const filteredClients = clients.filter(client => {
    if (!query.trim()) return true;
    const searchTerm = query.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchTerm) ||
      client.phone.includes(searchTerm) ||
      client.scopes.some(scope => scope.toLowerCase().includes(searchTerm))
    );
  });

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">ক্লায়েন্ট ম্যানেজমেন্ট</CardTitle>
          <p className="text-sm text-muted-foreground">সব ক্লায়েন্টের তথ্য এবং ওয়ালেট স্ট্যাটাস</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-add-client">
              <Plus className="h-4 w-4" />
              নতুন ক্লায়েন্ট
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>নতুন ক্লায়েন্ট যোগ করুন</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                data-testid="input-client-name"
                placeholder="ক্লায়েন্টের নাম"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
              <Input
                data-testid="input-client-phone"
                placeholder="হোয়াটসঅ্যাপ/ফোন নাম্বার"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
              <Input
                data-testid="input-client-fb"
                placeholder="ফেসবুক পেইজ লিংক (ঐচ্ছিক)"
                value={newClient.fb}
                onChange={(e) => setNewClient({ ...newClient, fb: e.target.value })}
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-client"
                >
                  বাতিল
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateClient}
                  disabled={createClientMutation.isPending}
                  data-testid="button-create-client"
                >
                  {createClientMutation.isPending ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
            <Table data-testid="table-clients">
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
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8" data-testid="text-no-clients">
                      কোন ক্লায়েন্ট পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
                    const balance = client.walletDeposited - client.walletSpent;
                    return (
                      <TableRow 
                        key={client.id} 
                        className={selectedClientId === client.id ? "bg-slate-50" : ""}
                        data-testid={`row-client-${client.id}`}
                      >
                        <TableCell className="font-medium" data-testid={`text-client-name-${client.id}`}>
                          {client.name}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800" data-testid={`badge-client-status-${client.id}`}>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-client-deposited-${client.id}`}>
                          {formatCurrency(client.walletDeposited)}
                        </TableCell>
                        <TableCell data-testid={`text-client-spent-${client.id}`}>
                          {formatCurrency(client.walletSpent)}
                        </TableCell>
                        <TableCell 
                          className={balance < 0 ? "text-red-600" : "text-green-600"}
                          data-testid={`text-client-balance-${client.id}`}
                        >
                          {formatCurrency(balance)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSelectClient(client.id)}
                            data-testid={`button-select-client-${client.id}`}
                          >
                            নির্বাচন করুন
                          </Button>
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

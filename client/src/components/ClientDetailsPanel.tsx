import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, TrendingUp, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Client, ClientWithLogs, ClientWithDetails, ServiceScope, CompanySettings } from "@shared/schema";
import { createDualCurrencyDisplay, DEFAULT_USD_RATE } from "@shared/currency-utils";

interface ClientDetailsPanelProps {
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
}

export default function ClientDetailsPanel({ selectedClientId, onSelectClient }: ClientDetailsPanelProps) {
  const [isServiceScopeDialogOpen, setIsServiceScopeDialogOpen] = useState(false);
  const [newServiceScope, setNewServiceScope] = useState({
    serviceName: "",
    scope: "",
    notes: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: clientDetails } = useQuery<ClientWithDetails>({
    queryKey: ["/api/clients", selectedClientId, "details"],
    enabled: !!selectedClientId,
  });

  // Fetch company settings for USD exchange rate
  const { data: companySettings } = useQuery<CompanySettings>({ 
    queryKey: ['/api/company-settings'] 
  });

  const exchangeRate = companySettings?.usdExchangeRate || DEFAULT_USD_RATE;


  const createServiceScopeMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/service-scopes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", selectedClientId, "details"] });
      setIsServiceScopeDialogOpen(false);
      setNewServiceScope({ serviceName: "", scope: "", notes: "" });
      toast({ title: "সার্ভিস স্কোপ যুক্ত হয়েছে", variant: "default" });
    },
    onError: () => {
      toast({ title: "সার্ভিস স্কোপ যুক্ত করতে সমস্যা হয়েছে", variant: "destructive" });
    },
  });

  const deleteServiceScopeMutation = useMutation({
    mutationFn: (scopeId: string) => apiRequest("DELETE", `/api/service-scopes/${scopeId}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", selectedClientId, "details"] });
      toast({ title: "সার্ভিস স্কোপ ডিলিট হয়েছে", variant: "default" });
    },
    onError: () => {
      toast({ title: "সার্ভিস স্কোপ ডিলিট করতে সমস্যা হয়েছে", variant: "destructive" });
    },
  });

  const selectedClient = clientDetails || clients.find(c => c.id === selectedClientId);

  const handleCreateServiceScope = () => {
    if (!selectedClientId || !newServiceScope.serviceName || !newServiceScope.scope) {
      toast({ title: "সব ফিল্ড পূরণ করুন", variant: "destructive" });
      return;
    }

    createServiceScopeMutation.mutate({
      clientId: selectedClientId,
      serviceName: newServiceScope.serviceName,
      scope: newServiceScope.scope,
      notes: newServiceScope.notes || null,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">ক্লায়েন্ট বিস্তারিত</CardTitle>
          <Select value={selectedClientId} onValueChange={onSelectClient}>
            <SelectTrigger data-testid="select-client-details">
              <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id} data-testid={`option-client-${client.id}`}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        
        <CardContent className="pt-0" data-testid="content-client-details">
          {!selectedClient ? (
            <div className="text-center text-muted-foreground py-8">
              একটি ক্লায়েন্ট নির্বাচন করুন
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Picture Section */}
              {(clientDetails?.profilePicture || selectedClient.profilePicture) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">প্রোফাইল ছবি</label>
                  <div className="mt-2 flex items-center gap-3">
                    <img 
                      src={clientDetails?.profilePicture || selectedClient.profilePicture || ''} 
                      alt={`${selectedClient.name} এর প্রোফাইল ছবি`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      data-testid="img-client-profile-picture"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">নাম</label>
                <p className="font-medium" data-testid="text-client-details-name">{selectedClient.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">ফোন</label>
                <p data-testid="text-client-details-phone">{selectedClient.phone}</p>
              </div>
              
              {selectedClient.fb && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ফেসবুক</label>
                  <a 
                    href={selectedClient.fb} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline block"
                    data-testid="link-client-details-fb"
                  >
                    {selectedClient.fb}
                  </a>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">ব্যালেন্স</label>
                <div className={`font-semibold ${(selectedClient.walletDeposited - selectedClient.walletSpent) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  <p data-testid="text-client-details-balance">
                    {formatCurrency(selectedClient.walletDeposited - selectedClient.walletSpent)}
                  </p>
                  {exchangeRate && (
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {createDualCurrencyDisplay((selectedClient.walletDeposited - selectedClient.walletSpent) * 100, exchangeRate).usd}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">সার্ভিস স্কোপ</label>
                <div className="flex flex-wrap gap-1 mt-1" data-testid="div-client-details-scopes">
                  {selectedClient.scopes.map((scope, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Admin Notes Section */}
              {(clientDetails?.adminNotes || selectedClient.adminNotes) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">এডমিন নোট</label>
                  <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800" data-testid="text-client-admin-notes">
                      {clientDetails?.adminNotes || selectedClient.adminNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Portal Link Section */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">ক্লায়েন্ট পোর্টাল</label>
                <div className="mt-1 flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/clients/${selectedClient.id}/details`);
                        const data = await response.json();
                        if (data.portalKey) {
                          window.open(`/portal/${data.portalKey}`, '_blank');
                        }
                      } catch (error) {
                        console.error('Failed to get portal key:', error);
                      }
                    }}
                    data-testid="button-open-client-portal"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    পোর্টাল খুলুন
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Scope Management Section */}
      {selectedClient && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">সার্ভিস স্কোপ ব্যবস্থাপনা</CardTitle>
              <Dialog open={isServiceScopeDialogOpen} onOpenChange={setIsServiceScopeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-service-scope">
                    <Plus className="h-4 w-4 mr-1" />
                    যুক্ত করুন
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>নতুন সার্ভিস স্কোপ যুক্ত করুন</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="serviceName">সার্ভিস নাম</Label>
                      <Select value={newServiceScope.serviceName} onValueChange={(value) => 
                        setNewServiceScope(prev => ({ ...prev, serviceName: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="সার্ভিস নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ওয়েবসাইট">ওয়েবসাইট</SelectItem>
                          <SelectItem value="ল্যান্ডিং পেজ">ল্যান্ডিং পেজ</SelectItem>
                          <SelectItem value="Facebook Marketing">Facebook Marketing</SelectItem>
                          <SelectItem value="SEO">SEO</SelectItem>
                          <SelectItem value="Social Media Management">Social Media Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="scope">স্কোপ বিবরণ</Label>
                      <Textarea
                        id="scope"
                        value={newServiceScope.scope}
                        onChange={(e) => setNewServiceScope(prev => ({ ...prev, scope: e.target.value }))}
                        placeholder="সার্ভিসের বিস্তারিত বিবরণ লিখুন..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">নোট (ঐচ্ছিক)</Label>
                      <Textarea
                        id="notes"
                        value={newServiceScope.notes}
                        onChange={(e) => setNewServiceScope(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="অতিরিক্ত মন্তব্য..."
                        rows={2}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateServiceScope}
                      disabled={createServiceScopeMutation.isPending}
                      className="w-full"
                      data-testid="button-create-service-scope"
                    >
                      {createServiceScopeMutation.isPending ? "যুক্ত হচ্ছে..." : "সার্ভিস স্কোপ যুক্ত করুন"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            {clientDetails?.serviceScopes && clientDetails.serviceScopes.length > 0 ? (
              <div className="space-y-3">
                {clientDetails.serviceScopes.map((scope) => (
                  <div key={scope.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{scope.serviceName}</Badge>
                          <Badge variant={scope.status === "Active" ? "default" : "secondary"}>
                            {scope.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{scope.scope}</p>
                        {scope.notes && (
                          <p className="text-xs text-gray-500">{scope.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          শুরু: {new Date(scope.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Future: Add edit functionality
                            toast({ title: "Edit functionality coming soon", variant: "default" });
                          }}
                          data-testid={`button-edit-scope-${scope.id}`}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm("আপনি কি নিশ্চিত যে এই সার্ভিস স্কোপটি ডিলিট করতে চান?")) {
                              deleteServiceScopeMutation.mutate(scope.id);
                            }
                          }}
                          disabled={deleteServiceScopeMutation.isPending}
                          data-testid={`button-delete-scope-${scope.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                কোনো সার্ভিস স্কোপ নেই
              </div>
            )}
          </CardContent>
        </Card>
      )}



    </div>
  );
}

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
import { Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Client, ClientWithLogs, ClientWithDetails, ServiceScope, ServiceAnalytics } from "@shared/schema";

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

  const { data: websiteAnalytics } = useQuery<ServiceAnalytics>({
    queryKey: ["/api/service-analytics", "ওয়েবসাইট"],
  });

  const { data: landingPageAnalytics } = useQuery<ServiceAnalytics>({
    queryKey: ["/api/service-analytics", "ল্যান্ডিং পেজ"],
  });

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
                <p 
                  className={`font-semibold ${(selectedClient.walletDeposited - selectedClient.walletSpent) < 0 ? 'text-red-600' : 'text-green-600'}`}
                  data-testid="text-client-details-balance"
                >
                  {formatCurrency(selectedClient.walletDeposited - selectedClient.walletSpent)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">সার্ভিস স্কোপ</label>
                <div className="flex flex-wrap gap-1 mt-1" data-testid="div-client-details-scopes">
                  {selectedClient.scopes.map((scope, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
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


      {/* Website Services Section */}
      {selectedClient && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">ওয়েবসাইট সার্ভিস প্রজেক্ট</CardTitle>
              <Button size="sm" data-testid="button-add-website-project">
                <Plus className="h-4 w-4 mr-1" />
                নতুন প্রজেক্ট
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {/* Sample Website Projects - will be replaced with real data */}
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="bg-green-600">সম্পন্ন</Badge>
                      <span className="font-medium">ই-কমার্স ওয়েবসাইট</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      সম্পূর্ণ রেসপন্সিভ ই-কমার্স সাইট, পেমেন্ট গেটওয়ে সহ
                    </p>
                    <div className="flex items-center gap-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`/portal/${selectedClient.portalKey}`, '_blank')}
                        data-testid="button-client-portal"
                      >
                        ক্লায়েন্ট পোর্টাল
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('https://example-site.com', '_blank')}
                      >
                        লাইভ সাইট দেখুন
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      সম্পন্ন: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-blue-600 text-white">চলমান</Badge>
                      <span className="font-medium">কর্পোরেট ওয়েবসাইট</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      প্রফেশনাল কর্পোরেট সাইট ডিজাইন এবং ডেভেলপমেন্ট
                    </p>
                    <div className="flex items-center gap-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`/portal/${selectedClient.portalKey}`, '_blank')}
                        data-testid="button-client-portal-2"
                      >
                        ক্লায়েন্ট পোর্টাল
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled
                      >
                        ডেভেলপমেন্ট চলছে
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      শুরু: {new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  ক্লায়েন্ট পোর্টাল দিয়ে আপনার ক্লায়েন্ট তাদের প্রজেক্টের অগ্রগতি এবং খরচের বিস্তারিত দেখতে পারবেন
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Service Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ওয়েবসাইট সার্ভিস (৭ দিন)
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {websiteAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট ক্লায়েন্ট</p>
                    <p className="text-2xl font-bold">{websiteAnalytics.totalClients}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">সক্রিয় প্রজেক্ট</p>
                    <p className="text-2xl font-bold">{websiteAnalytics.activeScopes}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">সাম্প্রতিক খরচ</p>
                  <div className="space-y-1">
                    {websiteAnalytics.last7DaysSpending.map((day, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{new Date(day.date).toLocaleDateString()}</span>
                        <span>৳{day.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                ডেটা লোড হচ্ছে...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ল্যান্ডিং পেজ সার্ভিস (৭ দিন)
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {landingPageAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">মোট ক্লায়েন্ট</p>
                    <p className="text-2xl font-bold">{landingPageAnalytics.totalClients}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">সক্রিয় প্রজেক্ট</p>
                    <p className="text-2xl font-bold">{landingPageAnalytics.activeScopes}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">সাম্প্রতিক খরচ</p>
                  <div className="space-y-1">
                    {landingPageAnalytics.last7DaysSpending.map((day, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{new Date(day.date).toLocaleDateString()}</span>
                        <span>৳{day.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                ডেটা লোড হচ্ছে...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

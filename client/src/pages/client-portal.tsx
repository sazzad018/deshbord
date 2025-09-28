import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Wallet, Receipt, TrendingUp, Globe, ArrowLeft, CreditCard, Send, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ClientWithDetails, PaymentRequest } from "@shared/schema";

export default function ClientPortal() {
  const [match, params] = useRoute("/portal/:portalKey");
  const [clientData, setClientData] = useState<ClientWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "",
    accountNumber: "",
    transactionId: "",
    note: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payment requests for this client
  const { data: paymentRequests = [] } = useQuery<PaymentRequest[]>({
    queryKey: [`/api/clients/${clientData?.id}/payment-requests`],
    enabled: !!clientData?.id
  });

  // Create payment request mutation
  const createPaymentRequestMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/payment-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientData?.id}/payment-requests`] });
      setPaymentDialogOpen(false);
      resetPaymentForm();
      toast({
        title: "সফল",
        description: "পেমেন্ট রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "পেমেন্ট রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: "",
      paymentMethod: "",
      accountNumber: "",
      transactionId: "",
      note: ""
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientData?.id) return;
    
    const amount = parseInt(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "ত্রুটি",
        description: "সঠিক পরিমাণ লিখুন",
        variant: "destructive",
      });
      return;
    }

    if (!paymentForm.paymentMethod) {
      toast({
        title: "ত্রুটি", 
        description: "পেমেন্ট মেথড নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    createPaymentRequestMutation.mutate({
      clientId: clientData.id,
      amount: amount,
      paymentMethod: paymentForm.paymentMethod,
      accountNumber: paymentForm.accountNumber || null,
      transactionId: paymentForm.transactionId || null,
      note: paymentForm.note || null,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />অনুমোদিত</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />প্রত্যাখ্যাত</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />অপেক্ষমান</Badge>;
    }
  };

  // Fetch client data by portal key
  useEffect(() => {
    const fetchClientData = async () => {
      if (!params?.portalKey) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/clients/portal/${params.portalKey}`);
        
        if (!response.ok) {
          throw new Error("ক্লায়েন্ট তথ্য পাওয়া যায়নি");
        }
        
        const data = await response.json();
        setClientData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "কিছু সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [params?.portalKey]);

  if (!match) {
    return <div>পেজ পাওয়া যায়নি</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-red-600 text-lg">{error || "ক্লায়েন্ট তথ্য পাওয়া যায়নি"}</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  const currentBalance = clientData.walletDeposited - clientData.walletSpent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50/80 via-white/95 to-purple-50/80 border-b border-violet-200/60 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 p-3 rounded-2xl shadow-xl ring-4 ring-white/30">
                <User className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 bg-clip-text text-transparent">স্বাগতম, {clientData.name}</h1>
                <p className="text-slate-600 mt-1 text-lg">আপনার প্রজেক্ট এবং ব্যালেন্সের বিস্তারিত তথ্য</p>
              </div>
            </div>
            <Badge 
              variant={clientData.status === "Active" ? "default" : "secondary"}
              className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300/60 shadow-sm font-semibold rounded-xl px-4 py-2 text-lg"
            >
              {clientData.status === "Active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <Card className="rounded-3xl shadow-lg border-2 border-emerald-200/60 bg-emerald-50/70 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-md ring-2 ring-white/20">
                  <Wallet className="h-5 w-5 text-white drop-shadow-sm" />
                </div>
                <span className="text-emerald-700 font-semibold">মোট জমা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-emerald-800 tracking-tight">
                ৳{clientData.walletDeposited.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-2 border-rose-200/60 bg-rose-50/70 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-500 shadow-md ring-2 ring-white/20">
                  <Receipt className="h-5 w-5 text-white drop-shadow-sm" />
                </div>
                <span className="text-rose-700 font-semibold">মোট খরচ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-rose-800 tracking-tight">
                ৳{clientData.walletSpent.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-2 border-blue-200/60 bg-blue-50/70 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-md ring-2 ring-white/20">
                  <TrendingUp className="h-5 w-5 text-white drop-shadow-sm" />
                </div>
                <span className="text-blue-700 font-semibold">বর্তমান ব্যালেন্স</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-3xl font-bold tracking-tight ${currentBalance >= 0 ? 'text-blue-800' : 'text-rose-800'}`}>
                ৳{currentBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Request Section */}
        <Card className="rounded-3xl shadow-lg border-2 border-purple-200/60 bg-gradient-to-br from-purple-50/70 to-violet-50/70 mb-10 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 shadow-xl ring-2 ring-white/20">
                <CreditCard className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 bg-clip-text text-transparent">পেমেন্ট রিকোয়েস্ট</span>
            </CardTitle>
            <p className="text-slate-600 text-base ml-16">আপনার অ্যাকাউন্টে টাকা জমা দিতে রিকোয়েস্ট পাঠান</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700" 
                    data-testid="button-new-payment-request"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    নতুন পেমেন্ট রিকোয়েস্ট
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>পেমেন্ট রিকোয়েস্ট পাঠান</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">পরিমাণ (টাকা)</label>
                      <Input
                        type="number"
                        placeholder="উদাহরণ: 5000"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                        required
                        data-testid="input-payment-amount"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">পেমেন্ট মেথড</label>
                      <Select 
                        value={paymentForm.paymentMethod} 
                        onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}
                      >
                        <SelectTrigger data-testid="select-payment-method">
                          <SelectValue placeholder="পেমেন্ট মেথড নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bKash">bKash</SelectItem>
                          <SelectItem value="Nagad">Nagad</SelectItem>
                          <SelectItem value="Rocket">Rocket</SelectItem>
                          <SelectItem value="Bank">ব্যাংক ট্রান্সফার</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">অ্যাকাউন্ট নম্বর (যেখান থেকে টাকা পাঠিয়েছেন)</label>
                      <Input
                        placeholder="উদাহরণ: 01712345678"
                        value={paymentForm.accountNumber}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                        data-testid="input-account-number"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">ট্রান্সঅ্যাকশন আইডি</label>
                      <Input
                        placeholder="উদাহরণ: ABC123XYZ789"
                        value={paymentForm.transactionId}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                        data-testid="input-transaction-id"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">নোট (ঐচ্ছিক)</label>
                      <Textarea
                        placeholder="অতিরিক্ত কোনো তথ্য..."
                        value={paymentForm.note}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, note: e.target.value }))}
                        data-testid="textarea-payment-note"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={createPaymentRequestMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                        data-testid="button-submit-payment-request"
                      >
                        {createPaymentRequestMutation.isPending ? "পাঠানো হচ্ছে..." : "রিকোয়েস্ট পাঠান"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setPaymentDialogOpen(false)}
                        data-testid="button-cancel-payment-request"
                      >
                        বাতিল
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <div className="text-sm text-gray-600">
                <p className="mb-1">সমর্থিত পেমেন্ট মেথড: bKash, Nagad, Rocket, ব্যাংক ট্রান্সফার</p>
                <p>রিকোয়েস্ট অনুমোদনের পর আপনার ব্যালেন্স আপডেট হবে</p>
              </div>
            </div>

            {/* Payment Request History */}
            {paymentRequests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">সাম্প্রতিক পেমেন্ট রিকোয়েস্ট</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>তারিখ</TableHead>
                        <TableHead>পরিমাণ</TableHead>
                        <TableHead>মেথড</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead>নোট</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentRequests
                        .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                        .slice(0, 5)
                        .map((request) => (
                        <TableRow key={request.id} data-testid={`row-payment-request-${request.id}`}>
                          <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">৳{request.amount.toLocaleString()}</TableCell>
                          <TableCell>{request.paymentMethod}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {request.note || "—"}
                            {request.adminNote && (
                              <div className="text-xs text-gray-500 mt-1">
                                অ্যাডমিন নোট: {request.adminNote}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">আপনার তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">নাম</p>
                <p className="font-medium">{clientData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ফোন</p>
                <p className="font-medium">{clientData.phone}</p>
              </div>
              {clientData.fb && (
                <div>
                  <p className="text-sm text-gray-600">ফেসবুক</p>
                  <a href={clientData.fb} target="_blank" rel="noopener noreferrer" 
                     className="text-purple-600 hover:underline text-sm">
                    Facebook Profile
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-2">সার্ভিস স্কোপ</p>
                <div className="flex flex-wrap gap-1">
                  {clientData.scopes.map((scope, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Service Scopes */}
          <Card className="lg:col-span-2 rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">সক্রিয় সার্ভিস স্কোপ</CardTitle>
            </CardHeader>
            <CardContent>
              {clientData.serviceScopes && clientData.serviceScopes.length > 0 ? (
                <div className="space-y-3">
                  {clientData.serviceScopes
                    .filter(scope => scope.status === "Active")
                    .map((scope) => (
                    <div key={scope.id} className="border rounded-lg p-3 bg-purple-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="default" className="bg-purple-600">{scope.serviceName}</Badge>
                          </div>
                          <p className="text-sm text-gray-700">{scope.scope}</p>
                          {scope.notes && (
                            <p className="text-xs text-gray-500 mt-1">{scope.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  কোনো সক্রিয় সার্ভিস স্কোপ নেই
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Spending History */}
        <Card className="rounded-2xl shadow-sm mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">খরচের ইতিহাস</CardTitle>
            <p className="text-sm text-gray-600">আপনার সাম্প্রতিক লেনদেনের বিস্তারিত</p>
          </CardHeader>
          <CardContent>
            {clientData.logs && clientData.logs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>খরচ</TableHead>
                    <TableHead>বিবরণ</TableHead>
                    <TableHead className="text-right">ব্যালেন্স</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientData.logs
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10) // Show last 10 transactions
                    .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-red-600 font-medium">
                        -৳{log.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{log.note || "—"}</TableCell>
                      <TableCell className={`text-right font-medium ${log.balanceAfter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ৳{log.balanceAfter.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-8">
                কোনো লেনদেনের ইতিহাস নেই
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>আরো তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন</p>
          <p className="mt-1">© {new Date().getFullYear()} Social Ads Expert</p>
        </div>
      </div>
    </div>
  );
}
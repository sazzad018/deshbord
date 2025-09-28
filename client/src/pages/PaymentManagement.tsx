import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, CheckCircle, XCircle, Clock, User, DollarSign, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PaymentRequest, Client } from "@shared/schema";

export default function PaymentManagement() {
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentRequests = [], isLoading } = useQuery<PaymentRequest[]>({
    queryKey: ["/api/payment-requests"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const approvePaymentMutation = useMutation({
    mutationFn: (data: { id: string; adminNote?: string; processedBy?: string }) => 
      apiRequest("PATCH", `/api/payment-requests/${data.id}/approve`, {
        adminNote: data.adminNote,
        processedBy: data.processedBy
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setApproveDialogOpen(false);
      setSelectedRequest(null);
      setAdminNote("");
      toast({
        title: "সফল",
        description: "পেমেন্ট রিকোয়েস্ট অনুমোদন করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "পেমেন্ট রিকোয়েস্ট অনুমোদন করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: (data: { id: string; adminNote?: string; processedBy?: string }) => 
      apiRequest("PATCH", `/api/payment-requests/${data.id}/reject`, {
        adminNote: data.adminNote,
        processedBy: data.processedBy
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-requests"] });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setAdminNote("");
      toast({
        title: "সফল",
        description: "পেমেন্ট রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "পেমেন্ট রিকোয়েস্ট প্রত্যাখ্যান করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

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

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "অজানা ক্লায়েন্ট";
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    
    approvePaymentMutation.mutate({
      id: selectedRequest.id,
      adminNote: adminNote.trim() || undefined,
      processedBy: "Admin" // You can replace this with actual admin user info
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    
    rejectPaymentMutation.mutate({
      id: selectedRequest.id,
      adminNote: adminNote.trim() || undefined,
      processedBy: "Admin" // You can replace this with actual admin user info
    });
  };

  const pendingRequests = paymentRequests.filter(req => req.status === "Pending");
  const processedRequests = paymentRequests.filter(req => req.status !== "Pending");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2 flex items-center justify-center gap-3">
            <CreditCard className="h-8 w-8 text-purple-600" />
            পেমেন্ট ম্যানেজমেন্ট
          </h1>
          <p className="text-center text-gray-600">ক্লায়েন্টদের পেমেন্ট রিকোয়েস্ট দেখুন এবং অনুমোদন/প্রত্যাখ্যান করুন</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                অপেক্ষমান রিকোয়েস্ট
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingRequests.length}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                অনুমোদিত রিকোয়েস্ট
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-green-600">
                {paymentRequests.filter(req => req.status === "Approved").length}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                মোট অপেক্ষমান পরিমাণ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-purple-600">
                ৳{pendingRequests.reduce((sum, req) => sum + req.amount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="rounded-2xl shadow-sm mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-yellow-700">
                অপেক্ষমান পেমেন্ট রিকোয়েস্ট ({pendingRequests.length})
              </CardTitle>
              <p className="text-sm text-gray-600">এই রিকোয়েস্টগুলো অনুমোদন বা প্রত্যাখ্যানের অপেক্ষায় আছে</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ক্লায়েন্ট</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead>মেথড</TableHead>
                      <TableHead>ট্রান্সঅ্যাকশন আইডি</TableHead>
                      <TableHead>অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests
                      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                      .map((request) => (
                      <TableRow key={request.id} data-testid={`row-pending-payment-${request.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {getClientName(request.clientId)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-purple-600">৳{request.amount.toLocaleString()}</TableCell>
                        <TableCell>{request.paymentMethod}</TableCell>
                        <TableCell className="text-sm">{request.transactionId || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setDetailsDialogOpen(true);
                              }}
                              data-testid={`button-view-${request.id}`}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              দেখুন
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                setSelectedRequest(request);
                                setApproveDialogOpen(true);
                              }}
                              data-testid={`button-approve-${request.id}`}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              অনুমোদন
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedRequest(request);
                                setRejectDialogOpen(true);
                              }}
                              data-testid={`button-reject-${request.id}`}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              প্রত্যাখ্যান
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Payment Requests History */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">সকল পেমেন্ট রিকোয়েস্ট</CardTitle>
            <p className="text-sm text-gray-600">অতীতের সকল পেমেন্ট রিকোয়েস্টের ইতিহাস</p>
          </CardHeader>
          <CardContent>
            {paymentRequests.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ক্লায়েন্ট</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead>মেথড</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead>প্রসেসিং তারিখ</TableHead>
                      <TableHead>অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRequests
                      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                      .map((request) => (
                      <TableRow key={request.id} data-testid={`row-all-payment-${request.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {getClientName(request.clientId)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-purple-600">৳{request.amount.toLocaleString()}</TableCell>
                        <TableCell>{request.paymentMethod}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.processedDate ? new Date(request.processedDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setDetailsDialogOpen(true);
                            }}
                            data-testid={`button-view-all-${request.id}`}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            দেখুন
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                কোনো পেমেন্ট রিকোয়েস্ট নেই
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>পেমেন্ট রিকোয়েস্টের বিস্তারিত</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">ক্লায়েন্ট</label>
                    <p className="font-medium">{getClientName(selectedRequest.clientId)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">পরিমাণ</label>
                    <p className="font-medium text-purple-600">৳{selectedRequest.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">পেমেন্ট মেথড</label>
                    <p className="font-medium">{selectedRequest.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">স্ট্যাটাস</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">রিকোয়েস্ট তারিখ</label>
                    <p className="font-medium">{new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                  </div>
                  {selectedRequest.processedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">প্রসেসিং তারিখ</label>
                      <p className="font-medium">{new Date(selectedRequest.processedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                
                {selectedRequest.accountNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">অ্যাকাউন্ট নম্বর</label>
                    <p className="font-medium">{selectedRequest.accountNumber}</p>
                  </div>
                )}
                
                {selectedRequest.transactionId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">ট্রান্সঅ্যাকশন আইডি</label>
                    <p className="font-medium">{selectedRequest.transactionId}</p>
                  </div>
                )}
                
                {selectedRequest.note && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">ক্লায়েন্ট নোট</label>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedRequest.note}</p>
                  </div>
                )}
                
                {selectedRequest.adminNote && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">অ্যাডমিন নোট</label>
                    <p className="text-sm bg-purple-50 p-3 rounded-lg">{selectedRequest.adminNote}</p>
                  </div>
                )}
                
                {selectedRequest.processedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">প্রসেসিং করেছেন</label>
                    <p className="font-medium">{selectedRequest.processedBy}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>পেমেন্ট রিকোয়েস্ট অনুমোদন করুন</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">রিকোয়েস্ট তথ্য:</h4>
                  <p className="text-sm text-green-700">ক্লায়েন্ট: {getClientName(selectedRequest.clientId)}</p>
                  <p className="text-sm text-green-700">পরিমাণ: ৳{selectedRequest.amount.toLocaleString()}</p>
                  <p className="text-sm text-green-700">মেথড: {selectedRequest.paymentMethod}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">অ্যাডমিন নোট (ঐচ্ছিক)</label>
                  <Textarea
                    placeholder="অনুমোদনের কোনো নোট..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    data-testid="textarea-admin-note-approve"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={approvePaymentMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-confirm-approve"
                  >
                    {approvePaymentMutation.isPending ? "অনুমোদন করা হচ্ছে..." : "অনুমোদন করুন"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setApproveDialogOpen(false);
                      setAdminNote("");
                    }}
                    data-testid="button-cancel-approve"
                  >
                    বাতিল
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>পেমেন্ট রিকোয়েস্ট প্রত্যাখ্যান করুন</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800">রিকোয়েস্ট তথ্য:</h4>
                  <p className="text-sm text-red-700">ক্লায়েন্ট: {getClientName(selectedRequest.clientId)}</p>
                  <p className="text-sm text-red-700">পরিমাণ: ৳{selectedRequest.amount.toLocaleString()}</p>
                  <p className="text-sm text-red-700">মেথড: {selectedRequest.paymentMethod}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">প্রত্যাখ্যানের কারণ</label>
                  <Textarea
                    placeholder="প্রত্যাখ্যানের কারণ লিখুন..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    required
                    data-testid="textarea-admin-note-reject"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={rejectPaymentMutation.isPending || !adminNote.trim()}
                    variant="destructive"
                    data-testid="button-confirm-reject"
                  >
                    {rejectPaymentMutation.isPending ? "প্রত্যাখ্যান করা হচ্ছে..." : "প্রত্যাখ্যান করুন"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setRejectDialogOpen(false);
                      setAdminNote("");
                    }}
                    data-testid="button-cancel-reject"
                  >
                    বাতিল
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
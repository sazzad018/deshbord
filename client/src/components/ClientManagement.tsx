import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trash2, Upload, X, Power, PowerOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils-dashboard";
import { createClient } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DeletedClientsView from "./DeletedClientsView";
import type { Client } from "@shared/schema";

interface ClientManagementProps {
  query: string;
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
}

export default function ClientManagement({ query, selectedClientId, onSelectClient }: ClientManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    fb: "",
    profilePicture: "",
    adminNotes: "",
  });
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  
  const CLIENTS_PER_PAGE = 20;
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      resetForm();
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

  const trashClientMutation = useMutation({
    mutationFn: (clientId: string) => apiRequest("PATCH", `/api/clients/${clientId}/trash`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "সফল",
        description: "ক্লায়েন্ট ট্র্যাশে পাঠানো হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ক্লায়েন্ট ট্র্যাশে পাঠাতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const toggleActiveStatusMutation = useMutation({
    mutationFn: (clientId: string) => apiRequest("PATCH", `/api/clients/${clientId}/toggle-active`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "সফল",
        description: "ক্লায়েন্টের স্ট্যাটাস পরিবর্তন করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ক্লায়েন্টের স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (uploadData: { dataUrl: string; fileName: string }) => {
      const response = await apiRequest("POST", "/api/uploads", uploadData);
      const data = await response.json();
      return data;
    },
    onSuccess: (data: any) => {
      if (data && data.url) {
        setNewClient({ ...newClient, profilePicture: data.url });
      }
      setIsUploading(false);
      toast({
        title: "সফল",
        description: "ছবি সফলভাবে আপলোড হয়েছে",
      });
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      setIsUploading(false);
      toast({
        title: "ত্রুটি",
        description: error.message || "ছবি আপলোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // File upload handlers
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "ত্রুটি",
        description: "শুধুমাত্র ছবি ফাইল নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "ত্রুটি",
        description: "ছবির সাইজ ২ মেগাবাইটের কম হতে হবে",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImagePreview(dataUrl);
      
      uploadImageMutation.mutate({
        dataUrl,
        fileName: file.name,
      });
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "ত্রুটি",
        description: "ছবি পড়তে সমস্যা হয়েছে",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImagePreview("");
    setNewClient({ ...newClient, profilePicture: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setNewClient({ name: "", phone: "", fb: "", profilePicture: "", adminNotes: "" });
    setUploadedImagePreview("");
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      profilePicture: newClient.profilePicture.trim() || undefined,
      adminNotes: newClient.adminNotes.trim() || undefined,
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

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / CLIENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * CLIENTS_PER_PAGE;
  const endIndex = startIndex + CLIENTS_PER_PAGE;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  // Reset to first page when query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            {showDeleted ? "ট্র্যাশ করা ক্লায়েন্ট" : "ক্লায়েন্ট ম্যানেজমেন্ট"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {showDeleted ? "ডিলিট করা ক্লায়েন্টদের তালিকা ও পুনরুদ্ধার" : "সব ক্লায়েন্টের তথ্য এবং ওয়ালেট স্ট্যাটাস"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showDeleted ? "outline" : "secondary"}
            onClick={() => setShowDeleted(false)}
            data-testid="button-show-active-clients"
          >
            সক্রিয় ক্লায়েন্ট
          </Button>
          <Button 
            variant={showDeleted ? "secondary" : "outline"}
            onClick={() => setShowDeleted(true)}
            data-testid="button-show-deleted-clients"
          >
            ট্র্যাশ করা
          </Button>
          {!showDeleted && (
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
                  
                  {/* Profile Picture Upload Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">প্রোফাইল ছবি (ঐচ্ছিক)</label>
                    
                    {/* Image Preview */}
                    {(uploadedImagePreview || newClient.profilePicture) && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={uploadedImagePreview || newClient.profilePicture} />
                          <AvatarFallback>{newClient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-sm text-gray-600">
                          {isUploading ? "আপলোড হচ্ছে..." : "ছবি সিলেক্ট করা হয়েছে"}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleRemoveImage}
                          disabled={isUploading}
                          data-testid="button-remove-image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleFileSelect}
                        disabled={isUploading}
                        className="flex items-center gap-2"
                        data-testid="button-upload-image"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
                      </Button>
                      <div className="text-xs text-gray-500 flex items-center">
                        সর্বোচ্চ ২ মেগাবাইট
                      </div>
                    </div>
                    
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="input-client-photo"
                    />
                    
                    {/* Manual URL Input (Optional) */}
                    <div className="pt-2 border-t">
                      <Input
                        data-testid="input-client-profile-picture"
                        placeholder="অথবা ছবির URL লিংক দিন"
                        value={newClient.profilePicture}
                        onChange={(e) => setNewClient({ ...newClient, profilePicture: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <Textarea
                    data-testid="textarea-client-admin-notes"
                    placeholder="এডমিন নোট - বিশেষ নির্দেশনা বা মন্তব্য (ঐচ্ছিক)"
                    value={newClient.adminNotes}
                    onChange={(e) => setNewClient({ ...newClient, adminNotes: e.target.value })}
                    rows={3}
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
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {showDeleted ? (
          <DeletedClientsView />
        ) : isLoading ? (
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
                  <TableHead>অ্যাক্টিভ</TableHead>
                  <TableHead>জমা</TableHead>
                  <TableHead>খরচ</TableHead>
                  <TableHead>ব্যালেন্স</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8" data-testid="text-no-clients">
                      কোন ক্লায়েন্ট পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => {
                    const balance = client.walletDeposited - client.walletSpent;
                    return (
                      <TableRow 
                        key={client.id} 
                        className={`${selectedClientId === client.id ? "bg-slate-50" : ""} ${!client.isActive ? "opacity-60 bg-gray-50" : ""}`}
                        data-testid={`row-client-${client.id}`}
                      >
                        <TableCell className="font-medium" data-testid={`text-client-name-${client.id}`}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={client.profilePicture || ""} />
                              <AvatarFallback className="text-xs">
                                {client.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <div>{client.name}</div>
                              {client.scopes && client.scopes.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {client.scopes.slice(0, 3).map((scope, index) => (
                                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                      {scope}
                                    </Badge>
                                  ))}
                                  {client.scopes.length > 3 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      +{client.scopes.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={client.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"} 
                            data-testid={`badge-client-status-${client.id}`}
                          >
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={client.isActive || false}
                              onCheckedChange={() => toggleActiveStatusMutation.mutate(client.id)}
                              disabled={toggleActiveStatusMutation.isPending}
                              data-testid={`switch-client-active-${client.id}`}
                            />
                            <span className={`text-sm ${client.isActive ? "text-green-600" : "text-gray-500"}`}>
                              {client.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                            </span>
                          </div>
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
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSelectClient(client.id)}
                              data-testid={`button-select-client-${client.id}`}
                            >
                              নির্বাচন করুন
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm("আপনি কি নিশ্চিত যে এই ক্লায়েন্টটি ট্র্যাশে পাঠাতে চান? এটি পরবর্তীতে পুনরুদ্ধার করা যাবে।")) {
                                  trashClientMutation.mutate(client.id);
                                }
                              }}
                              disabled={trashClientMutation.isPending}
                              data-testid={`button-trash-client-${client.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            
            {/* Pagination UI */}
            {filteredClients.length > CLIENTS_PER_PAGE && (
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-sm text-slate-600">
                  মোট {filteredClients.length}টি ক্লায়েন্ট, পেজ {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    পূর্ববর্তী
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const start = Math.max(1, currentPage - 2);
                        const end = Math.min(totalPages, start + 4);
                        pageNum = start + i;
                        if (pageNum > end) return null;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                          data-testid={`button-page-${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    data-testid="button-next-page"
                  >
                    পরবর্তী
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

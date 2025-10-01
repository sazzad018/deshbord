import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Globe,
  Lock,
  Server,
  Trash2,
  Edit,
  FileDown,
  Eye,
  EyeOff,
  Plus,
  Search,
  ExternalLink,
} from "lucide-react";

interface CompletedWebsite {
  id: string;
  clientId: string;
  projectName: string;
  projectStatus: string;
  websiteUrl: string | null;
  websiteUsername: string | null;
  websitePassword: string | null;
  cpanelUsername: string | null;
  cpanelPassword: string | null;
  nameserver1: string | null;
  nameserver2: string | null;
  serviceProvider: string | null;
  notes: string | null;
  completedDate: string | null;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
}

export default function CompletedWebsitesPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<CompletedWebsite | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    clientId: "",
    projectName: "",
    websiteUrl: "",
    websiteUsername: "",
    websitePassword: "",
    cpanelUsername: "",
    cpanelPassword: "",
    nameserver1: "",
    nameserver2: "",
    serviceProvider: "",
    notes: "",
  });

  // Fetch completed websites
  const { data: websites = [], isLoading } = useQuery<CompletedWebsite[]>({
    queryKey: ["/api/website-projects"],
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Add/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingWebsite) {
        return apiRequest("PATCH", `/api/website-projects/${editingWebsite.id}`, data);
      } else {
        return apiRequest("POST", "/api/website-projects", {
          ...data,
          projectStatus: "Completed",
          completedDate: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-projects"] });
      toast({
        title: editingWebsite ? "আপডেট সফল" : "যোগ করা হয়েছে",
        description: editingWebsite
          ? "ওয়েবসাইটের তথ্য সফলভাবে আপডেট হয়েছে"
          : "নতুন completed ওয়েবসাইট যোগ করা হয়েছে",
      });
      resetForm();
      setIsDialogOpen(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/website-projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-projects"] });
      toast({
        title: "মুছে ফেলা হয়েছে",
        description: "ওয়েবসাইট তথ্য সফলভাবে মুছে ফেলা হয়েছে",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      projectName: "",
      websiteUrl: "",
      websiteUsername: "",
      websitePassword: "",
      cpanelUsername: "",
      cpanelPassword: "",
      nameserver1: "",
      nameserver2: "",
      serviceProvider: "",
      notes: "",
    });
    setEditingWebsite(null);
  };

  const handleEdit = (website: CompletedWebsite) => {
    setEditingWebsite(website);
    setFormData({
      clientId: website.clientId,
      projectName: website.projectName,
      websiteUrl: website.websiteUrl || "",
      websiteUsername: website.websiteUsername || "",
      websitePassword: website.websitePassword || "",
      cpanelUsername: website.cpanelUsername || "",
      cpanelPassword: website.cpanelPassword || "",
      nameserver1: website.nameserver1 || "",
      nameserver2: website.nameserver2 || "",
      serviceProvider: website.serviceProvider || "",
      notes: website.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিত এই ওয়েবসাইটের তথ্য মুছে ফেলতে চান?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const filteredWebsites = websites.filter(
    (website) =>
      website.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.websiteUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clients.find((c) => c.id === website.clientId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedWebsites = filteredWebsites.filter(
    (w) => w.completedDate || w.projectStatus === "Completed"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">সম্পূর্ণ ওয়েবসাইট তালিকা</h2>
          <p className="text-slate-600">সকল কমপ্লিট ওয়েবসাইটের তথ্য এবং লগইন ক্রেডেনশিয়াল</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" data-testid="button-add-website">
              <Plus className="mr-2 h-4 w-4" /> নতুন ওয়েবসাইট যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWebsite ? "ওয়েবসাইট তথ্য সম্পাদনা" : "নতুন Completed ওয়েবসাইট যোগ করুন"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">ক্লায়েন্টের নাম *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    required
                  >
                    <SelectTrigger data-testid="select-client">
                      <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectName">প্রজেক্টের নাম *</Label>
                  <Input
                    id="projectName"
                    data-testid="input-project-name"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="যেমন: ই-কমার্স ওয়েবসাইট"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">ওয়েবসাইট URL *</Label>
                  <Input
                    id="websiteUrl"
                    data-testid="input-website-url"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUsername">ওয়েবসাইট ইউজারনেম *</Label>
                  <Input
                    id="websiteUsername"
                    data-testid="input-website-username"
                    value={formData.websiteUsername}
                    onChange={(e) => setFormData({ ...formData, websiteUsername: e.target.value })}
                    placeholder="অ্যাডমিন ইউজারনেম"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websitePassword">ওয়েবসাইট পাসওয়ার্ড *</Label>
                  <div className="relative">
                    <Input
                      id="websitePassword"
                      data-testid="input-website-password"
                      type={showPasswords.websitePassword ? "text" : "password"}
                      value={formData.websitePassword}
                      onChange={(e) => setFormData({ ...formData, websitePassword: e.target.value })}
                      placeholder="অ্যাডমিন পাসওয়ার্ড"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility("websitePassword")}
                    >
                      {showPasswords.websitePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpanelUsername">cPanel ইউজারনেম *</Label>
                  <Input
                    id="cpanelUsername"
                    data-testid="input-cpanel-username"
                    value={formData.cpanelUsername}
                    onChange={(e) => setFormData({ ...formData, cpanelUsername: e.target.value })}
                    placeholder="cPanel ইউজারনেম"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpanelPassword">cPanel পাসওয়ার্ড *</Label>
                  <div className="relative">
                    <Input
                      id="cpanelPassword"
                      data-testid="input-cpanel-password"
                      type={showPasswords.cpanelPassword ? "text" : "password"}
                      value={formData.cpanelPassword}
                      onChange={(e) => setFormData({ ...formData, cpanelPassword: e.target.value })}
                      placeholder="cPanel পাসওয়ার্ড"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility("cpanelPassword")}
                    >
                      {showPasswords.cpanelPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameserver1">নেমসার্ভার ১ *</Label>
                  <Input
                    id="nameserver1"
                    data-testid="input-nameserver1"
                    value={formData.nameserver1}
                    onChange={(e) => setFormData({ ...formData, nameserver1: e.target.value })}
                    placeholder="ns1.example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameserver2">নেমসার্ভার ২ *</Label>
                  <Input
                    id="nameserver2"
                    data-testid="input-nameserver2"
                    value={formData.nameserver2}
                    onChange={(e) => setFormData({ ...formData, nameserver2: e.target.value })}
                    placeholder="ns2.example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceProvider">সার্ভিস প্রোভাইডার *</Label>
                  <Input
                    id="serviceProvider"
                    data-testid="input-service-provider"
                    value={formData.serviceProvider}
                    onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                    placeholder="যেমন: Hostinger, GoDaddy"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">অতিরিক্ত নোট</Label>
                <Textarea
                  id="notes"
                  data-testid="input-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="কোন বিশেষ তথ্য বা নির্দেশনা..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  data-testid="button-save-website"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {saveMutation.isPending ? "সংরক্ষণ হচ্ছে..." : editingWebsite ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="ওয়েবসাইট বা ক্লায়েন্টের নাম দিয়ে খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {/* Websites Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-600">লোড হচ্ছে...</div>
      ) : completedWebsites.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchQuery ? "কোন ওয়েবসাইট পাওয়া যায়নি" : "কোন completed ওয়েবসাইট নেই"}
          </h3>
          <p className="text-slate-600">
            {searchQuery ? "অন্য কিছু খুঁজে দেখুন" : "উপরের বাটন দিয়ে প্রথম ওয়েবসাইট যোগ করুন"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedWebsites.map((website) => {
            const client = clients.find((c) => c.id === website.clientId);
            return (
              <Card key={website.id} className="border-2 border-slate-200 hover:border-green-400 hover:shadow-lg transition-all" data-testid={`card-website-${website.id}`}>
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{website.projectName}</h3>
                      <p className="text-sm text-slate-600">{client?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(website)}
                        data-testid={`button-edit-${website.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(website.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-${website.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Website URL */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Globe className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-600">ওয়েবসাইট</p>
                          <a
                            href={website.websiteUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate block"
                          >
                            {website.websiteUrl}
                          </a>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Website Login */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-start gap-2">
                      <Lock className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-600 mb-1">ওয়েবসাইট লগইন</p>
                        <p className="text-sm break-all">
                          <strong className="text-slate-700">ইউজার:</strong> {website.websiteUsername}
                        </p>
                        <p className="text-sm font-mono">
                          <strong className="text-slate-700">পাস:</strong> ••••••••
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-5 px-2 text-xs"
                            onClick={() => alert(`পাসওয়ার্ড: ${website.websitePassword}`)}
                          >
                            দেখুন
                          </Button>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* cPanel Login */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-start gap-2">
                      <Server className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-600 mb-1">cPanel লগইন</p>
                        <p className="text-sm break-all">
                          <strong className="text-slate-700">ইউজার:</strong> {website.cpanelUsername}
                        </p>
                        <p className="text-sm font-mono">
                          <strong className="text-slate-700">পাস:</strong> ••••••••
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-5 px-2 text-xs"
                            onClick={() => alert(`পাসওয়ার্ড: ${website.cpanelPassword}`)}
                          >
                            দেখুন
                          </Button>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nameservers */}
                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-3 rounded-lg border-l-4 border-teal-500">
                    <p className="text-xs font-semibold text-slate-600 mb-1">নেমসার্ভার</p>
                    <p className="text-sm break-all">NS1: {website.nameserver1}</p>
                    <p className="text-sm break-all">NS2: {website.nameserver2}</p>
                  </div>

                  {/* Service Provider */}
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-xs font-semibold text-slate-600 mb-1">সার্ভিস প্রোভাইডার</p>
                    <p className="text-sm font-semibold text-indigo-700">{website.serviceProvider}</p>
                  </div>

                  {/* Notes */}
                  {website.notes && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 mb-1">নোট</p>
                      <p className="text-sm text-slate-700">{website.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

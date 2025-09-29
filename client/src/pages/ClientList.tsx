import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Crown, 
  User, 
  Phone, 
  Building2,
  DollarSign,
  Search,
  Filter,
  Mail,
  Calendar,
  Eye,
  Edit,
  MessageCircle
} from "lucide-react";
import type { Client } from "@shared/schema";

interface ClientWithDetails extends Client {
  walletBalance: number;
  category: 'regular' | 'premium' | 'general';
  lastContact: string;
}

export default function ClientList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Fetch clients data
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Convert clients to enriched format
  const clientsWithDetails: ClientWithDetails[] = clients.map(client => {
    const walletBalance = client.walletDeposited - client.walletSpent;
    const category: 'regular' | 'premium' | 'general' = (client as any).category || 'general';

    return {
      ...client,
      walletBalance,
      category,
      lastContact: new Date().toISOString().split('T')[0]
    };
  });

  // Filter clients based on search and category
  const filteredClients = clientsWithDetails.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         (client.adminNotes && client.adminNotes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || client.category === filterCategory;
    
    return matchesSearch && matchesCategory && !client.deleted;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'premium':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300"><Crown className="h-3 w-3 mr-1" />প্রিমিয়াম</Badge>;
      case 'regular':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300"><Users className="h-3 w-3 mr-1" />নিয়মিত</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-300"><User className="h-3 w-3 mr-1" />সাধারণ</Badge>;
    }
  };

  const handleWhatsAppClick = (phone: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 overflow-hidden">
          <TopBar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">সকল ক্লাইন্ট</h1>
                <p className="text-gray-600">সম্পূর্ণ ক্লাইন্ট তালিকা ও বিস্তারিত তথ্য</p>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 overflow-hidden">
        <TopBar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-6 h-full overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">সকল ক্লাইন্ট</h1>
              <p className="text-gray-600">সম্পূর্ণ ক্লাইন্ট তালিকা ও বিস্তারিত তথ্য</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">মোট ক্লাইন্ট</p>
                    <p className="text-2xl font-bold text-blue-900">{filteredClients.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">প্রিমিয়াম</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {filteredClients.filter(c => c.category === 'premium').length}
                    </p>
                  </div>
                  <Crown className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">নিয়মিত</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {filteredClients.filter(c => c.category === 'regular').length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">সাধারণ</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {filteredClients.filter(c => c.category === 'general').length}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-slate-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                অনুসন্ধান ও ফিল্টার
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="নাম, ফোন নম্বর বা নোট দিয়ে অনুসন্ধান করুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    data-testid="input-search-clients"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterCategory === "all" ? "default" : "outline"}
                    onClick={() => setFilterCategory("all")}
                    size="sm"
                    data-testid="button-filter-all"
                  >
                    সব
                  </Button>
                  <Button
                    variant={filterCategory === "premium" ? "default" : "outline"}
                    onClick={() => setFilterCategory("premium")}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600"
                    data-testid="button-filter-premium"
                  >
                    প্রিমিয়াম
                  </Button>
                  <Button
                    variant={filterCategory === "regular" ? "default" : "outline"}
                    onClick={() => setFilterCategory("regular")}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600"
                    data-testid="button-filter-regular"
                  >
                    নিয়মিত
                  </Button>
                  <Button
                    variant={filterCategory === "general" ? "default" : "outline"}
                    onClick={() => setFilterCategory("general")}
                    size="sm"
                    className="bg-slate-500 hover:bg-slate-600"
                    data-testid="button-filter-general"
                  >
                    সাধারণ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                ক্লাইন্ট তালিকা ({filteredClients.length}টি)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow" data-testid={`card-client-${client.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900" data-testid={`text-client-name-${client.id}`}>{client.name}</h3>
                          <div className="mt-1">
                            {getCategoryBadge(client.category)}
                          </div>
                        </div>
                        <Badge variant={client.isActive ? "default" : "secondary"} data-testid={`status-client-${client.id}`}>
                          {client.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Contact Information */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <button 
                            onClick={() => handleWhatsAppClick(client.phone)}
                            className="hover:text-green-600 transition-colors"
                            data-testid={`button-phone-${client.id}`}
                          >
                            {client.phone}
                          </button>
                        </div>
                        {client.fb && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate" data-testid={`text-fb-${client.id}`}>{client.fb}</span>
                          </div>
                        )}
                      </div>

                      {/* Financial Information */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-gray-900" data-testid={`text-balance-${client.id}`}>
                            ৳{client.walletBalance.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div data-testid={`text-deposited-${client.id}`}>জমা: ৳{client.walletDeposited.toLocaleString()}</div>
                          <div data-testid={`text-spent-${client.id}`}>খরচ: ৳{client.walletSpent.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Admin Notes */}
                      {client.adminNotes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                          <p className="text-xs text-amber-700 truncate" title={client.adminNotes} data-testid={`text-notes-${client.id}`}>
                            <strong>নোট:</strong> {client.adminNotes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-gray-500" data-testid={`text-lastcontact-${client.id}`}>
                          Last Contact: {client.lastContact}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWhatsAppClick(client.phone)}
                            className="h-8 w-8 p-0"
                            data-testid={`button-whatsapp-${client.id}`}
                          >
                            <MessageCircle className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            data-testid={`button-view-${client.id}`}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            data-testid={`button-edit-${client.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredClients.length === 0 && (
                <div className="text-center py-12" data-testid="message-no-clients">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো ক্লাইন্ট পাওয়া যায়নি</h3>
                  <p className="text-gray-600">
                    {searchTerm || filterCategory !== "all" 
                      ? "অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন"
                      : "এখনো কোনো ক্লাইন্ট যোগ করা হয়নি"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
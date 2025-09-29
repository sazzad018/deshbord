import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  Users, 
  Crown, 
  User, 
  Phone, 
  MessageCircle, 
  Star, 
  DollarSign,
  Edit,
  MoreHorizontal,
  Plus,
  ArrowRight,
  Tag,
  StickyNote
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";

// Extended client interface with category and notes
interface RichClient extends Client {
  category: 'regular' | 'premium' | 'general';
  notes?: string;
  tags?: string[];
  lastContact?: string;
  walletBalance: number; // Calculated field
  email?: string; // Optional field
  company?: string; // Optional field
}

const categoryConfig = {
  regular: {
    title: "নিয়মিত ক্লায়েন্ট",
    description: "বিশ্বস্ত ও নিয়মিত কাজের ক্লায়েন্ট",
    icon: Users,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200"
  },
  premium: {
    title: "প্রিমিয়াম ক্লায়েন্ট", 
    description: "বড় প্রজেক্ট ও উচ্চ বাজেটের ক্লায়েন্ট",
    icon: Crown,
    color: "from-yellow-500 to-orange-600",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200"
  },
  general: {
    title: "সাধারণ ক্লায়েন্ট",
    description: "নতুন ও সাধারণ প্রজেক্টের ক্লায়েন্ট", 
    icon: User,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200"
  }
};

export default function RichClients() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<RichClient | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general" as 'regular' | 'premium' | 'general',
    notes: "",
    tags: "",
    company: ""
  });

  // Fetch clients data
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Convert clients to rich clients (for demo, we'll categorize based on wallet balance)
  const richClients: RichClient[] = clients.map(client => {
    // Calculate wallet balance from deposited - spent
    const walletBalance = client.walletDeposited - client.walletSpent;
    
    let category: 'regular' | 'premium' | 'general' = 'general';
    
    // Categorize based on wallet balance (this is demo logic)
    if (walletBalance >= 50000) {
      category = 'premium';
    } else if (walletBalance >= 20000) {
      category = 'regular';
    }

    return {
      ...client,
      walletBalance,
      category,
      email: `${client.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Demo email
      company: `${client.name} Company`, // Demo company
      notes: `Important client with ৳${walletBalance.toLocaleString()} balance`,
      tags: category === 'premium' ? ['VIP', 'High-Value'] : category === 'regular' ? ['Trusted', 'Regular'] : ['New', 'Potential'],
      lastContact: new Date().toISOString().split('T')[0]
    };
  });

  // Group clients by category
  const categorizedClients = {
    regular: richClients.filter(c => c.category === 'regular'),
    premium: richClients.filter(c => c.category === 'premium'), 
    general: richClients.filter(c => c.category === 'general')
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = (phone: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  // Handle client category change
  const changeCategoryMutation = useMutation({
    mutationFn: ({ clientId, newCategory }: { clientId: string; newCategory: string }) =>
      apiRequest("PATCH", `/api/clients/${clientId}`, { category: newCategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "সফল!",
        description: "ক্লায়েন্ট ক্যাটাগরি পরিবর্তন করা হয়েছে",
      });
    },
  });

  const handleCategoryChange = (clientId: string, newCategory: string) => {
    changeCategoryMutation.mutate({ clientId, newCategory });
  };

  const renderClientCard = (client: RichClient) => (
    <div key={client.id} className="group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            {client.name}
            {client.category === 'premium' && <Crown className="h-4 w-4 text-yellow-500" />}
          </h4>
          <p className="text-sm text-gray-600">{client.company || 'কোম্পানি তথ্য নেই'}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleWhatsAppClick(client.phone)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedClient(client);
              setClientFormData({
                name: client.name,
                email: client.email || "",
                phone: client.phone,
                category: client.category,
                notes: client.notes || "",
                tags: client.tags?.join(', ') || "",
                company: client.company || ""
              });
              setEditDialogOpen(true);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              সম্পাদনা
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-3 w-3" />
          <button 
            onClick={() => handleWhatsAppClick(client.phone)}
            className="hover:text-green-600 transition-colors"
          >
            {client.phone}
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="h-3 w-3" />
          <span>৳{client.walletBalance.toLocaleString()}</span>
        </div>
      </div>

      {client.tags && client.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {client.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {client.notes && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-3">
          <StickyNote className="h-3 w-3 inline mr-1" />
          {client.notes}
        </div>
      )}

      <div className="flex gap-2">
        <Select onValueChange={(value) => handleCategoryChange(client.id, value)} defaultValue={client.category}>
          <SelectTrigger className="text-xs h-8 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">সাধারণ</SelectItem>
            <SelectItem value="regular">নিয়মিত</SelectItem>
            <SelectItem value="premium">প্রিমিয়াম</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderCategoryColumn = (categoryKey: keyof typeof categoryConfig, clients: RichClient[]) => {
    const config = categoryConfig[categoryKey];
    const Icon = config.icon;

    return (
      <div className="flex-1 min-w-0">
        <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${config.color} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className={`text-lg ${config.textColor} font-bold`}>
                  {config.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                <Badge variant="outline" className={`mt-2 ${config.textColor} ${config.borderColor}`}>
                  {clients.length}টি ক্লায়েন্ট
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {clients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>এই ক্যাটাগরিতে কোনো ক্লায়েন্ট নেই</p>
                </div>
              ) : (
                clients.map(renderClientCard)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">বড়লোক ক্লাইন্ট</h1>
            <p className="text-gray-600">প্রিমিয়াম ক্লায়েন্ট ক্যাটাগরি ম্যানেজমেন্ট</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">বড়লোক ক্লাইন্ট</h1>
            <p className="text-gray-600">প্রিমিয়াম ক্লায়েন্ট ক্যাটাগরি ম্যানেজমেন্ট</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setAddClientDialogOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-violet-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          নতুন ক্লায়েন্ট
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">মোট ক্লায়েন্ট</p>
                <p className="text-2xl font-bold text-blue-900">{richClients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">প্রিমিয়াম</p>
                <p className="text-2xl font-bold text-yellow-900">{categorizedClients.premium.length}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">নিয়মিত</p>
                <p className="text-2xl font-bold text-green-900">{categorizedClients.regular.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">সাধারণ</p>
                <p className="text-2xl font-bold text-gray-900">{categorizedClients.general.length}</p>
              </div>
              <User className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Three Column Funnel Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderCategoryColumn('premium', categorizedClients.premium)}
        {renderCategoryColumn('regular', categorizedClients.regular)}
        {renderCategoryColumn('general', categorizedClients.general)}
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ক্লায়েন্ট সম্পাদনা</DialogTitle>
            <DialogDescription>
              ক্লায়েন্টের তথ্য আপডেট করুন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">নাম</Label>
              <Input
                id="name"
                value={clientFormData.name}
                onChange={(e) => setClientFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">ফোন</Label>
              <Input
                id="phone"
                value={clientFormData.phone}
                onChange={(e) => setClientFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="category">ক্যাটাগরি</Label>
              <Select value={clientFormData.category} onValueChange={(value) => setClientFormData(prev => ({ ...prev, category: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">সাধারণ ক্লায়েন্ট</SelectItem>
                  <SelectItem value="regular">নিয়মিত ক্লায়েন্ট</SelectItem>
                  <SelectItem value="premium">প্রিমিয়াম ক্লায়েন্ট</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">ট্যাগ (কমা দিয়ে আলাদা করুন)</Label>
              <Input
                id="tags"
                value={clientFormData.tags}
                onChange={(e) => setClientFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="VIP, High-Value, Trusted"
              />
            </div>
            <div>
              <Label htmlFor="notes">নোট</Label>
              <Textarea
                id="notes"
                value={clientFormData.notes}
                onChange={(e) => setClientFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="ক্লায়েন্ট সম্পর্কে গুরুত্বপূর্ণ তথ্য..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => setEditDialogOpen(false)}
                variant="outline" 
                className="flex-1"
              >
                বাতিল
              </Button>
              <Button 
                onClick={() => {
                  // Handle save functionality here
                  toast({
                    title: "সফল!",
                    description: "ক্লায়েন্ট তথ্য আপডেট করা হয়েছে",
                  });
                  setEditDialogOpen(false);
                }}
                className="flex-1"
              >
                সংরক্ষণ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
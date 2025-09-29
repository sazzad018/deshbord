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
  StickyNote,
  GripVertical,
  ArrowUpDown
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

// Draggable Client Card Component
function DraggableClientCard({ client, onEdit, onCategoryChange }: { 
  client: RichClient; 
  onEdit: (client: RichClient) => void;
  onCategoryChange: (clientId: string, newCategory: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleWhatsAppClick = (phone: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleCategoryChange = (clientId: string, newCategory: string) => {
    onCategoryChange(clientId, newCategory);
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'premium':
        return 'border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 hover:from-amber-100/80 hover:to-yellow-100/80';
      case 'regular':
        return 'border-l-4 border-l-emerald-400 bg-gradient-to-r from-emerald-50/80 to-green-50/80 hover:from-emerald-100/80 hover:to-green-100/80';
      default:
        return 'border-l-4 border-l-slate-400 bg-gradient-to-r from-slate-50/80 to-gray-50/80 hover:from-slate-100/80 hover:to-gray-100/80';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'premium': return <Crown className="h-3.5 w-3.5 text-amber-600" />;
      case 'regular': return <Users className="h-3.5 w-3.5 text-emerald-600" />;
      default: return <User className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group ${getCategoryStyle(client.category)} border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-[1.02]`}
      {...attributes}
      {...listeners}
    >
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getCategoryIcon(client.category)}
          <h4 className="font-bold text-gray-900 text-sm truncate">
            {client.name}
          </h4>
          <GripVertical className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => handleWhatsAppClick(client.phone)} className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1.5" />
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(client)} className="text-xs">
              <Edit className="h-3 w-3 mr-1.5" />
              সম্পাদনা
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Company Info - Single Line */}
      <div className="flex items-center gap-1.5 mb-2">
        <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-600 truncate font-medium">
          {client.company || 'কোম্পানি তথ্য নেই'}
        </span>
      </div>

      {/* Contact & Financial - Two Column */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-gray-400" />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleWhatsAppClick(client.phone);
            }}
            className="text-xs text-gray-600 hover:text-green-600 transition-colors truncate"
          >
            {client.phone.substring(0, 11)}...
          </button>
        </div>
        
        <div className="flex items-center gap-1 justify-end">
          <DollarSign className="h-3 w-3 text-green-600" />
          <span className="text-xs font-bold text-gray-900">
            ৳{(client.walletBalance / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Status & Tags - Single Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${client.isActive ? 'bg-green-500' : 'bg-red-400'}`}></div>
          <span className="text-xs text-gray-600 font-medium">
            {client.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
          </span>
        </div>
        
        {client.tags && client.tags.length > 0 && (
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto bg-white/70 text-gray-700 border-gray-300">
              {client.tags[0]}
            </Badge>
            {client.tags.length > 1 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                +{client.tags.length - 1}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Admin Notes - Compact Preview */}
      {client.adminNotes && (
        <div className="text-xs text-amber-700 bg-amber-50/80 border border-amber-200 rounded px-2 py-1 mb-2">
          <Tag className="h-3 w-3 inline mr-1" />
          <span className="font-medium">Note:</span> {client.adminNotes.substring(0, 30)}{client.adminNotes.length > 30 && '...'}
        </div>
      )}

      {/* Category Change Button */}
      <div className="pt-2 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs h-6 bg-white/80 hover:bg-white border-gray-300 text-gray-700 font-medium"
            >
              <ArrowUpDown className="h-3 w-3 mr-1" />
              ধাপ পরিবর্তন করুন
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuItem 
              onClick={() => handleCategoryChange(client.id, 'general')}
              className={`text-xs ${client.category === 'general' ? 'bg-slate-100 font-semibold' : ''}`}
            >
              <User className="h-3 w-3 mr-2 text-slate-600" />
              সাধারণ ক্লাইন্ট
              {client.category === 'general' && <span className="ml-auto text-slate-600">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleCategoryChange(client.id, 'regular')}
              className={`text-xs ${client.category === 'regular' ? 'bg-emerald-100 font-semibold' : ''}`}
            >
              <Users className="h-3 w-3 mr-2 text-emerald-600" />
              নিয়মিত ক্লাইন্ট
              {client.category === 'regular' && <span className="ml-auto text-emerald-600">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleCategoryChange(client.id, 'premium')}
              className={`text-xs ${client.category === 'premium' ? 'bg-amber-100 font-semibold' : ''}`}
            >
              <Crown className="h-3 w-3 mr-2 text-amber-600" />
              প্রিমিয়াম ক্লাইন্ট
              {client.category === 'premium' && <span className="ml-auto text-amber-600">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch clients data
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Convert clients to rich clients using database category field
  const richClients: RichClient[] = clients.map(client => {
    // Calculate wallet balance from deposited - spent
    const walletBalance = client.walletDeposited - client.walletSpent;
    
    // All clients start in 'general' category by default, can be moved to other categories
    const category: 'regular' | 'premium' | 'general' = (client as any).category || 'general';

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

  // Handle client category change through drag and drop
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
    onError: (error) => {
      console.error("Category change error:", error);
      toast({
        title: "ত্রুটি!",
        description: "ক্যাটাগরি পরিবর্তন করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Handle full client profile information update (excludes category)
  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, clientData }: { clientId: string; clientData: any }) =>
      apiRequest("PATCH", `/api/clients/${clientId}`, {
        name: clientData.name,
        phone: clientData.phone,
        adminNotes: clientData.notes
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "সফল!",
        description: "ক্লায়েন্টের তথ্য আপডেট করা হয়েছে",
      });
    },
    onError: (error) => {
      console.error("Client update error:", error);
      toast({
        title: "ত্রুটি!",
        description: "ক্লায়েন্টের তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Handle adding new client
  const addClientMutation = useMutation({
    mutationFn: (clientData: any) => {
      // Generate portal key
      const portalKey = Math.random().toString(36).substring(2, 15);
      return apiRequest("POST", "/api/clients", {
        ...clientData,
        portalKey,
        walletDeposited: 0,
        walletSpent: 0,
        scopes: [],
        status: "Active",
        isActive: true,
        deleted: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "সফল!",
        description: "নতুন ক্লায়েন্ট যোগ করা হয়েছে",
      });
      setAddClientDialogOpen(false);
      setClientFormData({
        name: "",
        email: "",
        phone: "",
        category: "general",
        notes: "",
        tags: "",
        company: ""
      });
    },
    onError: (error) => {
      console.error("Add client error:", error);
      toast({
        title: "ত্রুটি!",
        description: "নতুন ক্লায়েন্ট যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const clientId = active.id as string;
    const newCategory = over.id as string;

    // Find the client being dragged
    const client = richClients.find(c => c.id === clientId);
    
    if (client && client.category !== newCategory) {
      // Update the category
      changeCategoryMutation.mutate({ clientId, newCategory });
    }
  };

  // Handle edit client
  const handleEditClient = (client: RichClient) => {
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
  };

  // Droppable Area Component
  function DroppableArea({ categoryKey, children }: { categoryKey: string; children: React.ReactNode }) {
    const {isOver, setNodeRef} = useDroppable({
      id: categoryKey,
    });
    
    const style = {
      backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : undefined,
      borderColor: isOver ? '#3b82f6' : undefined,
    };
    
    return (
      <div ref={setNodeRef} style={style} className="h-full">
        {children}
      </div>
    );
  }

  const renderCategoryColumn = (categoryKey: keyof typeof categoryConfig, clients: RichClient[]) => {
    const config = categoryConfig[categoryKey];
    const Icon = config.icon;

    return (
      <div className="flex-1 min-w-0">
        <DroppableArea categoryKey={categoryKey}>
          <Card className={`${config.bgColor} ${config.borderColor} border-2 min-h-[75vh] max-h-[80vh] transition-all duration-200 shadow-sm hover:shadow-md`}>
            <CardHeader className="pb-3 pt-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color} shadow-sm`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className={`text-base ${config.textColor} font-bold`}>
                    {config.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                  <Badge variant="outline" className={`mt-2 ${config.textColor} ${config.borderColor}`}>
                    {clients.length}টি ক্লায়েন্ট
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <SortableContext items={clients.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div 
                  className="space-y-2 max-h-[65vh] overflow-y-auto min-h-[350px] p-2 rounded-lg transition-all duration-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    border: '1px dashed rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {clients.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">এই ক্যাটাগরিতে কোনো ক্লায়েন্ট নেই</p>
                      <p className="text-xs mt-1 opacity-70">💡 ক্লায়েন্ট এখানে টেনে আনুন</p>
                    </div>
                  ) : (
                    clients.map(client => (
                      <DraggableClientCard 
                        key={client.id} 
                        client={client} 
                        onEdit={handleEditClient}
                        onCategoryChange={(clientId, newCategory) => {
                          changeCategoryMutation.mutate({ clientId, newCategory });
                        }}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </CardContent>
          </Card>
        </DroppableArea>
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
    <>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">বড়লোক ক্লাইন্ট</h1>
                <p className="text-gray-600">প্রিমিয়াম ক্লায়েন্ট ক্যাটাগরি ম্যানেজমেন্ট</p>
                <p className="text-sm text-gray-500 mt-1">💡 টিপস: ক্লায়েন্ট কার্ড টেনে নিয়ে ক্যাটাগরি পরিবর্তন করুন</p>
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

          {/* Professional Compact Funnel Design - Optimized for 10-12 Clients Visibility */}
          <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-4">
            {renderCategoryColumn('premium', categorizedClients.premium)}
            {renderCategoryColumn('regular', categorizedClients.regular)}
            {renderCategoryColumn('general', categorizedClients.general)}
          </div>
        </div>
      </DndContext>

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>প্রোফাইল ইনফরমেশন সম্পাদনা</DialogTitle>
            <DialogDescription>
              ক্লায়েন্টের নাম, ফোন ও নোট আপডেট করুন (ক্যাটাগরি পরিবর্তনের জন্য drag & drop ব্যবহার করুন)
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
                  if (selectedClient) {
                    updateClientMutation.mutate({
                      clientId: selectedClient.id,
                      clientData: clientFormData
                    });
                  }
                  setEditDialogOpen(false);
                }}
                className="flex-1"
                disabled={updateClientMutation.isPending}
              >
                {updateClientMutation.isPending ? "আপডেট হচ্ছে..." : "প্রোফাইল আপডেট"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={addClientDialogOpen} onOpenChange={setAddClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন ক্লায়েন্ট যোগ করুন</DialogTitle>
            <DialogDescription>
              নতুন ক্লায়েন্টের তথ্য পূরণ করুন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-name">নাম *</Label>
              <Input
                id="new-name"
                value={clientFormData.name}
                onChange={(e) => setClientFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ক্লায়েন্টের নাম"
              />
            </div>
            <div>
              <Label htmlFor="new-phone">ফোন *</Label>
              <Input
                id="new-phone"
                value={clientFormData.phone}
                onChange={(e) => setClientFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+8801XXXXXXXXX"
              />
            </div>
            <div>
              <Label htmlFor="new-category">ক্যাটাগরি (ডিফল্ট: সাধারণ ক্লায়েন্ট)</Label>
              <Select value={clientFormData.category} onValueChange={(value) => setClientFormData(prev => ({ ...prev, category: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">সাধারণ ক্লায়েন্ট (ডিফল্ট)</SelectItem>
                  <SelectItem value="regular">নিয়মিত ক্লায়েন্ট</SelectItem>
                  <SelectItem value="premium">প্রিমিয়াম ক্লায়েন্ট</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-company">কোম্পানি</Label>
              <Input
                id="new-company"
                value={clientFormData.company}
                onChange={(e) => setClientFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="কোম্পানির নাম (ঐচ্ছিক)"
              />
            </div>
            <div>
              <Label htmlFor="new-notes">নোট</Label>
              <Textarea
                id="new-notes"
                value={clientFormData.notes}
                onChange={(e) => setClientFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="ক্লায়েন্ট সম্পর্কে গুরুত্বপূর্ণ তথ্য..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => setAddClientDialogOpen(false)}
                variant="outline" 
                className="flex-1"
              >
                বাতিল
              </Button>
              <Button 
                onClick={() => {
                  if (clientFormData.name && clientFormData.phone) {
                    addClientMutation.mutate({
                      name: clientFormData.name,
                      phone: clientFormData.phone,
                      category: clientFormData.category,
                      adminNotes: clientFormData.notes || null,
                      fb: null
                    });
                  } else {
                    toast({
                      title: "ত্রুটি!",
                      description: "নাম এবং ফোন নম্বর আবশ্যক",
                      variant: "destructive",
                    });
                  }
                }}
                className="flex-1"
                disabled={addClientMutation.isPending || !clientFormData.name || !clientFormData.phone}
              >
                {addClientMutation.isPending ? "যোগ করা হচ্ছে..." : "যোগ করুন"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
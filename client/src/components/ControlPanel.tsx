import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Edit, Trash2, Settings, Link as LinkIcon, Palette, Globe, FileText, Users, Calendar, Briefcase, Zap, Star, Heart, Target, Trophy, Rocket, Shield, Wrench, Database, Copy, MessageSquare, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CustomButton, InsertCustomButton, QuickMessage, InsertQuickMessage } from "@shared/schema";

const iconOptions = [
  { value: "ExternalLink", label: "External Link", icon: ExternalLink },
  { value: "Globe", label: "Global", icon: Globe },
  { value: "FileText", label: "Document", icon: FileText },
  { value: "Users", label: "Users", icon: Users },
  { value: "Calendar", label: "Calendar", icon: Calendar },
  { value: "Briefcase", label: "Business", icon: Briefcase },
  { value: "Zap", label: "Energy", icon: Zap },
  { value: "Star", label: "Star", icon: Star },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Target", label: "Target", icon: Target },
  { value: "Trophy", label: "Trophy", icon: Trophy },
  { value: "Rocket", label: "Rocket", icon: Rocket },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Wrench", label: "Tools", icon: Wrench },
  { value: "Database", label: "Database", icon: Database },
];

const colorOptions = [
  { value: "primary", label: "Primary", class: "bg-primary text-primary-foreground" },
  { value: "secondary", label: "Secondary", class: "bg-secondary text-secondary-foreground" },
  { value: "destructive", label: "Red", class: "bg-destructive text-destructive-foreground" },
  { value: "outline", label: "Outline", class: "border border-input bg-background" },
  { value: "ghost", label: "Ghost", class: "hover:bg-accent hover:text-accent-foreground" },
  { value: "blue", label: "Blue", class: "bg-blue-600 text-white" },
  { value: "green", label: "Green", class: "bg-green-600 text-white" },
  { value: "purple", label: "Purple", class: "bg-purple-600 text-white" },
  { value: "orange", label: "Orange", class: "bg-orange-600 text-white" },
];

export default function ControlPanel() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingButton, setEditingButton] = useState<CustomButton | null>(null);
  const [formData, setFormData] = useState<Partial<InsertCustomButton>>({
    title: "",
    description: "",
    url: "",
    icon: "ExternalLink",
    color: "primary",
  });

  // Quick Message states
  const [isQuickMessageDialogOpen, setIsQuickMessageDialogOpen] = useState(false);
  const [editingQuickMessage, setEditingQuickMessage] = useState<QuickMessage | null>(null);
  const [quickMessageFormData, setQuickMessageFormData] = useState<Partial<InsertQuickMessage>>({
    title: "",
    message: "",
    category: "",
    isActive: true,
    sortOrder: 0,
  });
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const { data: customButtons = [], isLoading } = useQuery<CustomButton[]>({
    queryKey: ["/api/custom-buttons"],
  });

  const { data: quickMessages = [], isLoading: isLoadingQuickMessages } = useQuery<QuickMessage[]>({
    queryKey: ["/api/quick-messages"],
  });

  const createButtonMutation = useMutation({
    mutationFn: (data: InsertCustomButton) => apiRequest("POST", "/api/custom-buttons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-buttons"] });
      setIsAddDialogOpen(false);
      setFormData({ title: "", description: "", url: "", icon: "ExternalLink", color: "primary" });
      toast({
        title: "সফল!",
        description: "নতুন বাটন যোগ করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "বাটন যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const updateButtonMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomButton> }) => 
      apiRequest("PATCH", `/api/custom-buttons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-buttons"] });
      setEditingButton(null);
      setFormData({ title: "", description: "", url: "", icon: "ExternalLink", color: "primary" });
      toast({
        title: "সফল!",
        description: "বাটন আপডেট করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "বাটন আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const deleteButtonMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/custom-buttons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-buttons"] });
      toast({
        title: "সফল!",
        description: "বাটন ডিলিট করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "বাটন ডিলিট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Quick Message mutations
  const createQuickMessageMutation = useMutation({
    mutationFn: (data: InsertQuickMessage) => apiRequest("POST", "/api/quick-messages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quick-messages"] });
      setIsQuickMessageDialogOpen(false);
      setQuickMessageFormData({ title: "", message: "", category: "", isActive: true, sortOrder: 0 });
      toast({
        title: "সফল!",
        description: "নতুন কুইক মেসেজ যোগ করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "কুইক মেসেজ যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const updateQuickMessageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuickMessage> }) => 
      apiRequest("PATCH", `/api/quick-messages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quick-messages"] });
      setEditingQuickMessage(null);
      setQuickMessageFormData({ title: "", message: "", category: "", isActive: true, sortOrder: 0 });
      toast({
        title: "সফল!",
        description: "কুইক মেসেজ আপডেট করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "কুইক মেসেজ আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const deleteQuickMessageMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/quick-messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quick-messages"] });
      toast({
        title: "সফল!",
        description: "কুইক মেসেজ ডিলিট করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "কুইক মেসেজ ডিলিট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      toast({
        title: "ত্রুটি!",
        description: "সব ফিল্ড পূরণ করুন।",
        variant: "destructive",
      });
      return;
    }

    if (editingButton) {
      updateButtonMutation.mutate({ id: editingButton.id, data: formData });
    } else {
      createButtonMutation.mutate(formData as InsertCustomButton);
    }
  };

  const handleEdit = (button: CustomButton) => {
    setEditingButton(button);
    setFormData({
      title: button.title,
      description: button.description || "",
      url: button.url,
      icon: button.icon || "ExternalLink",
      color: button.color || "primary",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("আপনি কি এই বাটনটি ডিলিট করতে চান?")) {
      deleteButtonMutation.mutate(id);
    }
  };

  const handleButtonClick = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url.startsWith('/') ? url : `/${url}`;
    }
  };

  const getIcon = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : ExternalLink;
  };

  const getButtonVariant = (color: string) => {
    const colorMap: Record<string, string> = {
      primary: "default",
      secondary: "secondary", 
      destructive: "destructive",
      outline: "outline",
      ghost: "ghost",
      blue: "default",
      green: "default", 
      purple: "default",
      orange: "default"
    };
    return colorMap[color] || "default";
  };

  const getButtonClassName = (color: string) => {
    const customColors: Record<string, string> = {
      blue: "bg-blue-600 hover:bg-blue-700 text-white",
      green: "bg-green-600 hover:bg-green-700 text-white",
      purple: "bg-purple-600 hover:bg-purple-700 text-white", 
      orange: "bg-orange-600 hover:bg-orange-700 text-white"
    };
    return customColors[color] || "";
  };

  // Quick Message handlers
  const handleQuickMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMessageFormData.title || !quickMessageFormData.message) {
      toast({
        title: "ত্রুটি!",
        description: "শিরোনাম এবং মেসেজ পূরণ করুন।",
        variant: "destructive",
      });
      return;
    }

    if (editingQuickMessage) {
      updateQuickMessageMutation.mutate({ id: editingQuickMessage.id, data: quickMessageFormData });
    } else {
      createQuickMessageMutation.mutate(quickMessageFormData as InsertQuickMessage);
    }
  };

  const handleQuickMessageEdit = (message: QuickMessage) => {
    setEditingQuickMessage(message);
    setQuickMessageFormData({
      title: message.title,
      message: message.message,
      category: message.category || "",
      isActive: message.isActive,
      sortOrder: message.sortOrder || 0,
    });
    setIsQuickMessageDialogOpen(true);
  };

  const handleQuickMessageDelete = (id: string) => {
    if (window.confirm("আপনি কি এই কুইক মেসেজটি ডিলিট করতে চান?")) {
      deleteQuickMessageMutation.mutate(id);
    }
  };

  const handleCopyMessage = async (message: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessageId(messageId);
      toast({
        title: "কপি সম্পন্ন!",
        description: "মেসেজ ক্লিপবোর্ডে কপি করা হয়েছে।",
      });
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "মেসেজ কপি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">কন্ট্রোল প্যানেল</CardTitle>
              <CardDescription className="text-sm text-slate-500 mt-1">
                কাস্টম লিংক পরিচালনা
              </CardDescription>
            </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="button-add-custom-button"
                className="bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => {
                  setEditingButton(null);
                  setFormData({ title: "", description: "", url: "", icon: "ExternalLink", color: "primary" });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                নতুন
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {editingButton ? "বাটন সম্পাদনা" : "নতুন বাটন"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">বাটনের নাম *</Label>
                  <Input
                    id="title"
                    data-testid="input-button-title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="যেমন: আমার ওয়েবসাইট"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">লিংক URL *</Label>
                  <Input
                    id="url"
                    data-testid="input-button-url"
                    value={formData.url || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com অথবা /internal-page"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">বিবরণ (ঐচ্ছিক)</Label>
                  <Textarea
                    id="description"
                    data-testid="input-button-description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="এই বাটনটি সম্পর্কে সংক্ষিপ্ত বিবরণ"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">আইকন</Label>
                    <Select 
                      value={formData.icon || "ExternalLink"} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger data-testid="select-button-icon">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">রং</Label>
                    <Select 
                      value={formData.color || "primary"} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger data-testid="select-button-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${option.class}`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    বাতিল
                  </Button>
                  <Button 
                    type="submit" 
                    data-testid="button-save"
                    disabled={createButtonMutation.isPending || updateButtonMutation.isPending}
                  >
                    {editingButton ? "আপডেট করুন" : "যোগ করুন"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-2 text-gray-500 text-sm">
            লোড হচ্ছে...
          </div>
        ) : customButtons.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            কাস্টম বাটন যোগ করুন
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {customButtons.map((button) => {
              return (
                <Card key={button.id} className="hover:shadow-md transition-shadow border border-slate-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900 text-sm leading-tight">{button.title}</h3>
                      {button.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{button.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => handleEdit(button)}
                          data-testid={`button-edit-${button.id}`}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-slate-400 hover:text-red-600"
                          onClick={() => handleDelete(button.id)}
                          data-testid={`button-delete-${button.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-white h-7 px-3"
                        onClick={() => handleButtonClick(button.url)}
                        data-testid={`button-link-${button.id}`}
                      >
                        যান
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
      </Card>

      {/* Quick Message Reply Section */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              কুইক মেসেজের রিপ্লাই
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1">
              দ্রুত উত্তরের জন্য সংরক্ষিত মেসেজ পরিচালনা
            </CardDescription>
          </div>
          
          <Dialog open={isQuickMessageDialogOpen} onOpenChange={setIsQuickMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="button-add-quick-message"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setEditingQuickMessage(null);
                  setQuickMessageFormData({ title: "", message: "", category: "", isActive: true, sortOrder: 0 });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                নতুন মেসেজ
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {editingQuickMessage ? "মেসেজ সম্পাদনা" : "নতুন কুইক মেসেজ"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleQuickMessageSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message-title">শিরোনাম *</Label>
                  <Input
                    id="message-title"
                    data-testid="input-message-title"
                    value={quickMessageFormData.title || ""}
                    onChange={(e) => setQuickMessageFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="যেমন: ধন্যবাদ বার্তা"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message-content">মেসেজের বিষয়বস্তু *</Label>
                  <Textarea
                    id="message-content"
                    data-testid="input-message-content"
                    value={quickMessageFormData.message || ""}
                    onChange={(e) => setQuickMessageFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="আপনার মেসেজ এখানে লিখুন..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message-category">ক্যাটেগরি (ঐচ্ছিক)</Label>
                  <Input
                    id="message-category"
                    data-testid="input-message-category"
                    value={quickMessageFormData.category || ""}
                    onChange={(e) => setQuickMessageFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="যেমন: সাধারণ, ব্যবসা, সাপোর্ট"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message-sortorder">অগ্রাধিকার ক্রম</Label>
                  <Input
                    id="message-sortorder"
                    data-testid="input-message-sortorder"
                    type="number"
                    value={quickMessageFormData.sortOrder || 0}
                    onChange={(e) => setQuickMessageFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsQuickMessageDialogOpen(false)}
                    data-testid="button-message-cancel"
                  >
                    বাতিল
                  </Button>
                  <Button 
                    type="submit" 
                    data-testid="button-message-save"
                    disabled={createQuickMessageMutation.isPending || updateQuickMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingQuickMessage ? "আপডেট করুন" : "যোগ করুন"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoadingQuickMessages ? (
          <div className="text-center py-2 text-gray-500 text-sm">
            লোড হচ্ছে...
          </div>
        ) : quickMessages.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            কুইক মেসেজ যোগ করুন
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {quickMessages.map((message) => (
              <Card key={message.id} className="hover:shadow-md transition-shadow border border-blue-200 bg-blue-50/30">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm leading-tight">{message.title}</h3>
                      {message.category && (
                        <Badge variant="secondary" className="text-xs">
                          {message.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 break-words whitespace-pre-wrap">{message.message}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        onClick={() => handleQuickMessageEdit(message)}
                        data-testid={`button-edit-message-${message.id}`}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-slate-400 hover:text-red-600"
                        onClick={() => handleQuickMessageDelete(message.id)}
                        data-testid={`button-delete-message-${message.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 flex items-center gap-1"
                      onClick={() => handleCopyMessage(message.message, message.id)}
                      data-testid={`button-copy-message-${message.id}`}
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copiedMessageId === message.id ? "কপি হয়েছে" : "কপি করুন"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      </Card>
    </div>
  );
}
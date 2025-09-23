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
import { Plus, ExternalLink, Edit, Trash2, Settings, Link as LinkIcon, Palette, Globe, FileText, Users, Calendar, Briefcase, Zap, Star, Heart, Target, Trophy, Rocket, Shield, Wrench, Database } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CustomButton, InsertCustomButton } from "@shared/schema";

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

  const { data: customButtons = [], isLoading } = useQuery<CustomButton[]>({
    queryKey: ["/api/custom-buttons"],
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

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">কন্ট্রোল প্যানেল</CardTitle>
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
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">লোড হচ্ছে...</div>
          </div>
        ) : customButtons.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <LinkIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোন কাস্টম বাটন নেই</h3>
            <p className="text-gray-500 mb-4">আপনার প্রয়োজনীয় লিংকের জন্য কাস্টম বাটন তৈরি করুন।</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              প্রথম বাটন যোগ করুন
            </Button>
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
  );
}
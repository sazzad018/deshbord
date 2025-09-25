import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, Plus, Send, Copy, Edit, Trash2, User, ExternalLink, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const templateFormSchema = z.object({
  name: z.string().min(1, "টেমপ্লেট নাম লিখুন"),
  message: z.string().min(1, "মেসেজ লিখুন"),
  isDefault: z.boolean().default(false),
});

const messagingFormSchema = z.object({
  clientId: z.string().min(1, "ক্লায়েন্ট নির্বাচন করুন"),
  templateId: z.string().optional(),
  customMessage: z.string().min(1, "মেসেজ লিখুন"),
});

export default function WhatsAppMessaging() {
  const { toast } = useToast();
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [previewMessage, setPreviewMessage] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const templateForm = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      message: "",
      isDefault: false,
    },
  });

  const messagingForm = useForm<z.infer<typeof messagingFormSchema>>({
    resolver: zodResolver(messagingFormSchema),
    defaultValues: {
      clientId: "",
      templateId: "",
      customMessage: "",
    },
  });

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/whatsapp-templates"],
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof templateFormSchema>) => {
      const response = await apiRequest("POST", "/api/whatsapp-templates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-templates"] });
      toast({ title: "সফল", description: "টেমপ্লেট তৈরি হয়েছে!" });
      setIsTemplateDialogOpen(false);
      templateForm.reset();
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "টেমপ্লেট তৈরি করতে সমস্যা হয়েছে", variant: "destructive" });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WhatsAppTemplate> }) => {
      const response = await apiRequest("PATCH", `/api/whatsapp-templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-templates"] });
      toast({ title: "সফল", description: "টেমপ্লেট আপডেট হয়েছে!" });
      setEditingTemplate(null);
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/whatsapp-templates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-templates"] });
      toast({ title: "সফল", description: "টেমপ্লেট ডিলিট করা হয়েছে!" });
    },
  });

  // Generate WhatsApp link mutation
  const generateLinkMutation = useMutation({
    mutationFn: async (data: { clientPhone: string; message: string; templateId?: string }) => {
      const response = await apiRequest("POST", "/api/whatsapp/generate-link", data);
      return response.json();
    },
    onSuccess: (response) => {
      setGeneratedLink(response.link);
      toast({ title: "সফল", description: "হোয়াটসঅ্যাপ লিংক তৈরি হয়েছে!" });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "লিংক তৈরি করতে সমস্যা হয়েছে", variant: "destructive" });
    },
  });

  const onTemplateSubmit = (values: z.infer<typeof templateFormSchema>) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ 
        id: editingTemplate.id, 
        data: values 
      });
    } else {
      createTemplateMutation.mutate(values);
    }
  };

  const onMessageSubmit = (values: z.infer<typeof messagingFormSchema>) => {
    const client = (clients as any[]).find((c: any) => c.id === values.clientId);
    if (!client) {
      toast({ title: "ত্রুটি", description: "ক্লায়েন্ট পাওয়া যায়নি", variant: "destructive" });
      return;
    }

    // Replace placeholders in message
    let finalMessage = values.customMessage;
    finalMessage = finalMessage.replace(/\{client_name\}/g, client.name);
    finalMessage = finalMessage.replace(/\{client_phone\}/g, client.phone);
    
    generateLinkMutation.mutate({
      clientPhone: client.phone,
      message: finalMessage,
      templateId: values.templateId,
    });
  };

  const startEditingTemplate = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    templateForm.reset({
      name: template.name,
      message: template.message,
      isDefault: template.isDefault,
    });
    setIsTemplateDialogOpen(true);
  };

  const closeTemplateDialog = () => {
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
    templateForm.reset();
  };

  const handleTemplateDialogChange = (open: boolean) => {
    if (open) {
      setIsTemplateDialogOpen(true);
    } else {
      closeTemplateDialog();
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (templateId === "custom") {
      // Clear the message for custom input
      messagingForm.setValue("customMessage", "");
      updatePreview("");
    } else {
      const template = (templates as WhatsAppTemplate[]).find((t: WhatsAppTemplate) => t.id === templateId);
      if (template) {
        messagingForm.setValue("customMessage", template.message);
        updatePreview(template.message);
      }
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = (clients as any[]).find((c: any) => c.id === clientId);
    setSelectedClient(client);
    updatePreview(messagingForm.getValues("customMessage"));
  };

  const updatePreview = (message: string) => {
    if (!selectedClient) {
      setPreviewMessage(message);
      return;
    }

    let preview = message;
    preview = preview.replace(/\{client_name\}/g, selectedClient.name);
    preview = preview.replace(/\{client_phone\}/g, selectedClient.phone);
    setPreviewMessage(preview);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "কপি হয়েছে", description: "ক্লিপবোর্ডে কপি করা হয়েছে!" });
  };

  const openWhatsApp = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">হোয়াটসঅ্যাপ মেসেজিং</h1>
          <p className="text-muted-foreground">ক্লায়েন্টদের সাথে দ্রুত যোগাযোগের জন্য প্রি-ফিল্ড মেসেজ তৈরি করুন</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={handleTemplateDialogChange}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-template">
                <Plus className="h-4 w-4 mr-2" />
                নতুন টেমপ্লেট
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "টেমপ্লেট এডিট করুন" : "নতুন মেসেজ টেমপ্লেট"}
                </DialogTitle>
                <DialogDescription>
                  বার বার ব্যবহারের জন্য মেসেজ টেমপ্লেট তৈরি করুন
                </DialogDescription>
              </DialogHeader>

              <Form {...templateForm}>
                <form onSubmit={templateForm.handleSubmit(onTemplateSubmit)} className="space-y-4">
                  <FormField
                    control={templateForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>টেমপ্লেট নাম *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="যেমন: ফলোআপ মেসেজ"
                            {...field}
                            data-testid="input-template-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={templateForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>মেসেজ *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="আসসালামু আলাইকুম {client_name}, আপনার প্রোজেক্টের আপডেট দিতে যোগাযোগ করলাম..."
                            rows={5}
                            {...field}
                            data-testid="textarea-template-message"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>প্লেসহোল্ডার:</strong> {"{client_name}"} = ক্লায়েন্টের নাম, {"{client_phone}"} = ফোন নম্বর
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={templateForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>ডিফল্ট টেমপ্লেট</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            এই টেমপ্লেট স্বয়ংক্রিয়ভাবে নির্বাচিত হবে
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-default-template"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={closeTemplateDialog}
                      data-testid="button-cancel-template"
                    >
                      বাতিল
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                      data-testid="button-submit-template"
                    >
                      {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? "সেভ হচ্ছে..." : 
                       editingTemplate ? "আপডেট করুন" : "টেমপ্লেট তৈরি করুন"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-message">
                <MessageCircle className="h-4 w-4 mr-2" />
                মেসেজ পাঠান
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>হোয়াটসঅ্যাপ মেসেজ তৈরি করুন</DialogTitle>
                <DialogDescription>
                  ক্লায়েন্ট নির্বাচন করে প্রি-ফিল্ড মেসেজ লিংক তৈরি করুন
                </DialogDescription>
              </DialogHeader>

              <Form {...messagingForm}>
                <form onSubmit={messagingForm.handleSubmit(onMessageSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={messagingForm.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ক্লায়েন্ট নির্বাচন *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleClientSelect(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-client-messaging">
                                <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(clients as any[]).map((client: any) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name} ({client.phone})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={messagingForm.control}
                      name="templateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>টেমপ্লেট (ঐচ্ছিক)</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleTemplateSelect(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-template">
                                <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="custom">কাস্টম মেসেজ</SelectItem>
                              {(templates as WhatsAppTemplate[]).map((template: WhatsAppTemplate) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                  {template.isDefault && <Star className="h-3 w-3 ml-1 inline" />}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={messagingForm.control}
                    name="customMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>মেসেজ *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="আপনার মেসেজ লিখুন..."
                            rows={4}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              updatePreview(e.target.value);
                            }}
                            data-testid="textarea-custom-message"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          <strong>প্লেসহোল্ডার:</strong> {"{client_name}"} = ক্লায়েন্টের নাম, {"{client_phone}"} = ফোন নম্বর
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message Preview */}
                  {previewMessage && selectedClient && (
                    <div className="bg-muted p-4 rounded-lg">
                      <Label className="text-sm font-semibold">মেসেজ প্রিভিউ:</Label>
                      <p className="mt-2 text-sm whitespace-pre-wrap" data-testid="text-message-preview">
                        {previewMessage}
                      </p>
                    </div>
                  )}

                  {/* Generated Link */}
                  {generatedLink && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <Label className="text-sm font-semibold text-green-800 dark:text-green-300">
                        হোয়াটসঅ্যাপ লিংক তৈরি হয়েছে:
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input 
                          value={generatedLink} 
                          readOnly 
                          className="bg-white dark:bg-gray-800"
                          data-testid="input-generated-link"
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(generatedLink)}
                          data-testid="button-copy-link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="button"
                          size="sm"
                          onClick={openWhatsApp}
                          data-testid="button-open-whatsapp"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          খুলুন
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsMessageDialogOpen(false)}
                      data-testid="button-cancel-message"
                    >
                      বাতিল
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={generateLinkMutation.isPending}
                      data-testid="button-generate-link"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {generateLinkMutation.isPending ? "তৈরি হচ্ছে..." : "লিংক তৈরি করুন"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Admin Contact Info */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-300">অ্যাডমিন যোগাযোগ তথ্য</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 dark:text-blue-400">
            <strong>হোয়াটসঅ্যাপ নম্বর:</strong> +৮৮০১৭৯৮২০৫১৪৩
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
            সব মেসেজ এই নম্বরে পাঠানো হবে। ক্লায়েন্টরা এই নম্বরে মেসেজ পাঠাতে পারবেন।
          </p>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">সেভ করা টেমপ্লেট</h2>
        <div className="grid gap-4">
          {(templates as WhatsAppTemplate[]).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">এখনো কোনো টেমপ্লেট তৈরি হয়নি</p>
                <p className="text-sm text-muted-foreground">উপরের বাটনে ক্লিক করে নতুন টেমপ্লেট তৈরি করুন</p>
              </CardContent>
            </Card>
          ) : (
            (templates as WhatsAppTemplate[]).map((template: WhatsAppTemplate) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg" data-testid={`text-template-name-${template.id}`}>
                      {template.name}
                    </CardTitle>
                    {template.isDefault && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        ডিফল্ট
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditingTemplate(template)}
                      data-testid={`button-edit-template-${template.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                      disabled={deleteTemplateMutation.isPending}
                      data-testid={`button-delete-template-${template.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap" data-testid={`text-template-message-${template.id}`}>
                    {template.message}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
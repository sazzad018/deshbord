import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ExternalLink, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Client {
  id: string;
  name: string;
  whatsappNumber: string | null;
  phone: string | null;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WhatsAppShortcutProps {
  selectedClientId?: string;
}

export default function WhatsAppShortcut({ selectedClientId }: WhatsAppShortcutProps) {
  const { toast } = useToast();
  const [clientId, setClientId] = useState(selectedClientId || "");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Fetch WhatsApp templates
  const { data: templates = [] } = useQuery<WhatsAppTemplate[]>({
    queryKey: ["/api/whatsapp-templates"],
  });

  // Update clientId when selectedClientId changes
  useEffect(() => {
    if (selectedClientId) {
      setClientId(selectedClientId);
    }
  }, [selectedClientId]);

  // Auto-select default template on mount
  useEffect(() => {
    const defaultTemplate = templates.find(t => t.isDefault);
    if (defaultTemplate && !selectedTemplate) {
      setSelectedTemplate(defaultTemplate.id);
    }
  }, [templates, selectedTemplate]);

  // Update message when template changes
  useEffect(() => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      const selectedClient = clients.find(c => c.id === clientId);
      let templateMessage = template.message;
      
      // Replace placeholders
      if (selectedClient) {
        templateMessage = templateMessage
          .replace(/\{client_name\}/g, selectedClient.name)
          .replace(/\{client_phone\}/g, selectedClient.phone || "")
          .replace(/\{whatsapp_number\}/g, selectedClient.whatsappNumber || "");
      }
      
      setMessage(templateMessage);
    }
  }, [selectedTemplate, clientId, templates, clients]);

  // Generate WhatsApp link
  const generateWhatsAppLink = () => {
    const selectedClient = clients.find(c => c.id === clientId);
    
    if (!selectedClient) {
      toast({
        title: "ত্রুটি",
        description: "ক্লায়েন্ট নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "ত্রুটি",
        description: "মেসেজ লিখুন",
        variant: "destructive",
      });
      return;
    }

    // Use WhatsApp number if available, otherwise use phone number
    const phoneNumber = selectedClient.whatsappNumber || selectedClient.phone;
    
    if (!phoneNumber) {
      toast({
        title: "ত্রুটি",
        description: "ক্লায়েন্টের ফোন নাম্বার নেই",
        variant: "destructive",
      });
      return;
    }

    // Clean phone number - remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    
    // Generate WhatsApp link
    const encodedMessage = encodeURIComponent(message.trim());
    const link = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    setGeneratedLink(link);
    
    // Open WhatsApp
    window.open(link, "_blank");
    
    toast({
      title: "সফল",
      description: "হোয়াটসঅ্যাপ খোলা হচ্ছে...",
    });
  };

  const selectedClient = clients.find(c => c.id === clientId);
  const clientsWithPhone = clients.filter(c => c.whatsappNumber || c.phone);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            হোয়াটসঅ্যাপ শর্টকাট
          </CardTitle>
          <Link href="/whatsapp">
            <Button variant="ghost" size="sm" data-testid="link-full-whatsapp">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Client Selection */}
        <div>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger data-testid="select-whatsapp-client">
              <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {clientsWithPhone.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center gap-2">
                    {client.name}
                    <Badge variant="outline" className="text-xs">
                      {client.whatsappNumber || client.phone}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template Selection */}
        {templates.length > 0 && (
          <div>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger data-testid="select-whatsapp-template">
                <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">কাস্টম মেসেজ</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      {template.name}
                      {template.isDefault && <Star className="h-3 w-3 text-yellow-500" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Message Input */}
        <div>
          <Textarea
            placeholder="মেসেজ লিখুন..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="text-sm"
            data-testid="textarea-whatsapp-message"
          />
          {selectedClient && (
            <p className="text-xs text-muted-foreground mt-1">
              পাঠানো হবে: {selectedClient.name} ({selectedClient.whatsappNumber || selectedClient.phone})
            </p>
          )}
        </div>

        {/* Send Button */}
        <Button 
          onClick={generateWhatsAppLink}
          disabled={!clientId || !message.trim()}
          className="w-full bg-green-600 hover:bg-green-700"
          data-testid="button-send-whatsapp"
        >
          <Send className="h-4 w-4 mr-2" />
          হোয়াটসঅ্যাপে পাঠান
        </Button>

        {/* Quick Stats */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>টেমপ্লেট: {templates.length}</span>
          <span>ক্লায়েন্ট: {clientsWithPhone.length}</span>
        </div>
      </CardContent>
    </Card>
  );
}
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils-dashboard";
import type { Client, ClientWithLogs } from "@shared/schema";

interface ClientDetailsPanelProps {
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
}

export default function ClientDetailsPanel({ selectedClientId, onSelectClient }: ClientDetailsPanelProps) {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: clientWithLogs } = useQuery<ClientWithLogs>({
    queryKey: ["/api/clients", selectedClientId],
    enabled: !!selectedClientId,
  });

  const selectedClient = clientWithLogs || clients.find(c => c.id === selectedClientId);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">ক্লায়েন্ট বিস্তারিত</CardTitle>
        <Select value={selectedClientId} onValueChange={onSelectClient}>
          <SelectTrigger data-testid="select-client-details">
            <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id} data-testid={`option-client-${client.id}`}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      
      <CardContent className="pt-0" data-testid="content-client-details">
        {!selectedClient ? (
          <div className="text-center text-muted-foreground py-8">
            একটি ক্লায়েন্ট নির্বাচন করুন
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">নাম</label>
              <p className="font-medium" data-testid="text-client-details-name">{selectedClient.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">ফোন</label>
              <p data-testid="text-client-details-phone">{selectedClient.phone}</p>
            </div>
            
            {selectedClient.fb && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">ফেসবুক</label>
                <a 
                  href={selectedClient.fb} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline block"
                  data-testid="link-client-details-fb"
                >
                  {selectedClient.fb}
                </a>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">ব্যালেন্স</label>
              <p 
                className={`font-semibold ${(selectedClient.walletDeposited - selectedClient.walletSpent) < 0 ? 'text-red-600' : 'text-green-600'}`}
                data-testid="text-client-details-balance"
              >
                {formatCurrency(selectedClient.walletDeposited - selectedClient.walletSpent)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">সার্ভিস স্কোপ</label>
              <div className="flex flex-wrap gap-1 mt-1" data-testid="div-client-details-scopes">
                {selectedClient.scopes.map((scope, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

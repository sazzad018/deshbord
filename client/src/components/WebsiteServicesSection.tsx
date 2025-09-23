import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Globe } from "lucide-react";

interface WebsiteServicesSectionProps {
  selectedClientId: string;
}

export default function WebsiteServicesSection({ selectedClientId }: WebsiteServicesSectionProps) {
  if (!selectedClientId) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5" />
              ওয়েবসাইট সার্ভিস প্রজেক্ট
            </CardTitle>
            <Button size="sm" disabled data-testid="button-add-website-project">
              <Plus className="h-4 w-4 mr-1" />
              নতুন প্রজেক্ট
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            একটি ক্লায়েন্ট নির্বাচন করুন প্রজেক্ট দেখতে
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            ওয়েবসাইট সার্ভিস প্রজেক্ট
          </CardTitle>
          <Button size="sm" data-testid="button-add-website-project">
            <Plus className="h-4 w-4 mr-1" />
            নতুন প্রজেক্ট
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Sample Website Projects - will be replaced with real data */}
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="bg-green-600">সম্পন্ন</Badge>
                  <span className="font-medium">ই-কমার্স ওয়েবসাইট</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  সম্পূর্ণ রেসপন্সিভ ই-কমার্স সাইট, পেমেন্ট গেটওয়ে সহ
                </p>
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/clients/${selectedClientId}/details`);
                        const clientData = await response.json();
                        if (clientData.portalKey) {
                          window.open(`/portal/${clientData.portalKey}`, '_blank');
                        }
                      } catch (error) {
                        console.error('Failed to get portal key:', error);
                      }
                    }}
                    data-testid="button-client-portal"
                  >
                    ক্লায়েন্ট পোর্টাল
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open('https://example-site.com', '_blank')}
                  >
                    লাইভ সাইট দেখুন
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  সম্পন্ন: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-600 text-white">চলমান</Badge>
                  <span className="font-medium">কর্পোরেট ওয়েবসাইট</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  প্রফেশনাল কর্পোরেট সাইট ডিজাইন এবং ডেভেলপমেন্ট
                </p>
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/clients/${selectedClientId}/details`);
                        const clientData = await response.json();
                        if (clientData.portalKey) {
                          window.open(`/portal/${clientData.portalKey}`, '_blank');
                        }
                      } catch (error) {
                        console.error('Failed to get portal key:', error);
                      }
                    }}
                    data-testid="button-client-portal-2"
                  >
                    ক্লায়েন্ট পোর্টাল
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled
                  >
                    ডেভেলপমেন্ট চলছে
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  শুরু: {new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              ক্লায়েন্ট পোর্টাল দিয়ে আপনার ক্লায়েন্ট তাদের প্রজেক্টের অগ্রগতি এবং খরচের বিস্তারিত দেখতে পারবেন
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
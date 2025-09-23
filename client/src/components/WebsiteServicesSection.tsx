import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebsiteServicesSectionProps {
  selectedClientId: string;
}

export default function WebsiteServicesSection({ selectedClientId }: WebsiteServicesSectionProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'চলমান',
    websiteUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would typically save to backend
      toast({
        title: "সফল!",
        description: "নতুন ওয়েবসাইট প্রজেক্ট যোগ করা হয়েছে।",
      });
      setIsDialogOpen(false);
      setProjectForm({ name: '', description: '', status: 'চলমান', websiteUrl: '' });
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "প্রজেক্ট যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-website-project">
                <Plus className="h-4 w-4 mr-1" />
                নতুন প্রজেক্ট
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>নতুন ওয়েবসাইট প্রজেক্ট যোগ করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">প্রজেক্টের নাম</Label>
                  <Input
                    id="project-name"
                    type="text"
                    placeholder="যেমন: ই-কমার্স ওয়েবসাইট"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    data-testid="input-project-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">প্রজেক্টের বিবরণ</Label>
                  <Textarea
                    id="project-description"
                    placeholder="প্রজেক্টের বিস্তারিত বর্ণনা লিখুন"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    data-testid="textarea-project-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-status">স্ট্যাটাস</Label>
                  <Select value={projectForm.status} onValueChange={(value) => setProjectForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger data-testid="select-project-status">
                      <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="চলমান">চলমান</SelectItem>
                      <SelectItem value="সম্পন্ন">সম্পন্ন</SelectItem>
                      <SelectItem value="বিরতি">বিরতি</SelectItem>
                      <SelectItem value="বাতিল">বাতিল</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website-url">ওয়েবসাইট URL (ঐচ্ছিক)</Label>
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://example.com"
                    value={projectForm.websiteUrl}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    data-testid="input-website-url"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel-project"
                  >
                    বাতিল
                  </Button>
                  <Button type="submit" data-testid="button-save-project">
                    সংরক্ষণ করুন
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
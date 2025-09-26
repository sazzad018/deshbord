import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Plus, Clock, CheckCircle, AlertCircle, PauseCircle, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import type { WebsiteProject, Client } from "@shared/schema";

interface ClientWebsiteProjectsPanelProps {
  selectedClientId: string;
}

const PROJECT_STATUS_CONFIG = {
  "পরিকল্পনা": { icon: Clock, color: "bg-blue-500", textColor: "text-blue-600", bgColor: "bg-blue-50" },
  "চলমান": { icon: PlayCircle, color: "bg-yellow-500", textColor: "text-yellow-600", bgColor: "bg-yellow-50" },
  "পরীক্ষা": { icon: AlertCircle, color: "bg-purple-500", textColor: "text-purple-600", bgColor: "bg-purple-50" },
  "সম্পূর্ণ": { icon: CheckCircle, color: "bg-green-500", textColor: "text-green-600", bgColor: "bg-green-50" },
  "স্থগিত": { icon: PauseCircle, color: "bg-red-500", textColor: "text-red-600", bgColor: "bg-red-50" },
};

export function ClientWebsiteProjectsPanel({ selectedClientId }: ClientWebsiteProjectsPanelProps) {
  const { data: projects = [], isLoading } = useQuery<WebsiteProject[]>({
    queryKey: ["/api/website-projects"],
    select: (data) => data.filter(project => project.clientId === selectedClientId),
    enabled: !!selectedClientId,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const selectedClient = clients.find(client => client.id === selectedClientId);

  if (!selectedClientId) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              প্রজেক্ট ডিটেলস
            </CardTitle>
            <Button size="sm" disabled variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              নতুন প্রজেক্ট
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 py-8">
            <Globe className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm">একটি ক্লায়েন্ট নির্বাচন করুন প্রজেক্ট দেখতে</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border-blue-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            {selectedClient?.name} এর প্রজেক্ট
          </CardTitle>
          <div className="flex gap-2">
            <Link href="/website-projects">
              <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                সব প্রজেক্ট
              </Button>
            </Link>
            <Link href="/website-projects">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                নতুন প্রজেক্ট
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-slate-500 py-6">
            <Globe className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm">এই ক্লায়েন্টের কোন প্রজেক্ট নেই</p>
            <Link href="/website-projects">
              <Button size="sm" variant="outline" className="mt-3">
                প্রথম প্রজেক্ট যোগ করুন
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {projects.map((project) => {
              const statusConfig = PROJECT_STATUS_CONFIG[project.projectStatus as keyof typeof PROJECT_STATUS_CONFIG];
              const StatusIcon = statusConfig?.icon || Clock;
              
              return (
                <div 
                  key={project.id} 
                  className="border border-slate-200 rounded-lg p-3 hover:border-blue-200 transition-colors"
                  data-testid={`project-card-${project.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900 truncate" data-testid={`project-name-${project.id}`}>
                          {project.projectName}
                        </h4>
                        <Badge 
                          className={`${statusConfig?.bgColor} ${statusConfig?.textColor} border-0 text-xs`}
                          data-testid={`project-status-${project.id}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {project.projectStatus}
                        </Badge>
                      </div>
                      
                      {project.websiteUrl && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                          <ExternalLink className="w-3 h-3" />
                          <a 
                            href={project.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline truncate"
                            data-testid={`project-url-${project.id}`}
                          >
                            {project.websiteUrl}
                          </a>
                        </div>
                      )}
                      
                      {project.notes && (
                        <p className="text-xs text-slate-600 line-clamp-2" data-testid={`project-notes-${project.id}`}>
                          {project.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      {new Date(project.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                    <Link href="/website-projects">
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50 h-6 px-2">
                        বিস্তারিত
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {projects.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>মোট: {projects.length}টি প্রজেক্ট</span>
              <span>
                সক্রিয়: {projects.filter(p => p.projectStatus !== "সম্পূর্ণ" && p.projectStatus !== "স্থগিত").length}টি
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
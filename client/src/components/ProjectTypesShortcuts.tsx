import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Monitor, 
  Layout, 
  ShoppingBag, 
  Smartphone, 
  Globe, 
  User, 
  FileText,
  Plus,
  Layers
} from "lucide-react";

// Project type interface
interface ProjectType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

const getProjectTypeIcon = (type: string) => {
  switch (type) {
    case 'website':
      return Monitor;
    case 'landing_page':
      return Layout;
    case 'e_commerce':
      return ShoppingBag;
    case 'mobile_app':
      return Smartphone;
    case 'web_app':
      return Globe;
    case 'portfolio':
      return User;
    case 'blog':
      return FileText;
    default:
      return Layers;
  }
};

const getProjectTypeColor = (type: string) => {
  switch (type) {
    case 'website':
      return {
        bg: "bg-blue-50 hover:bg-blue-100",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: "text-blue-600"
      };
    case 'landing_page':
      return {
        bg: "bg-green-50 hover:bg-green-100",
        border: "border-green-200",
        text: "text-green-700",
        icon: "text-green-600"
      };
    case 'e_commerce':
      return {
        bg: "bg-purple-50 hover:bg-purple-100",
        border: "border-purple-200",
        text: "text-purple-700",
        icon: "text-purple-600"
      };
    case 'mobile_app':
      return {
        bg: "bg-orange-50 hover:bg-orange-100",
        border: "border-orange-200",
        text: "text-orange-700",
        icon: "text-orange-600"
      };
    case 'web_app':
      return {
        bg: "bg-cyan-50 hover:bg-cyan-100",
        border: "border-cyan-200",
        text: "text-cyan-700",
        icon: "text-cyan-600"
      };
    case 'portfolio':
      return {
        bg: "bg-pink-50 hover:bg-pink-100",
        border: "border-pink-200",
        text: "text-pink-700",
        icon: "text-pink-600"
      };
    case 'blog':
      return {
        bg: "bg-yellow-50 hover:bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-700",
        icon: "text-yellow-600"
      };
    default:
      return {
        bg: "bg-gray-50 hover:bg-gray-100",
        border: "border-gray-200",
        text: "text-gray-700",
        icon: "text-gray-600"
      };
  }
};

export default function ProjectTypesShortcuts() {
  const { data: projectTypes = [], isLoading } = useQuery<ProjectType[]>({
    queryKey: ["/api/project-types"],
  });


  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            প্রজেক্ট টাইপ শর্টকাট
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-14 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by default first, then by created date
  const sortedProjectTypes = projectTypes
    .filter(type => type.isActive)
    .sort((a, b) => {
      if (a.isDefault !== b.isDefault) {
        return a.isDefault ? -1 : 1; // Default types first
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return (
    <Card className="rounded-2xl shadow-sm border-blue-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            প্রজেক্ট টাইপ শর্টকাট
            <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              {sortedProjectTypes.length}টি
            </Badge>
          </CardTitle>
          <Link href="/project-management">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              data-testid="button-goto-project-management"
            >
              <Plus className="h-4 w-4 mr-1" />
              নতুন প্রজেক্ট
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {sortedProjectTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>কোনো প্রজেক্ট টাইপ পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {sortedProjectTypes.map((projectType) => {
              const IconComponent = getProjectTypeIcon(projectType.name);
              const colors = getProjectTypeColor(projectType.name);
              
              return (
                <Link key={projectType.id} href="/project-management">
                  <Button
                    variant="outline"
                    className={`h-auto p-3 ${colors.bg} ${colors.border} hover:scale-105 transition-all duration-200 w-full`}
                    data-testid={`shortcut-${projectType.name}`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                      <div>
                        <div className={`text-sm font-medium ${colors.text}`}>
                          {projectType.displayName}
                        </div>
                        {projectType.isDefault && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs mt-1 bg-white/60 border-white/40"
                          >
                            ডিফল্ট
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
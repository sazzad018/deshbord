import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2 } from "lucide-react";

interface MinimizableCardProps {
  id: string;
  defaultMinimized?: boolean;
  children: React.ReactNode;
}

export function MinimizableCard({ id, defaultMinimized = false, children }: MinimizableCardProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);

  // Load minimized state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`minimized-${id}`);
    if (savedState) {
      setIsMinimized(JSON.parse(savedState));
    }
  }, [id]);

  // Save minimized state to localStorage
  useEffect(() => {
    localStorage.setItem(`minimized-${id}`, JSON.stringify(isMinimized));
  }, [id, isMinimized]);

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="relative group" data-testid={`minimizable-card-${id}`}>
      {/* Minimize/Maximize Button */}
      <Button
        size="sm"
        variant="ghost" 
        onClick={toggleMinimized}
        className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-white rounded-full shadow-sm border h-8 w-8 p-0"
        data-testid={`toggle-minimize-${id}`}
      >
        {isMinimized ? (
          <Maximize2 className="h-3 w-3 text-gray-600" />
        ) : (
          <Minimize2 className="h-3 w-3 text-gray-600" />
        )}
      </Button>
      
      {/* Content - conditionally rendered based on minimized state */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isMinimized ? 'max-h-12' : 'max-h-full'
        }`}
      >
        {isMinimized ? (
          // Minimized view - show only header/title
          <Card className="rounded-2xl shadow-sm border-gray-200">
            <div className="p-4 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600 truncate">
                {/* Extract title from children if possible, otherwise show generic text */}
                কম্পোনেন্ট মিনিমাইজড
              </div>
              <div className="text-xs text-gray-400">
                ক্লিক করুন দেখতে
              </div>
            </div>
          </Card>
        ) : (
          // Full view
          children
        )}
      </div>
    </div>
  );
}
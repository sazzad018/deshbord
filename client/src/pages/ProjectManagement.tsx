import { useState } from "react";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import RunningProjectsPanel from "@/components/RunningProjectsPanel";
import AdminProjectManagement from "@/components/AdminProjectManagement";
import ProjectListPanel from "@/components/ProjectListPanel";
import SalaryManagementPanel from "@/components/SalaryManagementPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, Clock, GripVertical, Minus, Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
  SortableContext as SortableProvider,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define card types for drag-and-drop
interface DashboardCard {
  id: string;
  title: string;
  icon: typeof Clock;
  component: string;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  isMinimized: boolean;
}

interface SortableCardProps {
  card: DashboardCard;
  children: React.ReactNode;
  onToggleMinimize: (cardId: string) => void;
}

function SortableCard({ card, children, onToggleMinimize }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className={`${card.borderColor} ${card.bgColor} shadow-lg transition-all duration-200 ${
        isDragging ? 'shadow-2xl scale-105' : ''
      }`}>
        <CardHeader className="pb-4 relative">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-xl font-bold ${card.iconColor} flex items-center gap-2`}>
              <card.icon className="h-6 w-6" />
              {card.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleMinimize(card.id)}
                data-testid={`button-toggle-${card.id}`}
                className="hover:bg-white/50"
              >
                {card.isMinimized ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </Button>
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-white/20 transition-colors"
                data-testid={`drag-handle-${card.id}`}
              >
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </CardHeader>
        {!card.isMinimized && (
          <CardContent>
            {children}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function ProjectManagement() {
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Initialize dashboard cards with their configurations
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([
    {
      id: "client-info",
      title: "ক্লায়েন্ট তালিকা ও প্রোজেক্ট সমূহ",
      icon: Users,
      component: "ProjectListPanel",
      borderColor: "border-2 border-blue-200",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-800",
      isMinimized: false,
    },
    {
      id: "salary-management",
      title: "স্যালারি ও ইমপ্লয়ী ম্যানেজমেন্ত",
      icon: Users,
      component: "SalaryManagementPanel",
      borderColor: "border-2 border-orange-200",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-800",
      isMinimized: false,
    },
    {
      id: "admin-project",
      title: "অ্যাডমিন প্রোজেক্ট ম্যানেজমেন্ট",
      icon: Settings,
      component: "AdminProjectManagement",
      borderColor: "border-2 border-purple-200",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-800",
      isMinimized: false,
    },
  ]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setDashboardCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const toggleMinimize = (cardId: string) => {
    setDashboardCards((cards) =>
      cards.map((card) =>
        card.id === cardId ? { ...card, isMinimized: !card.isMinimized } : card
      )
    );
  };

  const renderCardContent = (card: DashboardCard) => {
    switch (card.component) {
      case "RunningProjectsPanel":
        return <RunningProjectsPanel />;
      case "ProjectListPanel":
        return <ProjectListPanel />;
      case "SalaryManagementPanel":
        return <SalaryManagementPanel />;
      case "AdminProjectManagement":
        return <AdminProjectManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <TopBar 
        query={query} 
        setQuery={setQuery} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            ওয়েবসাইট এবং ল্যান্ডিং পেজ ম্যানেজমেন্ট সিস্টেম
          </h1>
          <p className="text-lg text-slate-600">
            ওয়েবসাইট ডেভেলপমেন্ট, ল্যান্ডিং পেজ ডিজাইন এবং প্রোজেক্ট ম্যানেজমেন্ট সিস্টেম
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            <span className="font-medium">Drag & Drop:</span> 
            সেকশনগুলিকে টানুন এবং পুনর্বিন্যাস করুন। মিনিমাইজ/ম্যাক্সিমাইজ বোতাম দিয়ে সেকশন লুকান।
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={dashboardCards.map(card => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {dashboardCards.map((card) => (
                <SortableCard key={card.id} card={card} onToggleMinimize={toggleMinimize}>
                  {renderCardContent(card)}
                </SortableCard>
              ))}
            </div>
          </SortableContext>
          
          <DragOverlay>
            {activeId ? (
              <Card className="shadow-2xl border-2 border-blue-300 bg-blue-50 opacity-80 rotate-3">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
                    <GripVertical className="h-6 w-6" />
                    {dashboardCards.find(card => card.id === activeId)?.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
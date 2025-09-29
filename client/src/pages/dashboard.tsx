import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
  SortableContext as SortableContextProvider,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import MetricsOverview from "@/components/MetricsOverview";
import ClientManagement from "@/components/ClientManagement";
import MeetingScheduler from "@/components/MeetingScheduler";
import AIQuerySystem from "@/components/AIQuerySystem";
import SpendChart from "@/components/SpendChart";
import ClientDetailsPanel from "@/components/ClientDetailsPanel";
import WebsiteServicesSection from "@/components/WebsiteServicesSection";
import { ClientWebsiteProjectsPanel } from "@/components/ClientWebsiteProjectsPanel";
import QuickActions from "@/components/QuickActions";
import ControlPanel from "@/components/ControlPanel";
import InvoiceMaker from "@/components/InvoiceMaker";
import RecentProjectsSummary from "@/components/RecentProjectsSummary";
import TodoListShort from "@/components/TodoListShort";
import WhatsAppShortcut from "@/components/WhatsAppShortcut";
import { MinimizableCard } from "@/components/MinimizableCard";
import { GripVertical } from "lucide-react";

// Component wrapper for making items sortable
interface SortableWrapperProps {
  id: string;
  children: React.ReactNode;
}

function SortableWrapper({ id, children }: SortableWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
      data-testid={`sortable-item-${id}`}
    >
      <div 
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 bg-white rounded p-1 shadow-sm border"
        data-testid={`drag-handle-${id}`}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <MinimizableCard id={id}>
        {children}
      </MinimizableCard>
    </div>
  );
}

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Component ordering state
  const [leftColumnOrder, setLeftColumnOrder] = useState([
    "recent-projects-summary",
    "client-management",
    "ai-query", 
    "spend-chart",
    "website-projects",
    "invoice-maker"
  ]);
  
  const [rightColumnOrder, setRightColumnOrder] = useState([
    "client-details",
    "quick-actions",
    "meeting-scheduler", 
    "todo-list",
    "whatsapp-shortcut",
    "control-panel"
  ]);

  // Load saved order from localStorage
  useEffect(() => {
    const savedLeftOrder = localStorage.getItem('dashboard-left-order');
    const savedRightOrder = localStorage.getItem('dashboard-right-order');
    
    if (savedLeftOrder) {
      setLeftColumnOrder(JSON.parse(savedLeftOrder));
    }
    if (savedRightOrder) {
      setRightColumnOrder(JSON.parse(savedRightOrder));
    }
  }, []);

  // Save order to localStorage when changed
  useEffect(() => {
    localStorage.setItem('dashboard-left-order', JSON.stringify(leftColumnOrder));
  }, [leftColumnOrder]);

  useEffect(() => {
    localStorage.setItem('dashboard-right-order', JSON.stringify(rightColumnOrder));
  }, [rightColumnOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px tolerance
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Component mapping
  const leftColumnComponents = {
    "client-management": (
      <ClientManagement
        query={query}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
      />
    ),
    "ai-query": <AIQuerySystem />,
    "spend-chart": <SpendChart />,
    "website-projects": <ClientWebsiteProjectsPanel selectedClientId={selectedClientId} />,
    "recent-projects-summary": <RecentProjectsSummary />,
    "invoice-maker": <InvoiceMaker />,
  };

  const rightColumnComponents = {
    "client-details": (
      <ClientDetailsPanel
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
      />
    ),
    "quick-actions": <QuickActions selectedClientId={selectedClientId} />,
    "meeting-scheduler": <MeetingScheduler selectedClientId={selectedClientId} />,
    "todo-list": <TodoListShort selectedClientId={selectedClientId} />,
    "whatsapp-shortcut": <WhatsAppShortcut selectedClientId={selectedClientId} />,
    "control-panel": <ControlPanel />,
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    console.log('Drag started:', event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    console.log('Drag ended:', { active: active.id, over: over?.id });
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      // Check which column the item belongs to
      const isLeftColumn = leftColumnOrder.includes(active.id as string);
      const isRightColumn = rightColumnOrder.includes(active.id as string);
      const overIsLeftColumn = leftColumnOrder.includes(over.id as string);
      const overIsRightColumn = rightColumnOrder.includes(over.id as string);

      console.log('Column check:', { isLeftColumn, isRightColumn, overIsLeftColumn, overIsRightColumn });

      if (isLeftColumn && overIsLeftColumn) {
        // Reorder within left column
        console.log('Reordering within left column');
        setLeftColumnOrder((items) => {
          const oldIndex = items.indexOf(active.id as string);
          const newIndex = items.indexOf(over.id as string);
          console.log('Left column move:', { oldIndex, newIndex });
          return arrayMove(items, oldIndex, newIndex);
        });
      } else if (isRightColumn && overIsRightColumn) {
        // Reorder within right column
        console.log('Reordering within right column');
        setRightColumnOrder((items) => {
          const oldIndex = items.indexOf(active.id as string);
          const newIndex = items.indexOf(over.id as string);
          console.log('Right column move:', { oldIndex, newIndex });
          return arrayMove(items, oldIndex, newIndex);
        });
      } else if (isLeftColumn && overIsRightColumn) {
        // Move from left to right column
        console.log('Moving from left to right column');
        setLeftColumnOrder((items) => items.filter(item => item !== active.id));
        setRightColumnOrder((items) => {
          const newIndex = items.indexOf(over.id as string);
          const newItems = [...items];
          newItems.splice(newIndex, 0, active.id as string);
          return newItems;
        });
      } else if (isRightColumn && overIsLeftColumn) {
        // Move from right to left column
        console.log('Moving from right to left column');
        setRightColumnOrder((items) => items.filter(item => item !== active.id));
        setLeftColumnOrder((items) => {
          const newIndex = items.indexOf(over.id as string);
          const newItems = [...items];
          newItems.splice(newIndex, 0, active.id as string);
          return newItems;
        });
      }
    }
  }

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
        <MetricsOverview />
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left Column - Sortable */}
            <div className="lg:col-span-2 space-y-6">
              <SortableContext 
                items={leftColumnOrder}
                strategy={verticalListSortingStrategy}
              >
                {leftColumnOrder.map((componentId) => (
                  <SortableWrapper key={componentId} id={componentId}>
                    {leftColumnComponents[componentId as keyof typeof leftColumnComponents]}
                  </SortableWrapper>
                ))}
              </SortableContext>
            </div>
            
            {/* Right Column - Sortable */}
            <div className="space-y-6">
              <SortableContext 
                items={rightColumnOrder}
                strategy={verticalListSortingStrategy}
              >
                {rightColumnOrder.map((componentId) => (
                  <SortableWrapper key={componentId} id={componentId}>
                    {rightColumnComponents[componentId as keyof typeof rightColumnComponents]}
                  </SortableWrapper>
                ))}
              </SortableContext>
            </div>
          </div>
          
          <DragOverlay>
            {activeId ? (
              <div className="opacity-80 rotate-3">
                <MinimizableCard id={activeId}>
                  {leftColumnComponents[activeId as keyof typeof leftColumnComponents] || 
                   rightColumnComponents[activeId as keyof typeof rightColumnComponents]}
                </MinimizableCard>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

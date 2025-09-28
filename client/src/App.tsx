import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationContainer from "@/components/NotificationContainer";
import Dashboard from "@/pages/dashboard";
import ClientPortal from "@/pages/client-portal";
import EmployeePortal from "@/pages/employee-portal";
import TodoList from "@/pages/TodoList";
import WhatsAppMessaging from "@/pages/WhatsAppMessaging";
import SavedPDFs from "@/pages/SavedPDFs";
import InvoiceMakerPage from "@/pages/InvoiceMaker";
import ClientManagementPage from "@/pages/ClientManagement";
import WebsiteProjectsPage from "@/pages/WebsiteProjectsPage";
import PaymentManagement from "@/pages/PaymentManagement";
import ControlPanel from "@/components/ControlPanel";

function AdminRoutes() {
  return (
    <NotificationProvider role="admin" userId="admin">
      <NotificationContainer />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/clients" component={ClientManagementPage} />
        <Route path="/invoice-maker" component={InvoiceMakerPage} />
        <Route path="/todo-list" component={TodoList} />
        <Route path="/whatsapp-messaging" component={WhatsAppMessaging} />
        <Route path="/saved-pdfs" component={SavedPDFs} />
        <Route path="/website-projects" component={WebsiteProjectsPage} />
        <Route path="/payment-management" component={PaymentManagement} />
        <Route path="/control-panel" component={ControlPanel} />
      </Switch>
    </NotificationProvider>
  );
}

function Router() {
  return (
    <Switch>
      {/* Client portal doesn't need notifications */}
      <Route path="/portal/:portalKey" component={ClientPortal} />
      
      {/* Employee portal doesn't need notifications */}
      <Route path="/employee-portal" component={EmployeePortal} />
      
      {/* All admin routes wrapped with notifications */}
      <Route>
        <AdminRoutes />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

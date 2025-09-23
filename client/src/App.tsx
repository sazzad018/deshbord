import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import ClientPortal from "@/pages/client-portal";
import TodoList from "@/pages/TodoList";
import WhatsAppMessaging from "@/pages/WhatsAppMessaging";
import SavedPDFs from "@/pages/SavedPDFs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/todo-list" component={TodoList} />
      <Route path="/whatsapp-messaging" component={WhatsAppMessaging} />
      <Route path="/saved-pdfs" component={SavedPDFs} />
      <Route path="/portal/:portalKey" component={ClientPortal} />
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

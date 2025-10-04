import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAuthenticated } from "@/lib/auth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CampaignView from "@/pages/campaign-view";
import BackupImport from "@/pages/BackupImport";
import DemoBooking from "@/pages/demo-booking";
import AboutUs from "@/pages/about";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Security from "@/pages/security";
import Compliance from "@/pages/compliance";
import ApiDocs from "@/pages/api-docs";
import Features from "@/pages/features";
import NotFound from "@/pages/not-found";

// Protected Route component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  
  if (!isAuthenticated()) {
    setLocation("/");
    return null;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/about" component={AboutUs} />
      <Route path="/demo" component={DemoBooking} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/security" component={Security} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route path="/features" component={Features} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/campaign/:id">
        <ProtectedRoute component={CampaignView} />
      </Route>
      <Route path="/backup-import">
        <ProtectedRoute component={BackupImport} />
      </Route>
      <Route component={NotFound} />
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

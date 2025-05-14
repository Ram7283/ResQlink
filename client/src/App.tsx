import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import AdminDashboard from "@/pages/admin/dashboard";
import VolunteerDashboard from "@/pages/volunteer/dashboard";
import CitizenDashboard from "@/pages/citizen/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      
      {/* Admin routes */}
      <ProtectedRoute 
        path="/admin/dashboard" 
        component={AdminDashboard}
        allowedRoles={["admin"]} 
      />
      
      {/* Volunteer routes */}
      <ProtectedRoute 
        path="/volunteer/dashboard" 
        component={VolunteerDashboard}
        allowedRoles={["volunteer"]} 
      />
      
      {/* Citizen routes */}
      <ProtectedRoute 
        path="/citizen/dashboard" 
        component={CitizenDashboard}
        allowedRoles={["citizen"]} 
      />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Triage from "@/pages/Triage";
import Patients from "@/pages/Patients";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/triage" component={Triage} />
      <Route path="/patients" component={Patients} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
          <Sidebar />
          <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1 w-full max-w-[1600px] mx-auto">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

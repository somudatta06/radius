import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import AnalysisPage from "@/pages/AnalysisPage";
import Dashboard from "@/pages/Dashboard";
import CompetitorPage from "@/pages/CompetitorPage";
import KnowledgeBasePage from "@/pages/KnowledgeBasePage";
import RedditDashboard from "@/pages/RedditDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analysis/:analysisId" component={AnalysisPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/competitors" component={CompetitorPage} />
      <Route path="/knowledge-base" component={KnowledgeBasePage} />
      <Route path="/reddit" component={RedditDashboard} />
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

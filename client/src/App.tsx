import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { LectureProvider } from "@/context/LectureContext";
import { Navigation } from "@/components/Navigation";
import Home from "@/pages/Home";
import LectureView from "@/pages/LectureView";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateLecture from "@/pages/CreateLecture";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/lecture/:id" component={LectureView} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/create" component={CreateLecture} />
      <Route path="/admin/edit/:id" component={CreateLecture} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LectureProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <Router />
              <Toaster />
            </div>
          </TooltipProvider>
        </LectureProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { LectureProvider } from "@/context/LectureContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import LectureView from "@/pages/LectureView";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateLecture from "@/pages/CreateLecture";
import AllLectures from "@/pages/AllLectures"; 
import Students from "@/pages/Students";
import StudentDashboard from "@/pages/StudentDashboard";
import EarthquakeHazardLecture from "@/pages/EarthquakeHazardLecture";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/" component={Home} />
      <Route path="/lecture/:id" component={LectureView} />
      <Route path="/earthquake-hazard-lecture" component={EarthquakeHazardLecture} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/lectures" component={AllLectures} />
      <Route path="/admin/create" component={CreateLecture} />
      <Route path="/admin/edit/:id" component={CreateLecture} />
      <Route path="/admin/students" component={Students} />
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProgressProvider>
          <LectureProvider>
            <TooltipProvider>
              <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <main className="flex-1">
                  <Router />
                </main>
                <Footer />
                <Toaster />
              </div>
            </TooltipProvider>
          </LectureProvider>
        </ProgressProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
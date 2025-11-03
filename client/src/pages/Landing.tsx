import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award, Shield, GraduationCap, Sparkles } from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Hazard Awareness Learning Platform</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Learn About Hazards
              <span className="block text-primary">Learn to Stay Safe</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Comprehensive educational platform designed to teach students about earthquakes, 
              floods, and other natural hazards through interactive lessons and engaging activities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => setLocation('/login')}
              >
                Get Started
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => setLocation('/')}
              >
                Browse Lectures
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose HAZ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers a comprehensive learning experience designed for both 
              students and educators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Interactive Lectures
              </h3>
              <p className="text-muted-foreground">
                Engage with rich content, videos, and interactive elements that make learning 
                about hazards both informative and enjoyable.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Progress Tracking
              </h3>
              <p className="text-muted-foreground">
                Monitor your learning journey with detailed progress tracking for lectures 
                and assessments.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Quizzes & Games
              </h3>
              <p className="text-muted-foreground">
                Test your knowledge with interactive quizzes and fun mini-games that reinforce 
                key concepts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Teacher Dashboard
              </h3>
              <p className="text-muted-foreground">
                Comprehensive dashboard for educators to manage students, create content, 
                and track classroom progress.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Safe & Secure
              </h3>
              <p className="text-muted-foreground">
                Your data is protected with industry-standard security measures and privacy controls.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Expert Content
              </h3>
              <p className="text-muted-foreground">
                Learn from carefully crafted educational content developed by safety experts 
                and educators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our platform today and begin your journey to understanding natural hazards 
            and staying safe.
          </p>
          <Button 
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => setLocation('/login')}
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}

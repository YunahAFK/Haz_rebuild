import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useLectures } from '@/context/LectureContext';
import { useProgress } from '@/context/ProgressContext';
import { Lecture } from '@shared/schema';
import { BookOpen, Award, TrendingUp, Clock, CheckCircle, Target } from 'lucide-react';
import { LectureCard } from '@/components/LectureCard';

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const { lectures, fetchLectures } = useLectures();
  const { lectureProgress, loading: progressLoading } = useProgress();
  const [publishedLectures, setPublishedLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    if (userProfile?.role === 'student') {
      fetchLectures();
    }
  }, [userProfile]);

  useEffect(() => {
    const published = lectures.filter(lecture => lecture.published);
    setPublishedLectures(published);
  }, [lectures]);

  // Calculate statistics
  const totalLectures = publishedLectures.length;
  const completedLectures = lectureProgress.filter(p => p.isCompleted).length;
  const inProgressLectures = lectureProgress.filter(p => p.isInProgress && !p.isCompleted).length;
  const completionRate = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  // Recent lectures
  const recentLectures = publishedLectures.slice(0, 6);
  const featuredLectures = publishedLectures.filter(lecture => lecture.featured).slice(0, 6);

  if (userProfile?.role !== 'student') {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">This page is only available to students.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userProfile.name}!
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey and explore new topics.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lectures</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLectures}</div>
              <p className="text-xs text-muted-foreground">Available to learn</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedLectures}</div>
              <p className="text-xs text-muted-foreground">Lectures finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressLectures}</div>
              <p className="text-xs text-muted-foreground">Currently learning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              Track your learning journey across all lectures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm text-muted-foreground">{completionRate}%</span>
              </div>
              <Progress value={completionRate} />
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">📚 {totalLectures} Lectures Available</span>
                <span className="text-muted-foreground">✓ {completedLectures} Completed</span>
                <span className="text-muted-foreground">🔄 {inProgressLectures} In Progress</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Lectures */}
        {featuredLectures.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Featured Lectures
                </h2>
                <p className="text-muted-foreground">Handpicked lectures to get you started</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Lectures */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                All Lectures
              </h2>
              <p className="text-muted-foreground">Explore all available lectures</p>
            </div>
            <Link href="/">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                View All →
              </Badge>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLectures.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        {totalLectures === 0 && (
          <Card className="mt-10">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>No Lectures Available</CardTitle>
              <CardDescription>
                Check back soon for new lectures from your teachers!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

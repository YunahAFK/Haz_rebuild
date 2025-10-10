import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLectures } from '@/context/LectureContext';
import { DeleteModal } from '@/components/DeleteModal';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Book, 
  PlusCircle, 
  Users, 
  Settings, 
  Eye,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [, setLocation] = useLocation();
  const { lectures, loading, fetchLectures, deleteLecture } = useLectures();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.role !== 'teacher') {
      setLocation('/');
      return;
    }
    fetchLectures();
  }, [userProfile]);

  const handleDeleteClick = (lectureId: string) => {
    setLectureToDelete(lectureId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (lectureToDelete) {
      try {
        await deleteLecture(lectureToDelete);
        toast({
          title: "Lecture deleted",
          description: "The lecture has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the lecture. Please try again.",
          variant: "destructive",
        });
      }
      setLectureToDelete(null);
    }
  };

  const totalLectures = lectures.length;
  const totalViews = lectures.reduce((sum, lecture) => sum + lecture.views, 0);
  const publishedLectures = lectures.filter(l => l.published).length;
  const averageRating = 4.8; // Mock data as rating system not implemented

  if (userProfile?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-screen sticky top-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-1" data-testid="text-panel-title">
              Admin Panel
            </h2>
            <p className="text-sm text-muted-foreground" data-testid="text-welcome">
              Welcome, {userProfile?.name}
            </p>
          </div>
          <nav className="px-3">
            <Link href="/admin">
              <a className="admin-sidebar-link active flex items-center px-3 py-3 rounded-md mb-1 text-sm" data-testid="link-dashboard">
                <BarChart3 className="w-5 h-5 mr-3" />
                Dashboard
              </a>
            </Link>
            <Link href="/admin/lectures">
              <a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground" data-testid="link-lectures">
                <Book className="w-5 h-5 mr-3" />
                All Lectures
              </a>
            </Link>
            <Link href="/admin/create">
              <a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground" data-testid="link-create">
                <PlusCircle className="w-5 h-5 mr-3" />
                Create Lecture
              </a>
            </Link>
            <Link href="/admin/students">
              <a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground" data-testid="link-students">
                <Users className="w-5 h-5 mr-3" />
                Students
              </a>
            </Link>
            <Link href="/admin/settings">
              <a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground" data-testid="link-settings">
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </a>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground" data-testid="text-dashboard-description">
              Manage your lectures and track student engagement
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg shadow-md p-6 border-l-4 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Lectures</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-total-lectures">
                    {totalLectures}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Book className="text-2xl text-primary w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
                {publishedLectures} published
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-md p-6 border-l-4 border-secondary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-total-views">
                    {totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Eye className="text-2xl text-secondary w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
                24% from last month
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-md p-6 border-l-4 border-accent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Students</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-active-students">
                    156
                  </p>
                </div>
                <div className="bg-accent/10 p-3 rounded-full">
                  <Users className="text-2xl text-accent w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
                8% from last month
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg. Rating</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-avg-rating">
                    {averageRating}
                  </p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-full">
                  <span className="text-2xl text-green-500">⭐</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
                0.3 from last month
              </p>
            </div>
          </div>

          {/* Recent Lectures Table */}
          <div className="bg-card rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-recent-lectures">
                  Recent Lectures
                </h2>
                <Link href="/admin/create">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-new-lecture">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Lecture
                  </Button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="lectures-table">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Views
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        Loading lectures...
                      </td>
                    </tr>
                  ) : lectures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        No lectures found. Create your first lecture to get started.
                      </td>
                    </tr>
                  ) : (
                    lectures.slice(0, 10).map((lecture) => (
                      <tr key={lecture.id} className="hover:bg-muted/50 transition" data-testid={`row-lecture-${lecture.id}`}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground" data-testid={`text-title-${lecture.id}`}>
                            {lecture.title}
                          </div>
                          <div className="text-xs text-muted-foreground" data-testid={`text-date-${lecture.id}`}>
                            {lecture.createdAt.toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize" data-testid={`badge-category-${lecture.id}`}>
                            {lecture.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground" data-testid={`text-views-${lecture.id}`}>
                          {lecture.views}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lecture.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`} data-testid={`badge-status-${lecture.id}`}>
                            {lecture.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Link href={`/lecture/${lecture.id}`}>
                              <button className="text-primary hover:text-primary/80" data-testid={`button-view-${lecture.id}`}>
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link href={`/admin/edit/${lecture.id}`}>
                              <button className="text-primary hover:text-primary/80" data-testid={`button-edit-${lecture.id}`}>
                                <Edit className="w-4 h-4" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDeleteClick(lecture.id)}
                              className="text-destructive hover:text-destructive/80"
                              data-testid={`button-delete-${lecture.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

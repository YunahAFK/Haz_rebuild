import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
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
  Search
} from 'lucide-react';
import { Lecture } from '@shared/schema';

const LECTURES_PER_PAGE = 10;

export default function AllLectures() {
  const { userProfile } = useAuth();
  const [, setLocation] = useLocation();
  const { lectures, loading, fetchLectures, deleteLecture } = useLectures();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredLectures = lectures.filter(lecture => {
    const searchTermMatch = searchTerm === '' ||
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const categoryMatch = selectedCategory === 'all' || lecture.category === selectedCategory;

    return searchTermMatch && categoryMatch;
  });

  const totalPages = Math.ceil(filteredLectures.length / LECTURES_PER_PAGE);
  const paginatedLectures = filteredLectures.slice(
    (currentPage - 1) * LECTURES_PER_PAGE,
    currentPage * LECTURES_PER_PAGE
  );
  
  const categories = Array.from(new Set(lectures.map(lecture => lecture.category)));

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
              <a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground" data-testid="link-dashboard">
                <BarChart3 className="w-5 h-5 mr-3" />
                Dashboard
              </a>
            </Link>
            <Link href="/admin/lectures">
              <a className="admin-sidebar-link active flex items-center px-3 py-3 rounded-md mb-1 text-sm" data-testid="link-lectures">
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-all-lectures-title">
                  All Lectures
                </h1>
                <p className="text-muted-foreground" data-testid="text-all-lectures-description">
                  Browse, manage, and edit all lectures.
                </p>
              </div>
              <Link href="/admin/create">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-new-lecture">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Lecture
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lectures Table */}
          <div className="bg-card rounded-lg shadow-md overflow-hidden">
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
                  ) : paginatedLectures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                        No lectures found.
                      </td>
                    </tr>
                  ) : (
                    paginatedLectures.map((lecture) => (
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
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
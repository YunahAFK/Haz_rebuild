import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAuth } from '@/context/AuthContext';
import { useLectures } from '@/context/LectureContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { 
  BarChart3, 
  Book, 
  PlusCircle, 
  Users, 
  Settings, 
  Save,
  Eye,
  Check
} from 'lucide-react';

const categories = [
  'mathematics',
  'science', 
  'programming',
  'language',
  'art',
  'biology',
  'geography',
  'economics',
  'other'
];

export default function CreateLecture() {
  const { userProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/admin/edit/:id');
  const { createLecture, updateLecture, fetchLectureById } = useLectures();
  const { toast } = useToast();
  const isEditing = Boolean(match && params?.id);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    author: userProfile?.name || '',
    content: '',
    published: false,
    featured: false,
    allowComments: true
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (userProfile?.role !== 'teacher') {
      setLocation('/');
      return;
    }
    
    if (userProfile?.name) {
      setFormData(prev => ({ ...prev, author: userProfile.name }));
    }

    if (isEditing && params?.id) {
      loadLectureForEdit(params.id);
    }
  }, [userProfile, isEditing, params?.id]);

  async function loadLectureForEdit(id: string) {
    try {
      const lecture = await fetchLectureById(id);
      if (lecture) {
        setFormData({
          title: lecture.title,
          category: lecture.category,
          author: lecture.author,
          content: lecture.content,
          published: lecture.published,
          featured: lecture.featured,
          allowComments: lecture.allowComments
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load lecture for editing.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const lectureData = {
        ...formData,
        published: isDraft ? false : formData.published
      };

      if (isEditing && params?.id) {
        await updateLecture(params.id, lectureData);
        toast({
          title: "Success",
          description: "Lecture updated successfully!",
        });
      } else {
        await createLecture(lectureData);
        toast({
          title: "Success", 
          description: "Lecture created successfully!",
        });
      }
      
      setLocation('/admin');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lecture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (userProfile?.role !== 'teacher') {
    return null;
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <aside className="w-64 bg-card border-r border-border min-h-screen">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-1">Admin Panel</h2>
            </div>
          </aside>
          <main className="flex-1 p-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading lecture...</p>
            </div>
          </main>
        </div>
      </div>
    );
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
              <a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground" data-testid="link-lectures">
                <Book className="w-5 h-5 mr-3" />
                All Lectures
              </a>
            </Link>
            <Link href="/admin/create">
              <a className="admin-sidebar-link active flex items-center px-3 py-3 rounded-md mb-1 text-sm" data-testid="link-create">
                <PlusCircle className="w-5 h-5 mr-3" />
                {isEditing ? 'Edit Lecture' : 'Create Lecture'}
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
              {isEditing ? 'Edit Lecture' : 'Create New Lecture'}
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-description">
              {isEditing ? 'Make changes to your existing lecture' : 'Fill in the details below to create a new lecture for students'}
            </p>
          </div>

          {/* Lecture Form */}
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
            {/* Title Input */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <Label htmlFor="lecture-title" className="block text-sm font-medium text-foreground mb-2">
                Lecture Title <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                id="lecture-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg"
                placeholder="e.g., Introduction to Quantum Physics"
                required
                data-testid="input-title"
              />
            </div>

            {/* Category and Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg shadow-md p-6">
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="capitalize">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-card rounded-lg shadow-md p-6">
                <Label htmlFor="author" className="block text-sm font-medium text-foreground mb-2">
                  Author Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Your name"
                  required
                  data-testid="input-author"
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <Label className="block text-sm font-medium text-foreground mb-4">
                Lecture Content <span className="text-destructive">*</span>
              </Label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Start writing your lecture content here..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                <span className="inline-flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Use the toolbar above to format your content. You can add headings, lists, images, and more.
                </span>
              </p>
            </div>

            {/* Additional Settings */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Additional Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: !!checked }))}
                    data-testid="checkbox-published"
                  />
                  <Label htmlFor="published" className="text-sm text-foreground">
                    Publish immediately
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
                    data-testid="checkbox-featured"
                  />
                  <Label htmlFor="featured" className="text-sm text-foreground">
                    Featured lecture
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allowComments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowComments: !!checked }))}
                    data-testid="checkbox-comments"
                  />
                  <Label htmlFor="allowComments" className="text-sm text-foreground">
                    Allow comments
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-end bg-card rounded-lg shadow-md p-6">
              <Button 
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                data-testid="button-save-draft"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button 
                type="button"
                variant="secondary"
                disabled={loading}
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
                data-testid="button-publish"
              >
                <Check className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : (isEditing ? 'Update Lecture' : 'Publish Lecture')}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

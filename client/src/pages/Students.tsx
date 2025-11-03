import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Book, PlusCircle, Users, Settings } from 'lucide-react';
import { User } from '@shared/schema';

export default function Students() {
  const { userProfile, fetchStudents, createUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  useEffect(() => {
    if (userProfile?.role !== 'teacher') {
      setLocation('/');
      return;
    }
    loadStudents();
  }, [userProfile]);

  async function loadStudents() {
    setLoading(true);
    if(fetchStudents) {
        const studentData = await fetchStudents();
        setStudents(studentData);
    }
    setLoading(false);
  }

  const handleCreateStudent = async () => {
    if (!name || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
        if(createUser){
            await createUser(email, password, name);
            toast({
                title: 'Student Created',
                description: 'The new student account has been created successfully.',
            });
            // Reset form fields
            setName('');
            setEmail('');
            setPassword('');
            setCreateModalOpen(false);
            // Refresh the student list to show the new student
            loadStudents();
        }
    } catch (error: any) {
      toast({
        title: 'Error creating student',
        description: error.message || 'Failed to create student account. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
              <a className="admin-sidebar-link active flex items-center px-3 py-3 rounded-md mb-1 text-sm" data-testid="link-students">
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Manage Students</h1>
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : `${students.length} student${students.length !== 1 ? 's' : ''} registered`}
              </p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Student
            </Button>
          </div>

          <div className="bg-card rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-muted-foreground">Loading students...</td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-base">No students found</p>
                        <p className="text-sm mt-1">Create a new student account to get started.</p>
                      </td>
                    </tr>
                  ) : students.map(student => (
                    <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.createdAt.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Student</DialogTitle>
                    <DialogDescription>
                        Enter the details below to create a new student account.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreateStudent}>Create Account</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
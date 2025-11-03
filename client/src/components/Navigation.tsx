import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, LogOut, User, Shield, Sparkles, Search } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { userProfile, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  return (
    <nav className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 group">
                             <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center group-hover:shadow-lg transition-shadow">
                 <Shield className="w-6 h-6 text-primary-foreground" />
               </div>
              <div>
                <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  HAZ
                </h1>
                <p className="text-xs text-muted-foreground">Hazard Awareness</p>
              </div>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === '/' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`} data-testid="nav-home">
                  Home
                </span>
              </Link>
              {userProfile?.role === 'teacher' && (
                <Link href="/admin">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.startsWith('/admin') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`} data-testid="nav-admin">
                    Admin
                  </span>
                </Link>
              )}
              {userProfile?.role === 'student' && (
                <Link href="/student/dashboard">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.startsWith('/student') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`} data-testid="nav-student-dashboard">
                    Dashboard
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
                             <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                 <Input
                   type="text"
                   placeholder="Search lectures..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10 pr-4 bg-muted/50 border focus:bg-background transition-colors"
                 />
               </div>
            </form>
          </div>
          
          {/* Right Side - User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {userProfile ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 hover:bg-muted/80"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                                     <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                     <span className="text-sm font-semibold text-primary-foreground">
                       {userProfile.name.charAt(0).toUpperCase()}
                     </span>
                   </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {userProfile.name}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {userProfile.role}
                    </span>
                  </div>
                </Button>
                
                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{userProfile.name}</p>
                        <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                        data-testid="button-logout"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button 
                onClick={() => setLocation('/login')}
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                data-testid="button-login"
              >
                Sign In
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
                             <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                 <Input
                   type="text"
                   placeholder="Search lectures..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10 bg-muted/50 border"
                 />
               </div>
            </form>

            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <div className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                location === '/' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}>
                Home
              </div>
            </Link>
            {userProfile?.role === 'teacher' && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <div className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  location.startsWith('/admin') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}>
                  Admin
                </div>
              </Link>
            )}
            {userProfile?.role === 'student' && (
              <Link href="/student/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <div className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  location.startsWith('/student') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}>
                  Dashboard
                </div>
              </Link>
            )}
            
            {userProfile ? (
              <div className="pt-4 border-t border-border">
                <div className="px-4 py-3 mb-2">
                  <p className="text-sm font-medium text-foreground">{userProfile.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userProfile.role}</p>
                </div>
                <Button 
                  onClick={handleLogout}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign Out
                </Button>
              </div>
                          ) : (
                <Button 
                  onClick={() => {
                    setLocation('/login');
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full mt-4 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  data-testid="button-login-mobile"
                >
                  Sign In
                </Button>
              )}
          </div>
        </div>
      )}
    </nav>
  );
}

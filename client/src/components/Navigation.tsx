import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { userProfile, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary" data-testid="logo">HAZ</h1>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <span className={`nav-link px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                    location === '/' ? 'text-foreground' : 'text-muted-foreground'
                  }`} data-testid="nav-home">
                    Home
                  </span>
                </Link>
                {userProfile?.role === 'teacher' && (
                  <Link href="/admin">
                    <span className={`nav-link px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      location.startsWith('/admin') ? 'text-foreground' : 'text-muted-foreground'
                    }`} data-testid="nav-admin">
                      Admin
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {userProfile ? (
              <>
                <span className="text-sm text-muted-foreground" data-testid="user-name">
                  {userProfile.name}
                </span>
                <Button 
                  onClick={handleLogout}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setLocation('/login')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-login"
              >
                Login
              </Button>
            )}
          </div>
          
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
        <div className="md:hidden border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/">
              <span className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                Home
              </span>
            </Link>
            {userProfile?.role === 'teacher' && (
              <Link href="/admin">
                <span className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                  Admin
                </span>
              </Link>
            )}
            {userProfile ? (
              <Button 
                onClick={handleLogout}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Logout
              </Button>
            ) : (
              <Button 
                onClick={() => setLocation('/login')}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-login-mobile"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

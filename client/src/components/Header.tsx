import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";
import { 
  Building2, 
  Calculator, 
  Users, 
  Phone, 
  Menu, 
  X, 
  Sun, 
  Moon,
  LogIn,
  UserPlus
} from "lucide-react";

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isLoggedIn: boolean;
  userRole?: 'user' | 'admin';
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
}

export function Header({ 
  currentPage, 
  onPageChange, 
  isLoggedIn, 
  userRole,
  onLogin, 
  onSignup, 
  onLogout 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: "Home", id: "home", icon: Building2 },
    { name: "Services", id: "services", icon: Calculator },
    { name: "About", id: "about", icon: Users },
    { name: "Contact", id: "contact", icon: Phone },
  ];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    console.log('Theme toggled to:', theme === "light" ? "dark" : "light");
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Building2 className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold text-foreground">Bhalchandra Finance</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  onClick={() => {
                    onPageChange(item.id);
                    console.log('Navigated to:', item.name);
                  }}
                  data-testid={`nav-${item.id}`}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {userRole === 'admin' && (
                  <Badge variant="secondary" data-testid="admin-badge">
                    Admin
                  </Badge>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    onPageChange(userRole === 'admin' ? 'admin-dashboard' : 'user-dashboard');
                    console.log('Navigated to dashboard:', userRole);
                  }}
                  data-testid="button-dashboard"
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onLogout();
                    console.log('User logged out');
                  }}
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onLogin();
                    console.log('Login clicked');
                  }}
                  data-testid="button-login"
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
                <Button
                  onClick={() => {
                    onSignup();
                    console.log('Signup clicked');
                  }}
                  data-testid="button-signup"
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </>
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>

          {/* Mobile menu button */}
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onPageChange(item.id);
                      setMobileMenuOpen(false);
                      console.log('Mobile nav to:', item.name);
                    }}
                    data-testid={`mobile-nav-${item.id}`}
                    className="w-full justify-start flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}
              
              {/* Mobile User Actions */}
              <div className="border-t pt-4 mt-4">
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        onPageChange(userRole === 'admin' ? 'admin-dashboard' : 'user-dashboard');
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-dashboard"
                      className="w-full mb-2"
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-logout"
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogin();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-login"
                      className="w-full mb-2 justify-start flex items-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        onSignup();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-signup"
                      className="w-full mb-2 justify-start flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  onClick={toggleTheme}
                  data-testid="mobile-button-theme-toggle"
                  className="w-full justify-start flex items-center gap-2"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
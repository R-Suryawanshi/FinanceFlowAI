import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Calculator, 
  Users, 
  Phone, 
  Menu, 
  X, 
  LogIn,
  UserPlus,
  LayoutDashboard,
  User,
  LogOut,
  Bell,
  Check,
  Info,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isLoggedIn: boolean;
  userRole?: 'user' | 'admin';
  user?: { name: string; email: string; role?: string } | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
}

export function Header({ 
  currentPage, 
  onPageChange, 
  isLoggedIn, 
  userRole,
  user,
  onLogin, 
  onSignup, 
  onLogout 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const res = await fetch(`/api/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isLoggedIn]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navigation = [
    isLoggedIn
      ? {
          name: "Dashboard",
          id: userRole === "admin" ? "admin-dashboard" : "user-dashboard",
          icon: LayoutDashboard,
        }
      : { name: "Home", id: "home", icon: Building2 },
    { name: "Services", id: "services", icon: Calculator },
    { name: "About", id: "about", icon: Users },
    { name: "Contact", id: "contact", icon: Phone },
  ];

  return (
    <header className="bg-secondary text-secondary-foreground border-b border-secondary/15 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Building2 className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold text-secondary-foreground">Bhalchandra Finance</span>
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
                  className={`flex items-center gap-2 transition-all duration-205 ${
                    currentPage === item.id
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-white/10"
                  }`}
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
                  <Badge variant="secondary" data-testid="admin-badge" className="bg-primary text-primary-foreground font-semibold border-none">
                    Admin
                  </Badge>
                )}

                {/* Notification Bell Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-secondary-foreground border border-white/10 flex items-center justify-center focus-visible:ring-0"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 bg-secondary text-secondary-foreground border-white/15 p-2" align="end" forceMount>
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10">
                      <span className="text-sm font-bold">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] font-semibold text-primary hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <div className="max-h-[300px] overflow-y-auto space-y-1 py-1">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-secondary-foreground/60 font-medium">
                          No notifications at this time.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n.id);
                              if (n.actionUrl) onPageChange(n.actionUrl === "/dashboard" ? (userRole === "admin" ? "admin-dashboard" : "user-dashboard") : "home");
                            }}
                            className={`flex gap-3 p-2.5 rounded-lg text-xs cursor-pointer transition-all hover:bg-white/5 relative ${
                              !n.isRead ? "bg-white/[0.02]" : "opacity-75"
                            }`}
                          >
                            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                              n.type === "success" 
                                ? "bg-green-500/20 text-green-400" 
                                : n.type === "destructive" 
                                ? "bg-red-500/20 text-red-400" 
                                : "bg-blue-500/20 text-blue-400"
                            }`}>
                              {n.type === "success" ? (
                                <Check className="h-4 w-4" />
                              ) : n.type === "destructive" ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <Info className="h-4 w-4" />
                              )}
                            </div>
                            <div className="space-y-0.5 pr-4 flex-1">
                              <p className="font-bold text-secondary-foreground leading-tight">{n.title}</p>
                              <p className="text-[11px] text-secondary-foreground/75 leading-snug break-words">{n.message}</p>
                              <span className="text-[9px] text-secondary-foreground/50 block font-semibold pt-0.5">
                                {formatTimeAgo(n.createdAt)}
                              </span>
                            </div>
                            {!n.isRead && (
                              <span className="absolute right-3 top-4 h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-secondary-foreground border border-white/10 flex items-center justify-center focus-visible:ring-0"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-secondary text-secondary-foreground border-white/15" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal border-b border-white/10">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user?.name || "Member"}</p>
                        <p className="text-xs leading-none text-secondary-foreground/60">{user?.email || ""}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => {
                        const dashboardPage = userRole === 'admin' ? 'admin-dashboard' : 'user-dashboard';
                        onPageChange(dashboardPage);
                      }}
                      className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-secondary-foreground"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => {
                        onLogout();
                        console.log('User logged out');
                      }}
                      className="text-red-400 focus:text-red-400 hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={onLogin}
                  data-testid="button-login"
                  className="flex items-center gap-2 text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
                <Button
                  onClick={onSignup}
                  data-testid="button-signup"
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </>
            )}

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
          <div className="md:hidden border-t border-secondary-foreground/10 bg-secondary">
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
                    className={`w-full justify-start flex items-center gap-2 ${
                      currentPage === item.id 
                        ? "bg-primary text-primary-foreground font-bold shadow-sm" 
                        : "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}

              {/* Mobile User Actions */}
              <div className="border-t border-secondary-foreground/10 pt-4 mt-4">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2 mb-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-secondary-foreground">{user?.name || "Member"}</p>
                      <p className="text-xs text-secondary-foreground/60">{user?.email || ""}</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-logout"
                      className="w-full text-red-400 hover:text-red-300 hover:bg-white/10 flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={onLogin}
                      data-testid="mobile-button-login"
                      className="w-full mb-2 justify-start flex items-center gap-2 text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-white/10"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                    <Button
                      onClick={onSignup}
                      data-testid="mobile-button-signup"
                      className="w-full mb-2 justify-start flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
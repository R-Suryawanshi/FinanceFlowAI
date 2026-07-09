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
    <header 
      className="sticky top-4 mt-4 z-50 transition-all duration-300 w-[calc(100%-2rem)] max-w-7xl mx-auto bg-white/80 dark:bg-slate-950/85 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800/60 rounded-full shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-between items-center h-14 px-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Building2 className="h-8 w-8 mr-2 text-blue-700" />
            <span className="text-xl font-bold text-slate-950 dark:text-white">Bhalchandra Finance</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
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
                  className={`flex items-center gap-2 transition-all duration-205 rounded-full px-4 ${
                    currentPage === item.id
                      ? "bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-200 hover:text-blue-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {userRole === 'admin' && (
                  <Badge variant="secondary" data-testid="admin-badge" className="font-semibold border-none bg-blue-105 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                    Admin
                  </Badge>
                )}

                {/* Notification Bell Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full flex items-center justify-center border focus-visible:ring-0 bg-slate-100/80 dark:bg-slate-900/80 border-slate-250/30 dark:border-slate-850 text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/80"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-md">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 border p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/60 dark:border-slate-800" align="end" forceMount>
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-bold">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] font-semibold hover:underline text-blue-700 dark:text-blue-400"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                    <div className="max-h-[300px] overflow-y-auto space-y-1 py-1">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs font-medium text-slate-500">
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
                              <p className="font-bold leading-tight text-slate-900 dark:text-white">{n.title}</p>
                              <p className="text-[11px] leading-snug break-words text-slate-600 dark:text-slate-350">{n.message}</p>
                              <span className="text-[9px] block font-semibold pt-0.5 text-slate-400">
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
                      className="relative h-9 w-9 rounded-full flex items-center justify-center border focus-visible:ring-0 bg-slate-100/80 dark:bg-slate-900/80 border-slate-250/30 dark:border-slate-850 text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/80"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200/60 dark:border-slate-800" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal border-b border-slate-105 dark:border-slate-800">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user?.name || "Member"}</p>
                        <p className="text-xs leading-none opacity-60">{user?.email || ""}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                    <DropdownMenuItem
                      onClick={() => {
                        onPageChange("profile");
                      }}
                      className="cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 focus:bg-blue-50 dark:focus:bg-slate-800"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                    <DropdownMenuItem
                      onClick={() => {
                        onLogout();
                        console.log('User logged out');
                      }}
                      className="text-red-550 focus:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
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
                  className="flex items-center gap-2 rounded-full text-slate-700 dark:text-slate-200 hover:text-blue-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
                <Button
                  onClick={onSignup}
                  data-testid="button-signup"
                  className="flex items-center gap-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-sm"
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
              className="text-slate-800 dark:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl mt-2 space-y-1 border border-slate-200/50 dark:border-slate-800/60 w-[calc(100%-1rem)] mx-auto absolute left-2 right-2 z-50">
            <div className="space-y-1">
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
                    className={`w-full justify-start flex items-center gap-2 rounded-lg ${
                      currentPage === item.id 
                        ? "bg-blue-700 text-white font-bold shadow-sm" 
                        : "text-slate-700 dark:text-slate-200 hover:text-blue-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}

              {/* Mobile User Actions */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || "Member"}</p>
                      <p className="text-xs text-slate-500">{user?.email || ""}</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onPageChange("profile");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-slate-700 dark:text-slate-200 hover:text-blue-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 flex items-center justify-center gap-2 rounded-lg mb-2"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-logout"
                      className="w-full text-red-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center gap-2 rounded-lg"
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
                      className="w-full mb-2 justify-start flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-blue-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                    <Button
                      onClick={onSignup}
                      data-testid="mobile-button-signup"
                      className="w-full mb-2 justify-start flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg"
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
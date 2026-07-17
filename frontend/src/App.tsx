import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ThemeProvider } from "./components/ThemeProvider";
import { Header } from "./components/Header";
import { Hero } from "./pages/Hero";
import { EMICalculator } from "./pages/EMICalculator";
import { GoldLoanCalculator } from "./pages/GoldLoanCalculator";
import { FDCalculator } from "./pages/FDCalculator";
import { ServicesPage } from "./pages/ServicesPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminApplicationsPage } from "./pages/AdminApplicationsPage";
import { AdminPaymentsPage } from "./pages/AdminPaymentsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminEmployeesPage } from "./pages/AdminEmployeesPage";
import { AdminCustomersPage } from "./pages/AdminCustomersPage";
import { AdminAddEmployeePage } from "./pages/AdminAddEmployeePage";
import { AdminSidebar } from "./pages/AdminSidebar";
import { UserDashboard } from "./pages/UserDashboard";
import { LoanApplicationForm } from "./pages/LoanApplicationForm";
import { ChatBot } from "./components/ChatBot";
import ProfilePage from "./pages/ProfilePage";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
}

function App() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState("home");
  const [pageHistory, setPageHistory] = useState<string[]>(["home"]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const rootPages = ["home", "admin-dashboard", "user-dashboard"];
    
    setPageHistory(prev => {
      // If navigating back to the second-to-last item, pop the last item.
      if (prev.length > 1 && prev[prev.length - 2] === currentPage) {
        return prev.slice(0, -1);
      }
      
      // If the current page is a root page, reset history to just this root page.
      if (rootPages.includes(currentPage)) {
        return [currentPage];
      }
      
      // If the current page is already the last item in the history stack, do nothing.
      if (prev[prev.length - 1] === currentPage) return prev;
      
      // Otherwise, push the new page to history.
      return [...prev, currentPage];
    });
  }, [currentPage]);

  const handleBack = () => {
    if (pageHistory.length > 1) {
      const prevPage = pageHistory[pageHistory.length - 2];
      setCurrentPage(prevPage);
    } else {
      if (user) {
        setCurrentPage(user.role === "admin" ? "admin-dashboard" : "user-dashboard");
      } else {
        setCurrentPage("home");
      }
    }
  };

  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prefilledAmount, setPrefilledAmount] = useState<number | undefined>(undefined);
  const [prefilledTenure, setPrefilledTenure] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (authToken) fetchUserProfile();
  }, [authToken]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setCurrentPage(prev => prev === "home" ? (data.user.role === "admin" ? "admin-dashboard" : "user-dashboard") : prev);
      } else {
        setUser(null);
        setAuthToken(null);
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  // SAFE LOGIN (NEVER returns undefined)
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        return { success: false, error: "Invalid server response" };
      }

      if (data?.success && data?.token) {
        localStorage.setItem("authToken", data.token);
        setAuthToken(data.token);
        setUser(data.user);
        setAuthModalOpen(false);

        setCurrentPage(data.user.role === "admin" ? "admin-dashboard" : "user-dashboard");

        return { success: true, token: data.token };
      }

      return { success: false, error: data?.error || "Login failed" };
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, error: "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  // SAFE SIGNUP
  const handleSignup = async (userData: any) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data?.success) {
        localStorage.setItem("authToken", data.token);
        setAuthToken(data.token);
        setUser(data.user);
        setAuthModalOpen(false);
        setCurrentPage("user-dashboard");

        return { success: true };
      }

      return { success: false, error: data?.error || "Signup failed" };
    } catch {
      return { success: false, error: "Signup failed" };
    }
  };

  // Reset prefilled details on page changes to prevent stale data cross-population
  useEffect(() => {
    if (!currentPage.startsWith("loan-application-")) {
      setPrefilledAmount(undefined);
      setPrefilledTenure(undefined);
    }
  }, [currentPage]);

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem("authToken");
    setCurrentPage("home");
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentPage(user.role === "admin" ? "admin-dashboard" : "user-dashboard");
    } else {
      setAuthModalOpen(true);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <Hero onGetStarted={handleGetStarted} onLearnMore={() => setCurrentPage("about")} />;
      case "services":
        return (
          <ServicesPage
            onNavigateToCalculator={(t) =>
              setCurrentPage(t === "emi" ? "emi-calculator" : t === "gold" ? "gold-calculator" : "fd-calculator")
            }
            onGetStarted={handleGetStarted}
            onPageChange={setCurrentPage}
            onBack={handleBack}
          />
        );
      case "about": return <AboutPage onBack={handleBack} />;
      case "contact": return <ContactPage onBack={handleBack} />;
      case "emi-calculator":
        return (
          <EMICalculator
            onBack={handleBack}
            onApply={(type, amount, tenure) => {
              setPrefilledAmount(amount);
              setPrefilledTenure(tenure);
              setCurrentPage(`loan-application-${type}`);
            }}
          />
        );
      case "gold-calculator":
        return (
          <GoldLoanCalculator
            onBack={handleBack}
            onApply={(type, amount, tenure) => {
              setPrefilledAmount(amount);
              setPrefilledTenure(tenure);
              setCurrentPage(`loan-application-${type}`);
            }}
          />
        );
      case "fd-calculator":
        return <FDCalculator onBack={handleBack} />;
      case "admin-dashboard": return user?.role === "admin" ? <AdminDashboard user={user} onPageChange={setCurrentPage} /> : <>Access Denied</>;
      case "admin-applications": return user?.role === "admin" ? <AdminApplicationsPage user={user} onBack={handleBack} /> : <>Access Denied</>;
      case "admin-payments": return user?.role === "admin" ? <AdminPaymentsPage user={user} onBack={handleBack} /> : <>Access Denied</>;
      case "admin-users": return user?.role === "admin" ? <AdminUsersPage user={user} onBack={handleBack} /> : <>Access Denied</>;
      case "admin-employees": return user?.role === "admin" ? <AdminEmployeesPage user={user} onPageChange={setCurrentPage} onBack={handleBack} /> : <>Access Denied</>;
      case "admin-add-employee": return user?.role === "admin" ? <AdminAddEmployeePage user={user} onPageChange={setCurrentPage} onBack={handleBack} /> : <>Access Denied</>;
      case "admin-customers": return user?.role === "admin" ? <AdminCustomersPage user={user} onBack={handleBack} /> : <>Access Denied</>;
      case "user-dashboard": return user ? (
        <UserDashboard
          user={user}
          onNavigateToCalculator={(t) =>
            setCurrentPage(t === "emi" ? "emi-calculator" : t === "gold" ? "gold-calculator" : "fd-calculator")
          }
          onNavigateToPage={setCurrentPage}
        />
      ) : <>Please login</>;
      case "profile": return user ? (
        <ProfilePage
          user={user}
          onBack={handleBack}
        />
      ) : <>Please login</>;
      case "loan-application-home": return <LoanApplicationForm loanType="home" onPageChange={setCurrentPage} defaultAmount={prefilledAmount} defaultTenure={prefilledTenure} onBack={handleBack} user={user} />;
      case "loan-application-car": return <LoanApplicationForm loanType="car" onPageChange={setCurrentPage} defaultAmount={prefilledAmount} defaultTenure={prefilledTenure} onBack={handleBack} user={user} />;
      case "loan-application-personal": return <LoanApplicationForm loanType="personal" onPageChange={setCurrentPage} defaultAmount={prefilledAmount} defaultTenure={prefilledTenure} onBack={handleBack} user={user} />;
      case "loan-application-gold": return <LoanApplicationForm loanType="gold" onPageChange={setCurrentPage} defaultAmount={prefilledAmount} defaultTenure={prefilledTenure} onBack={handleBack} user={user} />;
      default: return <Hero onGetStarted={handleGetStarted} onLearnMore={() => setCurrentPage("about")} />;
    }
  };

  const isAdminPage = !!(user?.role === "admin" && currentPage.startsWith("admin-"));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <div className="min-h-screen flex bg-background text-foreground">
            {isAdminPage && (
              <AdminSidebar
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            )}
            
            <div className={`flex-1 flex flex-col min-w-0 ${isAdminPage ? "bg-slate-50/70 dark:bg-slate-950/40" : ""}`}>
              <Header
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                isLoggedIn={!!user}
                userRole={user?.role}
                user={user}
                onLogin={() => setAuthModalOpen(true)}
                onSignup={() => setAuthModalOpen(true)}
                onLogout={handleLogout}
                isAdminPage={isAdminPage}
              />

              <main className="flex-1">{renderCurrentPage()}</main>

              {!isAdminPage && <Footer onPageChange={setCurrentPage} />}

              <ChatBot
                currentPage={currentPage}
                isOpen={isChatOpen}
                onToggle={() => setIsChatOpen(!isChatOpen)}
              />
              
              <Toaster />
            </div>

            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setAuthModalOpen(false)}
              onLogin={handleLogin}
              onSignup={handleSignup}
              onOAuthSuccess={(token, user) => {
                setAuthToken(token);
                setUser(user);
                setAuthModalOpen(false);
                setCurrentPage(user.role === "admin" ? "admin-dashboard" : "user-dashboard");
              }}
            />
          </div>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
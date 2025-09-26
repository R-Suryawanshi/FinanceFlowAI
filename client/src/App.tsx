import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Components
import { ThemeProvider } from "./components/ThemeProvider";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { EMICalculator } from "./components/EMICalculator";
import { GoldLoanCalculator } from "./components/GoldLoanCalculator";
import { ServicesPage } from "./components/ServicesPage";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { ChatBot } from "./components/ChatBot";
import { Footer } from "./components/Footer";

// Todo: replace with real authentication system
interface User {
  id: string;
  name: string;
  role: 'user' | 'admin';
}

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Todo: implement real authentication
  const handleLogin = () => {
    // Mock login - randomly assign user or admin role
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: Math.random() > 0.5 ? "Rajesh Kumar" : "Admin User",
      role: Math.random() > 0.7 ? "admin" : "user"
    };
    setUser(mockUser);
    setCurrentPage(mockUser.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
    console.log('Mock login successful:', mockUser);
  };

  const handleSignup = () => {
    // Mock signup - always create user role
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New User",
      role: "user"
    };
    setUser(mockUser);
    setCurrentPage('user-dashboard');
    console.log('Mock signup successful:', mockUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("home");
    console.log('User logged out');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    console.log('Page changed to:', page);
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentPage(user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
    } else {
      handleLogin(); // Auto-login for demo purposes
    }
  };

  const handleNavigateToCalculator = (type: 'emi' | 'gold') => {
    setCurrentPage(type === 'emi' ? 'emi-calculator' : 'gold-calculator');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <Hero
            onGetStarted={handleGetStarted}
            onLearnMore={() => setCurrentPage("about")}
          />
        );
      case "services":
        return (
          <ServicesPage
            onNavigateToCalculator={handleNavigateToCalculator}
            onGetStarted={handleGetStarted}
          />
        );
      case "about":
        return <AboutPage />;
      case "contact":
        return <ContactPage />;
      case "emi-calculator":
        return <EMICalculator />;
      case "gold-calculator":
        return <GoldLoanCalculator />;
      case "admin-dashboard":
        return user?.role === 'admin' ? <AdminDashboard /> : <div>Access Denied</div>;
      case "user-dashboard":
        return user ? (
          <UserDashboard onNavigateToCalculator={handleNavigateToCalculator} />
        ) : (
          <div>Please login to access dashboard</div>
        );
      default:
        return (
          <Hero
            onGetStarted={handleGetStarted}
            onLearnMore={() => setCurrentPage("about")}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header
              currentPage={currentPage}
              onPageChange={handlePageChange}
              isLoggedIn={!!user}
              userRole={user?.role}
              onLogin={handleLogin}
              onSignup={handleSignup}
              onLogout={handleLogout}
            />
            
            <main className="flex-1">
              {renderCurrentPage()}
            </main>
            
            <Footer onPageChange={handlePageChange} />
            
            <ChatBot
              currentPage={currentPage}
              isOpen={isChatOpen}
              onToggle={() => setIsChatOpen(!isChatOpen)}
            />
          </div>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
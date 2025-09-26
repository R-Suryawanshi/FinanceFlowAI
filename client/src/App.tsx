import React, { useState } from "react";
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
import { LoanApplicationForm } from "./components/LoanApplicationForm";
import { ChatBot } from "./components/ChatBot";
import { Footer } from "./components/Footer";

// Real authentication system
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
}

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  // Check for existing authentication on app load
  React.useEffect(() => {
    if (authToken) {
      fetchUserProfile();
    }
  }, [authToken]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, clear it
        setAuthToken(null);
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setAuthToken(null);
      localStorage.removeItem('authToken');
    }
  };

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        localStorage.setItem('authToken', data.token); // Corrected key to 'authToken'
        setUser(data.user);

        // Redirect based on user role
        if (data.user.role === 'admin') {
          setCurrentPage('admin-dashboard');
        } else {
          setCurrentPage('user-dashboard'); // Changed from 'dashboard' to 'user-dashboard' for consistency
        }

        console.log('Login successful:', data.user);
        return { success: true };
      } else {
        console.error('Login failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        setCurrentPage('user-dashboard');
        console.log('Signup successful:', data.user);
        return { success: true };
      } else {
        console.error('Signup failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem('authToken');
      setCurrentPage("home");
      console.log('User logged out');
    }
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    console.log('Page changed to:', page);
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentPage(user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
    } else {
      // Show auth modal instead of auto-login
      setCurrentPage('auth');
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
            onPageChange={handlePageChange}
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
        return user?.role === 'admin' ? <AdminDashboard user={user} /> : <div>Access Denied</div>;
      case "user-dashboard":
        return user ? (
          <UserDashboard user={user} onNavigateToCalculator={handleNavigateToCalculator} />
        ) : (
          <div>Please login to access dashboard</div>
        );
      case "loan-application-home":
        return <LoanApplicationForm loanType="home" />;
      case "loan-application-car":
        return <LoanApplicationForm loanType="car" />;
      case "loan-application-personal":
        return <LoanApplicationForm loanType="personal" />;
      case "loan-application-gold":
        return <LoanApplicationForm loanType="gold" />;
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

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  CreditCard, 
  Coins, 
  FileText, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

interface UserDashboardProps {
  onNavigateToCalculator: (type: 'emi' | 'gold') => void;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    createdAt: string;
  };
}

interface UserService {
  userService: {
    id: string;
    userId: string;
    applicationNumber: string;
    amount: string;
    tenure: number;
    interestRate: string;
    emi?: string;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
    purpose?: string;
    applicationDate: string;
    approvalDate?: string;
    outstandingAmount?: string;
    totalPaidAmount?: string;
  };
  serviceType: {
    id: string;
    name: string;
    displayName: string;
  };
}

interface Payment {
  payment: {
    id: string;
    amount: string;
    paymentMethod: string;
    paymentDate: string;
    status: string;
    paymentReference: string;
  };
  userService: {
    applicationNumber: string;
  };
  serviceType: {
    displayName: string;
  };
}

interface UserProfile {
  creditScore?: number;
  monthlyIncome?: string;
  occupation?: string;
}

// Function to generate account number from user ID
const generateAccountNumber = (userId: string) => {
  const shortId = userId.substring(0, 8).toUpperCase();
  return `BF2024${shortId}`;
};

// Function to format join date
const formatJoinDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
};

export function UserDashboard({ onNavigateToCalculator, user }: UserDashboardProps) {
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch user services
      const servicesResponse = await fetch('/api/user-services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch user payments
      const paymentsResponse = await fetch('/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch user profile
      const profileResponse = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setUserServices(servicesData.services || []);
      }

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData.profile);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'active':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Calculate statistics from real data
  const calculateStats = () => {
    const activeLoans = userServices.filter(s => s.userService.status === 'active');
    const totalActiveAmount = activeLoans.reduce((sum, service) => {
      return sum + parseFloat(service.userService.outstandingAmount || service.userService.amount || '0');
    }, 0);

    const totalPaidAmount = userServices.reduce((sum, service) => {
      return sum + parseFloat(service.userService.totalPaidAmount || '0');
    }, 0);

    const recentPayments = payments.filter(p => {
      const paymentDate = new Date(p.payment.paymentDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return paymentDate >= thirtyDaysAgo;
    }).length;

    return {
      activeLoanAmount: totalActiveAmount,
      totalServices: userServices.length,
      creditScore: userProfile?.creditScore || 0,
      recentPayments
    };
  };

  const stats = calculateStats();

  const quickActions = [
    { id: 'emi-calc', title: 'EMI Calculator', icon: Calculator, description: 'Calculate loan EMIs' },
    { id: 'gold-calc', title: 'Gold Loan Calculator', icon: Coins, description: 'Check gold loan eligibility' },
    { id: 'loan-apply', title: 'Apply for Loan', icon: FileText, description: 'Start loan application' },
    { id: 'payment-history', title: 'Payment History', icon: Clock, description: 'View past payments' }
  ];

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground" data-testid="text-welcome">
          Welcome back, {user.name}!
        </h1>
        <div className="text-muted-foreground space-y-1">
          <p>Account: {generateAccountNumber(user.id)} • Member since {formatJoinDate(user.createdAt)}</p>
          <p>Credit Score: {stats.creditScore > 0 ? stats.creditScore : '----'}</p>
        </div>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchUserData} variant="outline" className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-active-loan">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-loan">
              {formatCurrency(stats.activeLoanAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding amount
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-services">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-services">
              {stats.totalServices}
            </div>
            <p className="text-xs text-muted-foreground">
              All time applications
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-credit-score">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-credit-score">
              {stats.creditScore > 0 ? stats.creditScore : '----'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.creditScore >= 750 ? 'Excellent' : stats.creditScore >= 650 ? 'Good' : stats.creditScore > 0 ? 'Fair' : 'Not available'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-payments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-recent-payments">
              {stats.recentPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used financial tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-20 flex flex-col gap-2 hover-elevate"
                    onClick={() => {
                      if (action.id === 'emi-calc') {
                        onNavigateToCalculator('emi');
                      } else if (action.id === 'gold-calc') {
                        onNavigateToCalculator('gold');
                      }
                      console.log('Quick action clicked:', action.title);
                    }}
                    data-testid={`button-${action.id}`}
                  >
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* My Services */}
        <Card data-testid="card-my-services">
          <CardHeader>
            <CardTitle>My Services</CardTitle>
            <CardDescription>Your current financial services and applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {userServices.length > 0 ? (
                userServices.map((service) => (
                  <div key={service.userService.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {service.serviceType.displayName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          App No: {service.userService.applicationNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(service.userService.applicationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatCurrency(service.userService.amount)}
                      </p>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(service.userService.status)}
                        <Badge variant="outline" className="text-xs">
                          {service.userService.status.charAt(0).toUpperCase() + service.userService.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No services yet</h3>
                  <p className="text-muted-foreground text-sm">Start by applying for a loan or using our calculators</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card data-testid="card-user-activity" className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Your latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length > 0 ? (
              payments.slice(0, 5).map((payment) => (
                <div key={payment.payment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Payment for {payment.serviceType.displayName}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {getStatusIcon(payment.payment.status)}
                        {new Date(payment.payment.paymentDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ref: {payment.payment.paymentReference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(payment.payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {payment.payment.paymentMethod}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
                <p className="text-muted-foreground text-sm">Your payment history will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

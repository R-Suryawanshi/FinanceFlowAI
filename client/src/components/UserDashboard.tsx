import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserDashboardProps {
  onNavigateToCalculator: (type: "emi" | "gold") => void;
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
    status: "pending" | "approved" | "rejected" | "active" | "completed";
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

const generateAccountNumber = (userId: string) => {
  const shortId = userId.substring(0, 8).toUpperCase();
  return `BF2024${shortId}`;
};

const formatJoinDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
};

export function UserDashboard({ onNavigateToCalculator, user }: UserDashboardProps) {
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("2500");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Missing auth token");
      }

      const authHeaders = { Authorization: `Bearer ${token}` };

      const [servicesResponse, paymentsResponse, profileResponse] = await Promise.all([
        fetch("/api/user-services", { headers: authHeaders }),
        fetch("/api/payments", { headers: authHeaders }),
        fetch("/api/profile", { headers: authHeaders }),
      ]);

      if (!servicesResponse.ok || !paymentsResponse.ok || !profileResponse.ok) {
        throw new Error("Dashboard API request failed");
      }

      const [servicesData, paymentsData, profileData] = await Promise.all([
        servicesResponse.json(),
        paymentsResponse.json(),
        profileResponse.json(),
      ]);

      setUserServices(servicesData.services || []);
      setPayments(paymentsData.payments || []);
      setUserProfile(profileData.profile || null);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "active":
      case "approved":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateStats = () => {
    const activeLoans = userServices.filter((s) => s.userService.status === "active");
    const totalActiveAmount = activeLoans.reduce((sum, service) => {
      return sum + parseFloat(service.userService.outstandingAmount || service.userService.amount || "0");
    }, 0);

    const totalPaidAmount = userServices.reduce((sum, service) => {
      return sum + parseFloat(service.userService.totalPaidAmount || "0");
    }, 0);

    const recentPayments = payments.filter((p) => {
      const paymentDate = new Date(p.payment.paymentDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return paymentDate >= thirtyDaysAgo;
    }).length;

    return {
      activeLoanAmount: totalActiveAmount,
      totalServices: userServices.length,
      creditScore: userProfile?.creditScore || 0,
      recentPayments,
    };
  };

  const stats = calculateStats();

  const handlePayment = async () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
    }, 2000);
  };

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
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome back, {user.name}!</h1>
        <div className="text-muted-foreground space-y-1">
          <p>Account: {generateAccountNumber(user.id)} • Member since {formatJoinDate(user.createdAt)}</p>
          <p>Credit Score: {stats.creditScore > 0 ? stats.creditScore : "----"}</p>
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

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.activeLoanAmount)}</div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Services</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">All time applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.creditScore > 0 ? stats.creditScore : "----"}</div>
            <p className="text-xs text-muted-foreground">
              {stats.creditScore >= 750
                ? "Excellent"
                : stats.creditScore >= 650
                ? "Good"
                : stats.creditScore > 0
                ? "Fair"
                : "Not available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentPayments}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Integrated Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
          <CardDescription>Manage your loan repayments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Next EMI Due: {new Date().toLocaleDateString()}</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(paymentAmount)}</p>
            </div>
            <Button onClick={() => setShowPaymentUI(true)}>
              <CreditCard className="mr-2 h-4 w-4" /> Pay Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentUI} onOpenChange={setShowPaymentUI}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>Pay your loan EMI or dues securely</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Amount</Label>
              <Input
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option>UPI</option>
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>Net Banking</option>
              </select>
            </div>
            {paymentSuccess && (
              <div className="text-green-600 font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Payment Successful!
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentUI(false)}>
              Cancel
            </Button>
            <Button disabled={isPaying} onClick={handlePayment}>
              {isPaying ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access your most used financial tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: "emi-calc", title: "EMI Calculator", icon: Calculator, description: "Calculate loan EMIs" },
              { id: "gold-calc", title: "Gold Loan Calculator", icon: Coins, description: "Check gold loan eligibility" },
              { id: "loan-apply", title: "Apply for Loan", icon: FileText, description: "Start loan application" },
              { id: "payment-history", title: "Payment History", icon: Clock, description: "View past payments" },
              { id: "make-payment", title: "Make Payment", icon: CreditCard, description: "Pay your loan EMI or dues" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  onClick={() => {
                    if (action.id === "emi-calc") onNavigateToCalculator("emi");
                    else if (action.id === "gold-calc") onNavigateToCalculator("gold");
                    else if (action.id === "make-payment") setShowPaymentUI(true);
                  }}
                >
                  <Icon className="h-6 w-6" />
                  <span className="font-medium text-sm">{action.title}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
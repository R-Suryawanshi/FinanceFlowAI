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
    createdAt?: string;
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

const formatJoinDate = (dateString?: string) => {
  if (!dateString) return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
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
  const [emiSchedule, setEmiSchedule] = useState<any[]>([]);

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

      const active = (servicesData.services || []).find(
        (s: any) => s.userService.status === "active" || s.userService.status === "approved"
      );
      if (active) {
        const schedRes = await fetch(`/api/user-services/${active.userService.id}/emi-schedule`, {
          headers: authHeaders
        });
        if (schedRes.ok) {
          const schedData = await schedRes.json();
          if (schedData.success) {
            setEmiSchedule(schedData.schedule || []);
          }
        }
      } else {
        setEmiSchedule([]);
      }
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

  const activeLoans = userServices.filter(
    (s) => s.userService.status === "active" || s.userService.status === "approved"
  );
  
  const totalEmiDue = activeLoans.reduce(
    (sum, s) => sum + parseFloat(s.userService.emi || "0"),
    0
  );

  const getNextEmiDueDate = () => {
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);
    if (now.getDate() > 10) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    return dueDate;
  };
  
  const nextEmiDueDate = getNextEmiDueDate();

  const handlePayment = async () => {
    if (activeLoans.length === 0) return;
    
    setIsPaying(true);
    setError(null);
    setPaymentSuccess(false);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Missing auth token. Please log in again.");
      }

      const firstActiveLoan = activeLoans[0];

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userServiceId: firstActiveLoan.userService.id,
          amount: paymentAmount,
          paymentMethod: paymentMethod
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Payment transaction failed.");
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentUI(false);
        setPaymentSuccess(false);
        fetchUserData();
      }, 1500);
    } catch (err: any) {
      console.error("Repayment submission error:", err);
      setError(err.message || "An unexpected error occurred during payment.");
    } finally {
      setIsPaying(false);
    }
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
          {activeLoans.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">You have no active loans or pending repayments.</p>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Next EMI Due: {nextEmiDueDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-xl font-bold mt-1">{formatCurrency(totalEmiDue)}</p>
              </div>
              <Button onClick={() => {
                setPaymentAmount(totalEmiDue.toString());
                setShowPaymentUI(true);
              }}>
                <CreditCard className="mr-2 h-4 w-4" /> Pay Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EMI Repayment Schedule Timeline */}
      {activeLoans.length > 0 && emiSchedule.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Repayment Schedule & Amortization Timeline</CardTitle>
            <CardDescription>Track your monthly payments and upcoming EMIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-gray-200 ml-4 pl-6 space-y-8">
              {emiSchedule.map((item) => {
                const emiNum = item.emiNumber;
                const emiAmt = parseFloat(item.emiAmount || "0");
                const isPaid = (activeLoans[0].userService.totalPaidAmount ? parseFloat(activeLoans[0].userService.totalPaidAmount) : 0) >= (emiNum * emiAmt);

                return (
                  <div key={item.id} className="relative">
                    <div className={`absolute -left-[31px] top-1 h-[14px] w-[14px] rounded-full border-2 bg-white flex items-center justify-center ${
                      isPaid ? "border-green-500 bg-green-50" : "border-amber-400 bg-amber-50"
                    }`}>
                      {isPaid ? (
                        <CheckCircle className="h-2.5 w-2.5 text-green-500" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Installment #{emiNum} — {isPaid ? (
                            <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">Paid</span>
                          ) : (
                            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">Upcoming</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due Date: {new Date(item.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Breakdown: Principal {formatCurrency(item.principalAmount)} | Interest {formatCurrency(item.interestAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(emiAmt)}</p>
                        <p className="text-[11px] text-muted-foreground">Outstanding: {formatCurrency(item.outstandingBalance)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
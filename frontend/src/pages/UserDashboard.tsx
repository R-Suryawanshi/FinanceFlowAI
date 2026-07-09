import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calculator, 
  Clock, 
  CreditCard, 
  CheckCircle,
  FileText,
  Coins,
  PiggyBank,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Lock,
  Shield,
  Smartphone,
  Building,
  Check,
  Loader2,
  LayoutDashboard,
  UploadCloud,
  Download,
  ShieldCheck
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
import { useToast } from "@/hooks/use-toast";
import { User, Save } from "lucide-react";

interface UserDashboardProps {
  onNavigateToCalculator: (type: "emi" | "gold" | "fd") => void;
  onNavigateToPage?: (pageId: string) => void;
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
    documents?: any;
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

export function UserDashboard({ onNavigateToCalculator, onNavigateToPage, user }: UserDashboardProps) {
  const { toast } = useToast();
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Profile popup state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  
  // Profile popup form states
  const [modalPhone, setModalPhone] = useState("");
  const [modalDOB, setModalDOB] = useState("");
  const [modalGender, setModalGender] = useState("");
  const [modalMarital, setModalMarital] = useState("");
  const [modalOccupation, setModalOccupation] = useState("");
  const [modalCompany, setModalCompany] = useState("");
  const [modalIncome, setModalIncome] = useState("");
  const [modalAddress, setModalAddress] = useState("");
  const [modalCity, setModalCity] = useState("");
  const [modalState, setModalState] = useState("");
  const [modalPincode, setModalPincode] = useState("");
  const [modalPAN, setModalPAN] = useState("");
  const [modalAadhar, setModalAadhar] = useState("");
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [emiSchedule, setEmiSchedule] = useState<any[]>([]);
  const [paymentStage, setPaymentStage] = useState<"input" | "details" | "otp" | "processing" | "success">("input");

  // UPI details state
  const [upiId, setUpiId] = useState("");
  const [upiPin, setUpiPin] = useState("");

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [cardPhone, setCardPhone] = useState("");

  // Net Banking details state
  const [selectedBank, setSelectedBank] = useState("SBI");
  const [bankUsername, setBankUsername] = useState("");
  const [bankPassword, setBankPassword] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Sync paymentAmount with active loan EMI dynamically
  useEffect(() => {
    if (userServices.length > 0) {
      const active = userServices.filter(
        (s) => s.userService.status === "active" || s.userService.status === "approved"
      );
      const totalDue = active.reduce(
        (sum, s) => sum + parseFloat(s.userService.emi || "0"),
        0
      );
      setPaymentAmount(totalDue.toString());
    }
  }, [userServices]);

  // Reset simulated credentials when payment modal closes
  useEffect(() => {
    if (!showPaymentUI) {
      setPaymentStage("input");
      setUpiId("");
      setUpiPin("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardName("");
      setOtpCode("");
      setBankUsername("");
      setBankPassword("");
      setCardPhone("");
    }
  }, [showPaymentUI]);

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
      
      const p = profileData.profile || null;
      setUserProfile(p);
      
      if (p) {
        setModalPhone(p.phone_number || "");
        setModalDOB(p.date_of_birth ? new Date(p.date_of_birth).toISOString().split("T")[0] : "");
        setModalGender(p.gender || "");
        setModalMarital(p.marital_status || "");
        setModalOccupation(p.occupation || "");
        setModalCompany(p.company_name || "");
        setModalIncome(p.monthly_income ? String(p.monthly_income) : "");
        setModalAddress(p.address || "");
        setModalCity(p.city || "");
        setModalState(p.state || "");
        setModalPincode(p.pincode || "");
        setModalPAN(p.pan_number || "");
        setModalAadhar(p.aadhar_number || "");
      }
      
      // If basic details are missing, show the popup modal
      if (!p || !p.phone_number || !p.address || !p.occupation) {
        setIsProfileModalOpen(true);
      }

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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const submitData = {
        phone_number: modalPhone,
        dateOfBirth: modalDOB || null,
        gender: modalGender,
        marital_status: modalMarital,
        occupation: modalOccupation,
        company_name: modalCompany,
        monthlyIncome: modalIncome ? parseFloat(modalIncome) : null,
        address: modalAddress,
        city: modalCity,
        state: modalState,
        pincode: modalPincode,
        pan_number: modalPAN,
        aadhar_number: modalAadhar,
      };

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserProfile(data.profile);
          setIsProfileModalOpen(false);
          toast({
            title: "Profile Saved",
            description: "Your basic profile details have been saved successfully.",
          });
        }
      }
    } catch (err) {
      console.error("Error saving profile modal:", err);
      toast({
        title: "Save Failed",
        description: "Failed to save profile details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProfileSaving(false);
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
      activeLoanCount: activeLoans.length,
      totalServices: userServices.length,
      approvedServices: userServices.filter((s) => ["approved", "active", "completed"].includes(s.userService.status)).length,
      pendingServices: userServices.filter((s) => s.userService.status === "pending").length,
      totalPaidAmount,
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

  const creditScoreLabel =
    stats.creditScore >= 750
      ? "Excellent"
      : stats.creditScore >= 650
      ? "Good"
      : stats.creditScore > 0
      ? "Fair"
      : "Not available";
  const creditScoreProgress = stats.creditScore > 0 ? Math.min(Math.round((stats.creditScore / 900) * 100), 100) : 0;
  const repaymentProgress =
    stats.activeLoanAmount + stats.totalPaidAmount > 0
      ? Math.min(Math.round((stats.totalPaidAmount / (stats.activeLoanAmount + stats.totalPaidAmount)) * 100), 100)
      : 0;
  const approvalProgress = stats.totalServices > 0 ? Math.round((stats.approvedServices / stats.totalServices) * 100) : 0;
  const paymentActivityProgress = Math.min(stats.recentPayments * 25, 100);

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
    
    // Perform simulated verification checks based on payment method
    if (paymentMethod === "UPI") {
      if (!upiId.includes("@")) {
        setError("Please enter a valid UPI ID (e.g. name@bank)");
        return;
      }
      if (upiPin.length < 4) {
        setError("Please enter a valid 4 or 6-digit UPI PIN");
        return;
      }
    } else if (paymentMethod === "Credit Card" || paymentMethod === "Debit Card") {
      if (cardNumber.replace(/\s+/g, "").length !== 16) {
        setError("Please enter a valid 16-digit card number");
        return;
      }
      if (!cardExpiry.includes("/")) {
        setError("Please enter card expiry in MM/YY format");
        return;
      }
      if (cardCvv.length !== 3) {
        setError("Please enter a valid 3-digit CVV code");
        return;
      }
      if (!cardName.trim()) {
        setError("Please enter the cardholder name");
        return;
      }
      if (paymentStage === "otp" && otpCode.length !== 6) {
        setError("Please enter the 6-digit OTP passcode");
        return;
      }
    } else if (paymentMethod === "Net Banking") {
      if (!bankUsername.trim()) {
        setError("Please enter your online banking username");
        return;
      }
      if (!bankPassword.trim()) {
        setError("Please enter your login password");
        return;
      }
    }

    setIsPaying(true);
    setError(null);
    setPaymentSuccess(false);
    setPaymentStage("processing");

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

      setPaymentStage("success");
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentUI(false);
        setPaymentSuccess(false);
        fetchUserData();
      }, 2500);
    } catch (err: any) {
      console.error("Repayment submission error:", err);
      setError(err.message || "An unexpected error occurred during payment.");
      setPaymentStage("details"); // Go back to details to fix
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

  // Extract document vault files
  interface VaultDoc {
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
    docTypeKey: string;
    applicationNumber: string;
    status: "Verified" | "Rejected" | "Under Review";
  }

  const vaultDocs: VaultDoc[] = [];
  
  userServices.forEach(s => {
    if (s.userService.documents) {
      Object.entries(s.userService.documents).forEach(([key, val]: any) => {
        if (val && typeof val === "object") {
          let status: "Verified" | "Rejected" | "Under Review" = "Under Review";
          if (s.userService.status === "active" || s.userService.status === "approved" || s.userService.status === "completed") {
            status = "Verified";
          } else if (s.userService.status === "rejected") {
            status = "Rejected";
          }
          
          vaultDocs.push({
            name: val.name || `${key}.pdf`,
            size: val.size || 0,
            type: val.type || "application/pdf",
            uploadedAt: val.uploadedAt || s.userService.applicationDate || new Date().toISOString(),
            docTypeKey: key,
            applicationNumber: s.userService.applicationNumber,
            status: status
          });
        }
      });
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome back, {user.name}!</h1>
        <div className="text-muted-foreground space-y-1">
          <p>Account: {generateAccountNumber(user.id)} • Member since {formatJoinDate(user.createdAt)}</p>
          <p>Credit Score: {stats.creditScore > 0 ? stats.creditScore : "----"}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl flex gap-1 w-fit border border-slate-200">
          <TabsTrigger value="overview" className="rounded-lg font-semibold text-xs px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
            <LayoutDashboard className="h-4 w-4" />
            Account Overview
          </TabsTrigger>
          <TabsTrigger value="vault" className="rounded-lg font-semibold text-xs px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
            <Lock className="h-4 w-4" />
            KYC & Document Vault
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">

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
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-gray-100">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Active Loans</span>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.activeLoanAmount)}</div>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none text-[10px] py-0.5 px-2 font-semibold">
                {stats.activeLoanCount} Active
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-100">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>

          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Monthly EMI Due</span>
              <div className="text-xl font-bold text-gray-800">{formatCurrency(totalEmiDue)}</div>
              <span className="text-[10px] text-gray-500 font-medium">Next billing cycle</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-100">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Repayment Progress</span>
              <span className="text-blue-600 font-bold">{repaymentProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${repaymentProgress}%` }} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </Card>

        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-gray-100">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Total Services</span>
              <div className="text-2xl font-bold text-gray-900">{stats.totalServices}</div>
              <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none text-[10px] py-0.5 px-2 font-semibold">
                All Time
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Pending Reviews</span>
              <div className="text-xl font-bold text-amber-600">{stats.pendingServices}</div>
              <span className="text-[10px] text-gray-500 font-medium">Awaiting approval updates</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-100">
              <LayoutDashboard className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Approval Completion</span>
              <span className="text-indigo-600 font-bold">{approvalProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${approvalProgress}%` }} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        </Card>

        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-gray-100">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Credit Score</span>
              <div className="text-2xl font-bold text-gray-900">{stats.creditScore > 0 ? stats.creditScore : "----"}</div>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none text-[10px] py-0.5 px-2 font-semibold">
                {creditScoreLabel}
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Monthly Income</span>
              <div className="text-xl font-bold text-gray-800">{userProfile?.monthlyIncome ? formatCurrency(userProfile.monthlyIncome) : "----"}</div>
              <span className="text-[10px] text-gray-500 font-medium">{userProfile?.occupation || "Profile details"}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Score Strength</span>
              <span className="text-emerald-600 font-bold">{creditScoreProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${creditScoreProgress}%` }} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
        </Card>

        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-gray-100">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Recent Payments</span>
              <div className="text-2xl font-bold text-gray-900">{stats.recentPayments}</div>
              <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-none text-[10px] py-0.5 px-2 font-semibold">
                Last 30 Days
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-100">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Total Paid</span>
              <div className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalPaidAmount)}</div>
              <span className="text-[10px] text-gray-500 font-medium">Completed repayments</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-100">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Payment Activity</span>
              <span className="text-rose-600 font-bold">{paymentActivityProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${paymentActivityProgress}%` }} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
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
        <Card className="mt-6 timeline-card">
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
        <DialogContent className="sm:max-w-[480px] bg-white text-gray-900 border-none shadow-2xl rounded-2xl p-6 overflow-hidden">
          
          {/* Stage 1: Input Amount & Method Selection */}
          {paymentStage === "input" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                  Make a Payment
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 font-medium">
                  Pay your loan EMI or dues securely via our integrated gateway
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                {activeLoans.length > 0 && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs flex justify-between items-center text-blue-900 font-medium">
                    <span>Outstanding Active Loan EMI:</span>
                    <span className="font-bold text-sm text-primary">{formatCurrency(totalEmiDue)}</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Amount (₹)</Label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount"
                    className="h-11 font-semibold text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Payment Method</Label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-11 border border-gray-200 rounded-lg p-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>UPI</option>
                    <option>Credit Card</option>
                    <option>Debit Card</option>
                    <option>Net Banking</option>
                  </select>
                </div>
                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowPaymentUI(false)} className="text-gray-500 font-medium">
                  Cancel
                </Button>
                <Button 
                  className="font-medium bg-primary hover:bg-primary/95 text-white"
                  onClick={() => {
                    setError(null);
                    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
                      setError("Please enter a valid positive payment amount");
                    } else {
                      setPaymentStage("details");
                    }
                  }}
                >
                  Proceed to Pay
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Stage 2: Details Entry Gateway */}
          {paymentStage === "details" && (
            <>
              <DialogHeader className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -left-2 -top-1 h-8 w-8 text-gray-500" 
                  onClick={() => setPaymentStage("input")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 pl-7 text-primary">
                  <Lock className="h-4 w-4 text-green-600" />
                  Secure payment gateway
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 font-medium pl-7">
                  Enter authorization credentials to complete transaction of <strong>{formatCurrency(parseFloat(paymentAmount))}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                
                {/* Method A: UPI */}
                {paymentMethod === "UPI" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">UPI ID / Virtual Address</Label>
                      <Input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. ritesh@okaxis"
                        className="h-11 font-medium"
                      />
                    </div>
                    {/* Quick apps selectors */}
                    <div className="grid grid-cols-3 gap-2">
                      {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                        <button
                          key={app}
                          type="button"
                          className="border border-slate-100 hover:border-primary/30 p-2.5 rounded-xl text-center text-xs font-semibold text-gray-600 bg-slate-50 hover:bg-primary/5 transition-all"
                          onClick={() => setUpiId(`ritesh@${app === "Google Pay" ? "okgpay" : app === "PhonePe" ? "ybl" : "paytm"}`)}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enter 4 or 6-Digit UPI PIN</Label>
                      <Input
                        type="password"
                        value={upiPin}
                        maxLength={6}
                        onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="h-11 font-bold text-center tracking-[0.5em] text-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Method B: Cards */}
                {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cardholder Name</Label>
                      <Input
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Ritesh Suryawanshi"
                        className="h-11 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registered Mobile Number</Label>
                      <Input
                        value={cardPhone}
                        maxLength={10}
                        onChange={(e) => setCardPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 10-digit mobile number"
                        className="h-11 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Card Number</Label>
                      <div className="relative">
                        <Input
                          value={cardNumber}
                          maxLength={19}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\s+/g, "").replace(/\D/g, "");
                            const matches = val.match(/\d{4,16}/g);
                            const match = (matches && matches[0]) || "";
                            const parts = [];
                            for (let i = 0, len = match.length; i < len; i += 4) {
                              parts.push(match.substring(i, i + 4));
                            }
                            if (parts.length > 0) {
                              setCardNumber(parts.join(" "));
                            } else {
                              setCardNumber(val);
                            }
                          }}
                          placeholder="4532 7182 9901 2738"
                          className="h-11 font-mono tracking-widest pl-10"
                        />
                        <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date</Label>
                        <Input
                          value={cardExpiry}
                          maxLength={5}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length >= 2) {
                              setCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                            } else {
                              setCardExpiry(val);
                            }
                          }}
                          placeholder="MM/YY"
                          className="h-11 font-medium text-center"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CVV Code</Label>
                        <Input
                          type="password"
                          value={cardCvv}
                          maxLength={3}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          placeholder="•••"
                          className="h-11 font-bold text-center tracking-widest"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Method C: Net Banking */}
                {paymentMethod === "Net Banking" && (
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Bank</Label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full h-11 border border-gray-200 rounded-lg p-2.5 text-sm font-medium bg-white"
                      >
                        <option>SBI</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">NetBanking Username</Label>
                      <Input
                        value={bankUsername}
                        onChange={(e) => setBankUsername(e.target.value)}
                        placeholder="User login ID"
                        className="h-11 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Login Password</Label>
                      <Input
                        type="password"
                        value={bankPassword}
                        onChange={(e) => setBankPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 font-medium"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg flex items-center gap-1.5 font-medium font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowPaymentUI(false)} className="text-gray-500 font-medium">
                  Cancel
                </Button>
                <Button 
                  className="font-medium bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-100"
                  disabled={isPaying}
                  onClick={() => {
                    setError(null);
                    if (paymentMethod === "Credit Card" || paymentMethod === "Debit Card") {
                      // Validate card details
                      if (cardPhone.length !== 10) {
                        setError("Please enter a valid 10-digit mobile number");
                        return;
                      }
                      if (cardNumber.replace(/\s+/g, "").length !== 16) {
                        setError("Please enter a valid 16-digit card number");
                        return;
                      }
                      if (!cardExpiry.includes("/")) {
                        setError("Please enter card expiry in MM/YY format");
                        return;
                      }
                      if (cardCvv.length !== 3) {
                        setError("Please enter a valid 3-digit CVV code");
                        return;
                      }
                      if (!cardName.trim()) {
                        setError("Please enter the cardholder name");
                        return;
                      }
                      setPaymentStage("otp");
                      setTimeout(() => {
                        alert("Bhalchandra Finance OTP: Your simulated 6-digit OTP verification code is 123456");
                      }, 400);
                    } else {
                      handlePayment();
                    }
                  }}
                >
                  {paymentMethod === "Credit Card" || paymentMethod === "Debit Card" ? "Request OTP" : "Confirm Repayment"}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Stage 3: OTP Verification Sheet */}
          {paymentStage === "otp" && (
            <>
              <DialogHeader className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -left-2 -top-1 h-8 w-8 text-gray-500" 
                  onClick={() => setPaymentStage("details")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 pl-7 text-primary">
                  <Smartphone className="h-5 w-5 text-primary" />
                  SMS OTP verification
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 font-medium pl-7">
                  Enter the 6-digit transaction passcode sent to +91 *******{cardPhone.slice(-3)}. (For testing, enter <strong>123456</strong>)
                </DialogDescription>
              </DialogHeader>

              <div className="py-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center block">Enter 6-Digit SMS Passcode</Label>
                  <Input
                    value={otpCode}
                    maxLength={6}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="h-12 font-bold text-center tracking-[0.8em] text-xl"
                  />
                </div>
                <div className="text-center">
                  <button 
                    type="button" 
                    className="text-xs font-semibold text-primary hover:underline"
                    onClick={() => {
                      setOtpCode("");
                      alert("Simulated OTP SMS resent successfully!");
                    }}
                  >
                    Resend SMS passcode
                  </button>
                </div>
                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg flex items-center gap-1.5 font-medium font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowPaymentUI(false)} className="text-gray-500 font-medium">
                  Cancel
                </Button>
                <Button 
                  className="font-medium bg-green-600 hover:bg-green-700 text-white"
                  disabled={isPaying}
                  onClick={handlePayment}
                >
                  Complete Authorization
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Stage 4: Processing Animation screen */}
          {paymentStage === "processing" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="space-y-1">
                <h3 className="font-bold text-gray-800 text-base">Processing Transaction...</h3>
                <p className="text-xs text-gray-400 font-medium">Authorizing secure checkout ledger updates. Please do not refresh.</p>
              </div>
            </div>
          )}

          {/* Stage 5: Payment Success Receipt Screen */}
          {paymentStage === "success" && (
            <div className="py-6 flex flex-col items-center justify-center space-y-5 text-center">
              <div className="h-16 w-16 rounded-full bg-green-50 text-green-500 border-2 border-green-500/20 flex items-center justify-center animate-bounce">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-lg">Repayment Success!</h3>
                <p className="text-xs text-gray-500 font-medium">Your payment has been successfully authorized and confirmed.</p>
              </div>
              
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-left space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid Amount:</span>
                  <span className="font-bold text-gray-800">{formatCurrency(parseFloat(paymentAmount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Gateway Channel:</span>
                  <span className="font-semibold text-gray-800 uppercase">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ref Transaction ID:</span>
                  <span className="font-mono text-[10px] text-gray-600">TXN{Date.now()}</span>
                </div>
              </div>
            </div>
          )}

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
              { id: "fd-calc", title: "FD Calculator", icon: PiggyBank, description: "Calculate FD returns" },
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
                    else if (action.id === "fd-calc") onNavigateToCalculator("fd");
                    else if (action.id === "make-payment") setShowPaymentUI(true);
                    else if (action.id === "loan-apply" && onNavigateToPage) onNavigateToPage("loan-application-personal");
                    else if (action.id === "payment-history") {
                      const schedCard = document.querySelector(".timeline-card");
                      if (schedCard) schedCard.scrollIntoView({ behavior: "smooth" });
                    }
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
      </TabsContent>

      {/* Tab 2: Document Vault */}
      <TabsContent value="vault" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Documents Table */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  KYC Verification & Document Ledger
                </CardTitle>
                <CardDescription>
                  Review and track the audit status of identity, address, and income files submitted during loan applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vaultDocs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl space-y-3">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">No uploaded files</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Your KYC verification documents will appear here once you submit a loan application.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pl-2">Document Details</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Account Reference</th>
                          <th className="pb-3">Verification Status</th>
                          <th className="pb-3 text-right pr-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {vaultDocs.map((doc, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 pl-2">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                                  <FileText className="h-4.5 w-4.5" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-bold text-gray-800 break-all max-w-[180px] sm:max-w-xs">{doc.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">
                                    {(doc.size > 0 ? (doc.size / 1024).toFixed(1) + " KB" : "2.4 MB")} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="font-semibold text-gray-600 capitalize">
                                {doc.docTypeKey.replace(/([A-Z])/g, " $1")}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="font-mono text-gray-500 font-semibold">{doc.applicationNumber}</span>
                            </td>
                            <td className="py-3">
                              <Badge className={`border-none text-[10px] px-2 py-0.5 font-semibold shrink-0 ${
                                doc.status === "Verified"
                                  ? "bg-green-50 text-green-700 hover:bg-green-50"
                                  : doc.status === "Rejected"
                                  ? "bg-red-50 text-red-700 hover:bg-red-50"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                              }`}>
                                {doc.status === "Verified" ? (
                                  <Check className="mr-1 h-3 w-3 inline" />
                                ) : doc.status === "Rejected" ? (
                                  <AlertCircle className="mr-1 h-3 w-3 inline" />
                                ) : (
                                  <Clock className="mr-1 h-3 w-3 inline" />
                                )}
                                {doc.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-right pr-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-primary rounded-lg"
                                onClick={() => {
                                  alert(`Downloading simulated file payload: ${doc.name}`);
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Upload Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-primary" />
                  Secure KYC Submission
                </CardTitle>
                <CardDescription className="text-xs">
                  Directly upload additional verification files to speed up active requests.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Category</Label>
                  <select className="w-full h-10 border border-gray-200 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none">
                    <option>Aadhaar / Photo Identity Proof</option>
                    <option>PAN Verification Card</option>
                    <option>Recent Salary Slip</option>
                    <option>3-Month Bank Statement Ledger</option>
                  </select>
                </div>
                
                {/* Drag and Drop Zone */}
                <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-slate-50/50 cursor-pointer transition-all space-y-2">
                  <div className="h-10 w-10 bg-blue-50 text-primary flex items-center justify-center rounded-xl mx-auto shadow-sm">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-700">Choose File or drag here</p>
                    <p className="text-[10px] text-gray-400">PDF, PNG, JPG up to 10MB</p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-primary text-primary-foreground font-bold h-10 text-xs shadow-md"
                  onClick={() => {
                    alert("Simulated KYC File submission received! Our systems will verify this upload within 2 hours.");
                  }}
                >
                  Submit File to Vault
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
      </Tabs>

      {/* Dialog for Profile Details Pop-up */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <User className="h-5 w-5 text-blue-700" />
              Complete Profile Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Please fill out your basic profile information to verify your account and help us customize your financial experience.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modalPhone" className="text-xs font-bold">Phone Number</Label>
                <Input
                  id="modalPhone"
                  placeholder="+91 XXXXX XXXXX"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modalDOB" className="text-xs font-bold">Date of Birth</Label>
                <Input
                  id="modalDOB"
                  type="date"
                  value={modalDOB}
                  onChange={(e) => setModalDOB(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modalGender" className="text-xs font-bold">Gender</Label>
                <select
                  id="modalGender"
                  value={modalGender}
                  onChange={(e) => setModalGender(e.target.value)}
                  className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-slate-800"
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modalMarital" className="text-xs font-bold">Marital Status</Label>
                <select
                  id="modalMarital"
                  value={modalMarital}
                  onChange={(e) => setModalMarital(e.target.value)}
                  className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-slate-800"
                  required
                >
                  <option value="" disabled>Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modalOccupation" className="text-xs font-bold">Occupation</Label>
                <Input
                  id="modalOccupation"
                  placeholder="e.g. Developer"
                  value={modalOccupation}
                  onChange={(e) => setModalOccupation(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modalCompany" className="text-xs font-bold">Company Name</Label>
                <Input
                  id="modalCompany"
                  placeholder="e.g. TCS"
                  value={modalCompany}
                  onChange={(e) => setModalCompany(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modalIncome" className="text-xs font-bold">Monthly Income (₹)</Label>
                <Input
                  id="modalIncome"
                  type="number"
                  placeholder="e.g. 75000"
                  value={modalIncome}
                  onChange={(e) => setModalIncome(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modalPAN" className="text-xs font-bold">PAN Card Number</Label>
                <Input
                  id="modalPAN"
                  placeholder="e.g. ABCDE1234F"
                  value={modalPAN}
                  onChange={(e) => setModalPAN(e.target.value)}
                  className="uppercase"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modalAadhar" className="text-xs font-bold">Aadhaar Card Number</Label>
                <Input
                  id="modalAadhar"
                  placeholder="e.g. 1234 5678 9012"
                  value={modalAadhar}
                  onChange={(e) => setModalAadhar(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modalAddress" className="text-xs font-bold">Street Address</Label>
              <Input
                id="modalAddress"
                placeholder="Flat, Building name, Street address"
                value={modalAddress}
                onChange={(e) => setModalAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="modalCity" className="text-xs font-bold">City</Label>
                <Input
                  id="modalCity"
                  placeholder="e.g. Parbhani"
                  value={modalCity}
                  onChange={(e) => setModalCity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modalState" className="text-xs font-bold">State</Label>
                <Input
                  id="modalState"
                  placeholder="e.g. Maharashtra"
                  value={modalState}
                  onChange={(e) => setModalState(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modalPincode" className="text-xs font-bold">Pincode</Label>
                <Input
                  id="modalPincode"
                  placeholder="e.g. 431402"
                  value={modalPincode}
                  onChange={(e) => setModalPincode(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProfileModalOpen(false)}
                disabled={isProfileSaving}
                className="rounded-full bg-transparent font-semibold"
              >
                Skip
              </Button>
              <Button
                type="submit"
                disabled={isProfileSaving}
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-6 flex items-center gap-2 border border-transparent shadow-sm"
              >
                {isProfileSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save details
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

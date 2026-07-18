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
  ShieldCheck,
  Home,
  Car,
  User,
  Save,
  ShieldAlert,
  HelpCircle,
  Send,
  MessageSquare,
  LifeBuoy
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
  defaultTab?: string;
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
    remarks?: string | null;
    transactionId?: string | null;
    bankReference?: string | null;
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

export function UserDashboard({ onNavigateToCalculator, onNavigateToPage, user, defaultTab }: UserDashboardProps) {
  const { toast } = useToast();
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab || "overview");

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  
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
  const [modalBankName, setModalBankName] = useState("");
  const [modalAccountNumber, setModalAccountNumber] = useState("");
  const [modalIFSC, setModalIFSC] = useState("");
  const [modalAccountHolder, setModalAccountHolder] = useState("");
  const [modalAccountType, setModalAccountType] = useState("");
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [isLoanSelectorOpen, setIsLoanSelectorOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isPaying, setIsPaying] = useState(false);

  // Document Vault manual upload states
  const [manualVaultDocs, setManualVaultDocs] = useState<any[]>([]);
  const [selectedVaultFile, setSelectedVaultFile] = useState<File | null>(null);
  const [vaultDocCategory, setVaultDocCategory] = useState("Aadhaar / Photo Identity Proof");
  const [isVaultUploading, setIsVaultUploading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [emiSchedule, setEmiSchedule] = useState<any[]>([]);
  const [paymentStage, setPaymentStage] = useState<"input" | "details" | "otp" | "processing" | "success">("input");
  const [isForeclosure, setIsForeclosure] = useState(false);

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

  // Fixed Deposit pre-closure states
  const [closingFd, setClosingFd] = useState<UserService | null>(null);
  const [closeFdLoading, setCloseFdLoading] = useState(false);
  const [closeFdCalcs, setCloseFdCalcs] = useState<any>(null);

  // Support Tickets states
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState("general");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

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

      const [servicesResponse, paymentsResponse, profileResponse, ticketsResponse] = await Promise.all([
        fetch("/api/user-services", { headers: authHeaders }),
        fetch("/api/payments", { headers: authHeaders }),
        fetch("/api/profile", { headers: authHeaders }),
        fetch("/api/support-tickets", { headers: authHeaders }),
      ]);

      if (!servicesResponse.ok || !paymentsResponse.ok || !profileResponse.ok || !ticketsResponse.ok) {
        throw new Error("Dashboard API request failed");
      }

      const [servicesData, paymentsData, profileData, ticketsData] = await Promise.all([
        servicesResponse.json(),
        paymentsResponse.json(),
        profileResponse.json(),
        ticketsResponse.json(),
      ]);

      setUserServices(servicesData.services || []);
      setPayments(paymentsData.payments || []);
      setSupportTickets(ticketsData.tickets || []);
      
      const p = profileData.profile || null;
      setUserProfile(p);
      
      if (p) {
        setModalPhone(p.phoneNumber || "");
        setModalDOB(p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "");
        setModalGender(p.gender || "");
        setModalMarital(p.maritalStatus || "");
        setModalOccupation(p.occupation || "");
        setModalCompany(p.companyName || "");
        setModalIncome(p.monthlyIncome ? String(p.monthlyIncome) : "");
        setModalAddress(p.address || "");
        setModalCity(p.city || "");
        setModalState(p.state || "");
        setModalPincode(p.pincode || "");
        setModalPAN(p.pan_number || "");
        setModalAadhar(p.aadhar_number || "");
        setModalBankName(p.bank_name || "");
        setModalAccountNumber(p.account_number || "");
        setModalIFSC(p.ifsc_code || "");
        setModalAccountHolder(p.account_holder_name || "");
        setModalAccountType(p.account_type || "");
      }
      
      // If basic details are missing, show the popup modal
      const hasSeenPopup = localStorage.getItem(`profile_popup_seen_${user?.id}`) === "true";
      if (!hasSeenPopup && (!p || !p.phoneNumber || !p.address || !p.occupation)) {
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

  const exportTransactionsCSV = () => {
    if (payments.length === 0) return;
    const headers = ["Date", "Reference ID", "Method", "Amount", "Status", "Remarks"];
    const rows = payments.map(p => [
      new Date(p.payment.paymentDate).toISOString(),
      p.payment.paymentReference,
      p.payment.paymentMethod,
      p.payment.amount,
      p.payment.status,
      p.payment.remarks || ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bhalchandra_Transactions_${user?.name.replace(/ /g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReceipt = (p: Payment) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const receiptHtml = `
      <html>
        <head>
          <title>Payment Receipt - Bhalchandra Finance</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; padding: 40px; }
            .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 30px; border-radius: 12px; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .company-title { font-size: 20px; font-weight: 800; color: #1d4ed8; letter-spacing: 0.5px; }
            .receipt-title { font-size: 13px; color: #6b7280; margin-top: 5px; text-transform: uppercase; font-weight: 650; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin: 25px 0; }
            .label { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { font-size: 14px; font-weight: 600; color: #111827; margin-top: 3px; }
            .total-box { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin-top: 25px; border: 1px solid #e5e7eb; }
            .total-amount { font-size: 24px; font-weight: 900; color: #1e3a8a; }
            .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="company-title">BHALCHANDRA FINANCE PVT LTD</div>
              <div class="receipt-title">Official Repayment Receipt</div>
            </div>
            
            <div class="grid">
              <div>
                <div class="label">Customer Name</div>
                <div class="value">${user?.name}</div>
              </div>
              <div>
                <div class="label">Email Address</div>
                <div class="value">${user?.email}</div>
              </div>
              <div>
                <div class="label">Transaction Date</div>
                <div class="value">${new Date(p.payment.paymentDate).toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div class="label">Reference ID</div>
                <div class="value">${p.payment.paymentReference}</div>
              </div>
              <div>
                <div class="label">Payment Method</div>
                <div class="value" style="text-transform: uppercase;">${p.payment.paymentMethod}</div>
              </div>
              <div>
                <div class="label">Transaction Status</div>
                <div class="value" style="color: #047857; text-transform: uppercase;">${p.payment.status}</div>
              </div>
            </div>
            
            <div class="total-box">
              <div class="label" style="margin-bottom: 5px;">Amount Paid</div>
              <div class="total-amount">₹${parseFloat(p.payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            </div>
            
            <div class="footer">
              Thank you for your business. For any support, contact customercare@bhalchandrafinance.com<br>
              This is a computer-generated receipt and requires no physical signature.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const exportAmortizationCSV = () => {
    const activeLoans = userServices.filter(
      (s) => s.serviceType.name !== "fixed_deposit" && !s.serviceType.displayName.toLowerCase().includes("deposit")
    );
    if (emiSchedule.length === 0 || activeLoans.length === 0) return;
    const headers = ["Installment #", "Due Date", "EMI Amount", "Principal", "Interest", "Outstanding Balance", "Status"];
    const rows = emiSchedule.map((item) => {
      const isPaid = item.status === "paid";
      return [
        item.emiNumber,
        new Date(item.dueDate).toLocaleDateString("en-IN"),
        item.emiAmount,
        item.principalAmount,
        item.interestAmount,
        item.outstandingBalance,
        isPaid ? "Paid" : "Upcoming"
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Amortization_Schedule_${activeLoans[0].userService.applicationNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAmortizationPDF = () => {
    const activeLoans = userServices.filter(
      (s) => s.serviceType.name !== "fixed_deposit" && !s.serviceType.displayName.toLowerCase().includes("deposit")
    );
    if (emiSchedule.length === 0 || activeLoans.length === 0) return;
    const loan = activeLoans[0].userService;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const rowsHtml = emiSchedule.map((item) => {
      const isPaid = item.status === "paid";
      return `
        <tr>
          <td>${item.emiNumber}</td>
          <td>${new Date(item.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
          <td>₹${parseFloat(item.emiAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td>₹${parseFloat(item.principalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td>₹${parseFloat(item.interestAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td>₹${parseFloat(item.outstandingBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td style="color: ${isPaid ? '#059669' : '#d97706'}; font-weight: bold;">${isPaid ? 'PAID' : 'UPCOMING'}</td>
        </tr>
      `;
    }).join("");

    const scheduleHtml = `
      <html>
        <head>
          <title>Amortization Schedule - Bhalchandra Finance</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; padding: 40px; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 800; color: #1d4ed8; letter-spacing: 0.5px; }
            .subtitle { font-size: 13px; color: #6b7280; margin-top: 4px; text-transform: uppercase; font-weight: 650; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; font-size: 13px; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .meta-item { display: flex; flex-direction: column; }
            .label { font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { font-weight: bold; margin-top: 3px; color: #111827; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { border-bottom: 2px solid #e5e7eb; text-align: left; padding: 10px 5px; color: #4b5563; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            td { border-bottom: 1px solid #f3f4f6; padding: 10px 5px; color: #374151; }
            tr:hover { background: #f9fafb; }
            .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">BHALCHANDRA FINANCE PVT LTD</div>
            <div class="subtitle">Amortization Repayment Schedule</div>
          </div>
          
          <div class="meta-grid">
            <div class="meta-item">
              <span class="label">Loan Account Number</span>
              <span class="value">${loan.applicationNumber}</span>
            </div>
            <div class="meta-item">
              <span class="label">Loan Principal</span>
              <span class="value">₹${parseFloat(loan.amount).toLocaleString("en-IN")}</span>
            </div>
            <div class="meta-item">
              <span class="label">Interest Rate</span>
              <span class="value">${loan.interestRate}% P.A.</span>
            </div>
            <div class="meta-item">
              <span class="label">Tenure</span>
              <span class="value">${loan.tenure} Months</span>
            </div>
            <div class="meta-item">
              <span class="label">Equated Monthly Installment (EMI)</span>
              <span class="value">₹${parseFloat(loan.emi || "0").toLocaleString("en-IN")}</span>
            </div>
            <div class="meta-item">
              <span class="label">Outstanding Principal</span>
              <span class="value">₹${parseFloat(loan.outstandingAmount || "0").toLocaleString("en-IN")}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Inst #</th>
                <th>Due Date</th>
                <th>EMI Amount</th>
                <th>Principal Component</th>
                <th>Interest Component</th>
                <th>Outstanding Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          
          <div class="footer">
            Bhalchandra Finance - Custom loan solution packages. Subject to regulatory guidelines.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(scheduleHtml);
    printWindow.document.close();
  };

  const handlePreCloseFdClick = (service: UserService) => {
    const principal = parseFloat(service.userService.amount);
    const interestRate = parseFloat(service.userService.interestRate);
    
    const bookingDate = new Date(service.userService.applicationDate);
    const currentDate = new Date();
    const diffTime = Math.max(0, currentDate.getTime() - bookingDate.getTime());
    const daysActive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const prematureRate = Math.max(0, interestRate - 1.0);
    const accruedInterest = principal * (prematureRate / 100) * (daysActive / 365);
    const totalPayout = principal + accruedInterest;

    setCloseFdCalcs({
      principal,
      originalRate: interestRate,
      penalizedRate: prematureRate,
      daysActive,
      accruedInterest,
      totalPayout
    });
    setClosingFd(service);
  };

  const handleConfirmCloseFd = async () => {
    if (!closingFd) return;
    setCloseFdLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`/api/user-services/${closingFd.userService.id}/close-fd`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: "Fixed Deposit Closed",
          description: `Payout of ₹${data.calculations.totalPayout.toLocaleString("en-IN")} processed successfully.`,
        });
        setClosingFd(null);
        setCloseFdCalcs(null);
        await fetchUserData();
      } else {
        toast({
          title: "Closure Failed",
          description: data.error || "Failed to pre-close Fixed Deposit.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive"
      });
    } finally {
      setCloseFdLoading(false);
    }
  };

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    setTicketSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: ticketSubject,
          description: ticketDescription,
          category: ticketCategory,
          priority: ticketPriority
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: "Ticket Raised Successfully",
          description: `Your ticket has been raised with ticket number: ${data.ticket.ticketNumber}.`,
        });
        setTicketSubject("");
        setTicketDescription("");
        setTicketCategory("general");
        setTicketPriority("medium");
        await fetchUserData();
      } else {
        toast({
          title: "Submission Failed",
          description: data.error || "Failed to raise support ticket.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Network Error",
        description: "Could not connect to the support backend.",
        variant: "destructive"
      });
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const submitData = {
        phoneNumber: modalPhone,
        dateOfBirth: modalDOB || null,
        gender: modalGender,
        maritalStatus: modalMarital,
        occupation: modalOccupation,
        companyName: modalCompany,
        monthlyIncome: modalIncome ? parseFloat(modalIncome) : null,
        address: modalAddress,
        city: modalCity,
        state: modalState,
        pincode: modalPincode,
        pan_number: modalPAN,
        aadhar_number: modalAadhar,
        bank_name: modalBankName,
        account_number: modalAccountNumber,
        ifsc_code: modalIFSC,
        account_holder_name: modalAccountHolder,
        account_type: modalAccountType,
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
          if (user) {
            localStorage.setItem(`profile_popup_seen_${user.id}`, "true");
          }
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
        return <CheckCircle className="h-4 w-4 text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
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
    const activeLoansList = userServices.filter(
      (s) => s.serviceType.name !== "fixed_deposit" && !s.serviceType.displayName.toLowerCase().includes("deposit")
    );
    const active = activeLoansList.filter(
      (s) => s.userService.status === "active" || s.userService.status === "approved"
    );

    if (active.length > 0 && emiSchedule.length > 0) {
      const firstUnpaid = emiSchedule.find((item) => {
        const isPaid = item.status === "paid";
        return !isPaid;
      });

      if (firstUnpaid) {
        return new Date(firstUnpaid.dueDate);
      }
    }

    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);
    if (now.getDate() > 10) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    return dueDate;
  };
  
  const nextEmiDueDate = getNextEmiDueDate();
  const paidCount = emiSchedule.filter(item => item.status === "paid").length;
  const dueCount = emiSchedule.filter(item => new Date(item.dueDate) <= new Date()).length;
  const isPrepayBlocked = (paidCount - dueCount) >= 2;

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
          paymentMethod: paymentMethod,
          isForeclosure: isForeclosure
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
      <div className="max-w-[1600px] mx-auto p-6">
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

  // Append manual uploads
  manualVaultDocs.forEach((doc: any) => {
    vaultDocs.push(doc);
  });

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome back, {user.name}!</h1>
        <div className="text-muted-foreground space-y-1">
          <p>Account: {generateAccountNumber(user.id)} • Member since {formatJoinDate(user.createdAt)}</p>
          <p>Credit Score: {stats.creditScore > 0 ? stats.creditScore : "----"}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl flex gap-1 w-fit border border-border">
          <TabsTrigger value="overview" className="rounded-lg font-semibold text-xs px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
            <LayoutDashboard className="h-4 w-4" />
            Account Overview
          </TabsTrigger>
          <TabsTrigger value="vault" className="rounded-lg font-semibold text-xs px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
            <Lock className="h-4 w-4" />
            KYC & Document Vault
          </TabsTrigger>
          <TabsTrigger value="investments" className="rounded-lg font-semibold text-xs px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
            <PiggyBank className="h-4 w-4" />
            FDs & Investments
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
        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-border dark:border-border/60">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Active Loans</span>
              <div className="text-2xl font-bold text-foreground dark:text-white">{formatCurrency(stats.activeLoanAmount)}</div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 dark:bg-primary/20 dark:text-primary border-none text-[10px] py-0.5 px-2 font-semibold">
                {stats.activeLoanCount} Active
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/15 dark:shadow-none">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>

          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Monthly EMI Due</span>
              <div className="text-xl font-bold text-foreground dark:text-slate-200">{formatCurrency(totalEmiDue)}</div>
              <span className="text-[10px] text-muted-foreground dark:text-muted-foreground font-medium">Next billing cycle</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-100 dark:shadow-none">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground dark:text-muted-foreground">
              <span>Repayment Progress</span>
              <span className="text-primary font-bold">{repaymentProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full" style={{ width: `${repaymentProgress}%` }} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/80" />
        </Card>

        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-border dark:border-border/60">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Total Services</span>
              <div className="text-2xl font-bold text-foreground dark:text-white">{stats.totalServices}</div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 dark:bg-primary/20 dark:text-primary border-none text-[10px] py-0.5 px-2 font-semibold">
                All Time
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/15 dark:shadow-none">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Pending Reviews</span>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingServices}</div>
              <span className="text-[10px] text-muted-foreground dark:text-muted-foreground font-medium">Awaiting approval updates</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-100 dark:shadow-none">
              <LayoutDashboard className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground dark:text-muted-foreground">
              <span>Approval Completion</span>
              <span className="text-primary font-bold">{approvalProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" style={{ width: `${approvalProgress}%` }} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-500" />
        </Card>

        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-border dark:border-border/60">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Credit Score</span>
              <div className="text-2xl font-bold text-foreground dark:text-white">{stats.creditScore > 0 ? stats.creditScore : "----"}</div>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border-none text-[10px] py-0.5 px-2 font-semibold">
                {creditScoreLabel}
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100 dark:shadow-none">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Monthly Income</span>
              <div className="text-xl font-bold text-foreground dark:text-slate-200">{userProfile?.monthlyIncome ? formatCurrency(userProfile.monthlyIncome) : "----"}</div>
              <span className="text-[10px] text-muted-foreground dark:text-muted-foreground font-medium">{userProfile?.occupation || "Profile details"}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-100 dark:shadow-none">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground dark:text-muted-foreground">
              <span>Score Strength</span>
              <span className="text-emerald-600 dark:text-emerald-450 font-bold">{creditScoreProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${creditScoreProgress}%` }} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
        </Card>

        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-border dark:border-border/60">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Recent Payments</span>
              <div className="text-2xl font-bold text-foreground dark:text-white">{stats.recentPayments}</div>
              <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 dark:bg-rose-950/30 dark:text-rose-455 border-none text-[10px] py-0.5 px-2 font-semibold">
                Last 30 Days
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-100 dark:shadow-none">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Total Paid</span>
              <div className="text-xl font-bold text-foreground dark:text-slate-200">{formatCurrency(stats.totalPaidAmount)}</div>
              <span className="text-[10px] text-muted-foreground dark:text-muted-foreground font-medium">Completed repayments</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-100 dark:shadow-none">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground dark:text-muted-foreground">
              <span>Payment Activity</span>
              <span className="text-rose-600 dark:text-rose-455 font-bold">{paymentActivityProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${paymentActivityProgress}%` }} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
        </Card>
      </div>

      {/* ✅ Integrated Payment Section */}
      <Card className="rounded-2xl border border-border/60 dark:border-border shadow-sm bg-card dark:bg-slate-900 overflow-hidden">
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
          <CardDescription>Manage your loan repayments</CardDescription>
        </CardHeader>
        <CardContent>
          {activeLoans.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full">
                <ShieldCheck className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground dark:text-slate-200">All Caught Up!</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  You have no active loans or pending repayments at this time.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Next EMI Due: {nextEmiDueDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-xl font-bold mt-1">
                    {isPrepayBlocked ? "No Current Dues" : formatCurrency(totalEmiDue)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-600 dark:text-red-400 hover:text-red-700 font-bold"
                    onClick={() => {
                      setIsForeclosure(true);
                      setPaymentAmount(activeLoans[0].userService.outstandingAmount || "0");
                      setPaymentStage("input");
                      setShowPaymentUI(true);
                    }}
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" /> Foreclose Loan
                  </Button>
                  <Button 
                    disabled={isPrepayBlocked}
                    onClick={() => {
                      setIsForeclosure(false);
                      setPaymentAmount(totalEmiDue.toString());
                      setPaymentStage("input");
                      setShowPaymentUI(true);
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                  </Button>
                </div>
              </div>
              {isPrepayBlocked && (
                <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200/50 dark:border-amber-900/50 rounded-xl p-3 text-xs flex items-start gap-2.5 text-amber-800 dark:text-amber-300 font-medium">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">EMI Repayment Limit Reached</p>
                    <p>You have already pre-paid 1 extra installment in advance. The option to pay your next EMI will open after your next billing cycle starts.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* EMI Repayment Schedule Timeline */}
      {activeLoans.length > 0 && emiSchedule.length > 0 && (
        <Card className="mt-6 timeline-card">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Repayment Schedule & Amortization Timeline</CardTitle>
              <CardDescription>Track your monthly payments and upcoming EMIs</CardDescription>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button 
                onClick={exportAmortizationCSV}
                className="bg-muted/30 hover:bg-muted text-muted-foreground border border-border/50 text-xs font-bold rounded-xl h-9 flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
              <Button 
                onClick={exportAmortizationPDF}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-xl h-9 flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-border ml-4 pl-6 space-y-8">
              {emiSchedule.map((item) => {
                const isPaid = item.status === "paid";

                return (
                  <div key={item.id} className="relative">
                    <div className={`absolute -left-[31px] top-1 h-[14px] w-[14px] rounded-full border-2 bg-card flex items-center justify-center ${
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
                          Installment #{item.emiNumber} — {isPaid ? (
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
                        <p className="text-sm font-bold text-foreground">{formatCurrency(parseFloat(item.emiAmount || "0"))}</p>
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
        <DialogContent className="sm:max-w-[480px] bg-card text-foreground border-none shadow-2xl rounded-2xl p-6 overflow-hidden">
          
          {/* Stage 1: Input Amount & Method Selection */}
          {paymentStage === "input" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                  {isForeclosure ? (
                    <>
                      <ShieldCheck className="h-5 w-5 text-green-600 animate-pulse" />
                      Foreclose & Close Loan
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Make a Payment
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground font-medium">
                  {isForeclosure 
                    ? "Pay off your remaining principal balance to close this loan account immediately"
                    : "Pay your loan EMI or dues securely via our integrated gateway"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                {isForeclosure ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs flex flex-col gap-1.5 text-green-900 font-medium">
                    <span className="font-bold text-sm">Foreclosure Settlement Statement</span>
                    <span>Paying this amount will fully close loan application #{activeLoans[0]?.userService?.applicationNumber}.</span>
                    <div className="flex justify-between items-center mt-1 border-t border-green-200/50 pt-1.5">
                      <span>Total Principal Outstanding:</span>
                      <span className="font-bold text-sm text-green-700">{formatCurrency(parseFloat(activeLoans[0]?.userService?.outstandingAmount || "0"))}</span>
                    </div>
                  </div>
                ) : (
                  activeLoans.length > 0 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs flex justify-between items-center text-primary font-medium">
                      <span>Outstanding Active Loan EMI:</span>
                      <span className="font-bold text-sm text-primary">{formatCurrency(totalEmiDue)}</span>
                    </div>
                  )
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Amount (₹)</Label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => !isForeclosure && setPaymentAmount(e.target.value)}
                    disabled={isForeclosure}
                    placeholder="Enter payment amount"
                    className="h-11 font-semibold text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Payment Method</Label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-11 border border-border rounded-lg p-2.5 text-sm font-medium bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <Button variant="outline" onClick={() => setShowPaymentUI(false)} className="text-muted-foreground font-medium">
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
                  className="absolute -left-2 -top-1 h-8 w-8 text-muted-foreground" 
                  onClick={() => setPaymentStage("input")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 pl-7 text-primary">
                  <Lock className="h-4 w-4 text-green-600" />
                  Secure payment gateway
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium pl-7">
                  Enter authorization credentials to complete transaction of <strong>{formatCurrency(parseFloat(paymentAmount))}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                
                {/* Method A: UPI */}
                {paymentMethod === "UPI" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">UPI ID / Virtual Address</Label>
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
                          className="border border-border hover:border-primary/30 p-2.5 rounded-xl text-center text-xs font-semibold text-muted-foreground bg-muted/30 hover:bg-primary/5 transition-all"
                          onClick={() => setUpiId(`ritesh@${app === "Google Pay" ? "okgpay" : app === "PhonePe" ? "ybl" : "paytm"}`)}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enter 4 or 6-Digit UPI PIN</Label>
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
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cardholder Name</Label>
                      <Input
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Ritesh Suryawanshi"
                        className="h-11 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Registered Mobile Number</Label>
                      <Input
                        value={cardPhone}
                        maxLength={10}
                        onChange={(e) => setCardPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 10-digit mobile number"
                        className="h-11 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Card Number</Label>
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
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expiry Date</Label>
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
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CVV Code</Label>
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
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Bank</Label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full h-11 border border-border rounded-lg p-2.5 text-sm font-medium bg-card"
                      >
                        <option>SBI</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">NetBanking Username</Label>
                      <Input
                        value={bankUsername}
                        onChange={(e) => setBankUsername(e.target.value)}
                        placeholder="User login ID"
                        className="h-11 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Login Password</Label>
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
                <Button variant="outline" onClick={() => setShowPaymentUI(false)} className="text-muted-foreground font-medium">
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
                  className="absolute -left-2 -top-1 h-8 w-8 text-muted-foreground" 
                  onClick={() => setPaymentStage("details")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 pl-7 text-primary">
                  <Smartphone className="h-5 w-5 text-primary" />
                  SMS OTP verification
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium pl-7">
                  Enter the 6-digit transaction passcode sent to +91 *******{cardPhone.slice(-3)}. (For testing, enter <strong>123456</strong>)
                </DialogDescription>
              </DialogHeader>

              <div className="py-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center block">Enter 6-Digit SMS Passcode</Label>
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
                <Button variant="outline" onClick={() => setShowPaymentUI(false)} className="text-muted-foreground font-medium">
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
                <h3 className="font-bold text-foreground text-lg">Repayment Success!</h3>
                <p className="text-xs text-muted-foreground font-medium">Your payment has been successfully authorized and confirmed.</p>
              </div>
              
              <div className="w-full bg-muted/30 border border-border rounded-xl p-4 text-xs text-left space-y-2 font-medium">
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
                  <span className="font-mono text-[10px] text-muted-foreground">TXN{Date.now()}</span>
                </div>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={showPaymentHistory} onOpenChange={setShowPaymentHistory}>
        <DialogContent className="max-w-3xl sm:rounded-2xl border-border dark:border-border bg-card dark:bg-slate-900 shadow-xl overflow-hidden p-6">
          <DialogHeader className="pb-4 border-b border-border dark:border-border flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Repayment Transaction History
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                View your historical payment records and receipts.
              </DialogDescription>
            </div>
            {payments.length > 0 && (
              <Button 
                onClick={exportTransactionsCSV}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-xl h-9 flex items-center gap-1.5 shrink-0"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            )}
          </DialogHeader>

          <div className="py-4 overflow-x-auto max-h-[400px]">
            {payments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <div className="p-3 bg-muted/30 dark:bg-slate-800/50 text-muted-foreground rounded-full">
                  <CreditCard className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground dark:text-slate-200">No Transactions Yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Once you make your first repayment or EMI, the details will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border dark:border-border text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 px-4">Reference ID</th>
                    <th className="pb-3 px-4">Method</th>
                    <th className="pb-3 px-4 text-right">Amount</th>
                    <th className="pb-3 px-4 text-center">Status</th>
                    <th className="pb-3 pl-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                  {payments.map((p) => (
                    <tr key={p.payment.id} className="text-muted-foreground dark:text-muted-foreground hover:bg-muted/30/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(p.payment.paymentDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground">
                        {p.payment.paymentReference}
                      </td>
                      <td className="py-3 px-4 font-semibold uppercase text-muted-foreground dark:text-muted-foreground">
                        {p.payment.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground dark:text-white">
                        {formatCurrency(parseFloat(p.payment.amount))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={`border-none text-[10px] font-bold px-2 py-0.5 ${
                            p.payment.status === "success" || p.payment.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : p.payment.status === "pending"
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-50 dark:bg-rose-950/30 dark:text-rose-455"
                          }`}
                        >
                          {p.payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        {p.payment.status === "success" ? (
                          <Button
                            type="button"
                            onClick={() => printReceipt(p)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary rounded-lg flex items-center justify-center ml-auto"
                            title="Print Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-medium block text-right">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <DialogFooter className="pt-4 border-t border-border dark:border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentHistory(false)}
              className="border-border dark:border-border"
            >
              Close Window
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card className="rounded-2xl border border-border/60 dark:border-border shadow-sm bg-card dark:bg-slate-900 overflow-hidden">
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
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    if (action.id === "emi-calc") onNavigateToCalculator("emi");
                    else if (action.id === "gold-calc") onNavigateToCalculator("gold");
                    else if (action.id === "fd-calc") onNavigateToCalculator("fd");
                    else if (action.id === "make-payment") setShowPaymentUI(true);
                    else if (action.id === "loan-apply" && onNavigateToPage) setIsLoanSelectorOpen(true);
                    else if (action.id === "payment-history") {
                      setShowPaymentHistory(true);
                    }
                  }}
                  className="p-5 flex items-start gap-4 rounded-xl border border-border/70 dark:border-border bg-card dark:bg-slate-900 text-left hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:shadow-md transition-all duration-200 group active:scale-[0.98]"
                >
                  <div className="p-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg group-hover:scale-110 transition-transform duration-200 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground dark:text-slate-200 group-hover:text-primary transition-colors">{action.title}</p>
                    <p className="text-xs text-muted-foreground leading-normal">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      {/* Tab 3: FDs & Investments */}
      <TabsContent value="investments" className="space-y-6">
        {(() => {
          const fdServices = userServices.filter(
            (s) => s.serviceType.name === "fixed_deposit" || s.serviceType.displayName.toLowerCase().includes("deposit")
          );
          
          const activeFds = fdServices.filter((s) => s.userService.status === "active");

          const totalInvested = activeFds.reduce((sum, s) => sum + parseFloat(s.userService.amount), 0);
          
          let totalAccrued = 0;
          let totalMaturity = 0;

          const fdsWithAccrued = activeFds.map((s) => {
            const principal = parseFloat(s.userService.amount);
            const rate = parseFloat(s.userService.interestRate) / 100;
            const tenureMonths = s.userService.tenure;
            const bookingDate = new Date(s.userService.applicationDate);
            const currentDate = new Date();
            
            const diffTime = Math.max(0, currentDate.getTime() - bookingDate.getTime());
            const daysActive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const accrued = principal * (rate * (daysActive / 365));
            totalAccrued += accrued;

            const years = tenureMonths / 12;
            const maturityValue = principal * Math.pow(1 + rate/4, 4 * years);
            totalMaturity += maturityValue;

            const maturityDate = new Date(s.userService.applicationDate);
            maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);
            const totalDuration = Math.max(1, maturityDate.getTime() - bookingDate.getTime());
            const elapsed = Math.max(0, Math.min(totalDuration, currentDate.getTime() - bookingDate.getTime()));
            const progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

            return {
              ...s,
              accrued,
              maturityValue,
              maturityDate,
              progressPercent,
              daysActive
            };
          });

          return (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/60 dark:border-border shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-primary/5">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Invested Principal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-foreground">
                      ₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Active FD principal balances sum</p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 dark:border-border shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-green-500/10">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accrued Interest (Live)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-green-600 dark:text-green-400 flex items-center gap-1">
                      <TrendingUp className="h-5 w-5 animate-pulse text-green-500" />
                      ₹{totalAccrued.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Interest earned elapsed to date</p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 dark:border-border shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-purple-500/10">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Est. Maturity Value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-purple-650 dark:text-purple-400">
                      ₹{totalMaturity.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Total principal + maturity interest</p>
                  </CardContent>
                </Card>
              </div>

              {/* FDs List */}
              <div className="space-y-4 text-left">
                <h3 className="text-base font-bold text-foreground dark:text-white">Active Fixed Deposits</h3>
                {activeFds.length === 0 ? (
                  <Card className="border-border/60 dark:border-border p-8 text-center flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-muted/30 dark:bg-slate-900/60 rounded-full text-muted-foreground">
                      <PiggyBank className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground dark:text-white">No active Fixed Deposits</h4>
                      <p className="text-xs text-muted-foreground max-w-sm">Grow your wealth with Bhalchandra Finance's high-yield Fixed Deposits.</p>
                    </div>
                    <Button 
                      onClick={() => onNavigateToCalculator("fd")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 font-semibold"
                    >
                      Book a Fixed Deposit
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fdsWithAccrued.map((fd) => (
                      <Card key={fd.userService.id} className="border-border/60 dark:border-border shadow-sm relative overflow-hidden bg-card dark:bg-slate-900">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                        <CardHeader className="pb-3 border-b border-border dark:border-border flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-sm font-bold text-foreground dark:text-white">Fixed Deposit</CardTitle>
                            <CardDescription className="text-[10px] font-mono mt-0.5">{fd.userService.applicationNumber}</CardDescription>
                          </div>
                          <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10 text-[10px] font-bold">
                            {fd.userService.interestRate}% P.A.
                          </Badge>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Principal</span>
                              <span className="text-sm font-black text-foreground dark:text-white">₹{parseFloat(fd.userService.amount).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Accrued Interest</span>
                              <span className="text-sm font-black text-green-600 dark:text-green-400">₹{fd.accrued.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Booking Date</span>
                              <span className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground">{new Date(fd.userService.applicationDate).toLocaleDateString("en-IN")}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Maturity Date</span>
                              <span className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground">{fd.maturityDate.toLocaleDateString("en-IN")}</span>
                            </div>
                          </div>
 
                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                              <span>Maturity Progress</span>
                              <span>{fd.progressPercent}% ({fd.daysActive} days)</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${fd.progressPercent}%` }}></div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border dark:border-border flex items-center justify-between gap-4">
                            <div className="space-y-0.5 text-left">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Est. Maturity Payout</span>
                              <span className="text-sm font-black text-purple-650 dark:text-purple-400">₹{fd.maturityValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <Button 
                              type="button"
                              onClick={() => handlePreCloseFdClick(fd)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/30 text-xs font-bold rounded-xl px-4 h-9 flex items-center gap-1"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Close Prematurely
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Premature Closure Modal */}
              <Dialog open={closingFd !== null} onOpenChange={(open) => { if (!open) { setClosingFd(null); setCloseFdCalcs(null); } }}>
                <DialogContent className="max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6">
                  <DialogHeader className="text-left flex flex-col gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-705">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-lg font-bold text-foreground">Premature FD Closure</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                      Are you sure you want to pre-close this Fixed Deposit? Premature withdrawals incur a **1.00% interest rate penalty** as per bank regulations.
                    </DialogDescription>
                  </DialogHeader>

                  {closeFdCalcs && (
                    <div className="mt-4 p-4 rounded-xl border border-border dark:border-border space-y-3 bg-muted/30 text-xs text-left">
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground">Invested Principal:</span>
                        <span className="text-foreground">₹{closeFdCalcs.principal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground">Days Active:</span>
                        <span className="text-foreground">{closeFdCalcs.daysActive} days</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground">Penalized Interest Rate:</span>
                        <span className="text-foreground">{closeFdCalcs.penalizedRate}% (was {closeFdCalcs.originalRate}%)</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-700">
                        <span>Accrued Interest (Penalized):</span>
                        <span>+ ₹{closeFdCalcs.accruedInterest.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="border-t border-border/60 pt-2 flex justify-between font-black text-sm text-primary">
                        <span>Total Est. Refund Payout:</span>
                        <span>₹{closeFdCalcs.totalPayout.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}

                  <DialogFooter className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setClosingFd(null); setCloseFdCalcs(null); }}
                      disabled={closeFdLoading}
                      className="rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleConfirmCloseFd}
                      disabled={closeFdLoading}
                      className="rounded-full flex items-center gap-2"
                    >
                      {closeFdLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing Payout...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Confirm & Close FD
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          );
        })()}
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
                  <div className="text-center py-12 border border-dashed border-border rounded-xl space-y-3">
                    <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
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
                        <tr className="border-b border-border text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pl-2">Document Details</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Account Reference</th>
                          <th className="pb-3">Verification Status</th>
                          <th className="pb-3 text-right pr-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {vaultDocs.map((doc, idx) => (
                          <tr key={idx} className="hover:bg-muted/30/50 transition-colors">
                            <td className="py-3 pl-2">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
                              <span className="font-semibold text-muted-foreground capitalize">
                                {doc.docTypeKey.replace(/([A-Z])/g, " $1")}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="font-mono text-muted-foreground font-semibold">{doc.applicationNumber}</span>
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
                                className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
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
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Category</Label>
                  <select 
                    value={vaultDocCategory}
                    onChange={(e) => setVaultDocCategory(e.target.value)}
                    className="w-full h-10 border border-border rounded-lg p-2.5 text-xs font-semibold bg-card focus:outline-none"
                  >
                    <option value="Aadhaar / Photo Identity Proof">Aadhaar / Photo Identity Proof</option>
                    <option value="PAN Verification Card">PAN Verification Card</option>
                    <option value="Recent Salary Slip">Recent Salary Slip</option>
                    <option value="3-Month Bank Statement Ledger">3-Month Bank Statement Ledger</option>
                  </select>
                </div>
                
                {/* Drag and Drop Zone */}
                <div 
                  onClick={() => document.getElementById("vault-file-input")?.click()}
                  className="border border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/30/50 cursor-pointer transition-all space-y-2"
                >
                  <input
                    id="vault-file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedVaultFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl mx-auto shadow-sm">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground">
                      {selectedVaultFile ? selectedVaultFile.name : "Choose File or drag here"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {selectedVaultFile ? `${(selectedVaultFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF, PNG, JPG up to 10MB"}
                    </p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-primary text-primary-foreground font-bold h-10 text-xs shadow-md"
                  disabled={!selectedVaultFile || isVaultUploading}
                  onClick={async () => {
                    if (!selectedVaultFile) return;
                    setIsVaultUploading(true);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const docTypeKey = vaultDocCategory.toLowerCase().replace(/[^a-z]/g, "");
                    const newDoc = {
                      name: selectedVaultFile.name,
                      size: selectedVaultFile.size,
                      type: selectedVaultFile.type || "application/pdf",
                      uploadedAt: new Date().toISOString(),
                      docTypeKey: docTypeKey,
                      applicationNumber: "MANUAL-UPLOAD",
                      status: "Under Review" as const
                    };
                    
                    setManualVaultDocs(prev => [...prev, newDoc]);
                    setSelectedVaultFile(null);
                    setIsVaultUploading(false);
                    
                    toast({
                      title: "Document Uploaded",
                      description: `${selectedVaultFile.name} has been added to your secure KYC ledger.`,
                    });
                  }}
                >
                  {isVaultUploading ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading File...
                    </span>
                  ) : (
                    "Submit File to Vault"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
      </Tabs>

      {/* Dialog for Profile Details Pop-up */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card dark:bg-slate-900 border-border dark:border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground dark:text-white">
              <User className="h-5 w-5 text-primary" />
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
                  className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-border"
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
                  className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-border"
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

            <div className="border-t pt-4 mt-2 space-y-4">
              <h4 className="text-xs font-bold text-foreground dark:text-white flex items-center gap-1.5">
                <Building className="h-4 w-4 text-primary" />
                Bank Account Details (For Disbursements)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modalBankName" className="text-xs font-bold">Bank Name</Label>
                  <Input
                    id="modalBankName"
                    placeholder="e.g. State Bank of India"
                    value={modalBankName}
                    onChange={(e) => setModalBankName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modalAccountHolder" className="text-xs font-bold">Account Holder Name</Label>
                  <Input
                    id="modalAccountHolder"
                    placeholder="e.g. Ritesh Suryawanshi"
                    value={modalAccountHolder}
                    onChange={(e) => setModalAccountHolder(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modalAccountNumber" className="text-xs font-bold">Account Number</Label>
                  <Input
                    id="modalAccountNumber"
                    placeholder="e.g. 30123456789"
                    value={modalAccountNumber}
                    onChange={(e) => setModalAccountNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modalIFSC" className="text-xs font-bold">IFSC Code</Label>
                  <Input
                    id="modalIFSC"
                    placeholder="e.g. SBIN0001234"
                    value={modalIFSC}
                    onChange={(e) => setModalIFSC(e.target.value.toUpperCase())}
                    className="uppercase"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modalAccountType" className="text-xs font-bold">Account Type</Label>
                  <select
                    id="modalAccountType"
                    value={modalAccountType}
                    onChange={(e) => setModalAccountType(e.target.value)}
                    className="w-full h-10 px-3 border border-input rounded-md bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-slate-950 dark:border-border"
                    required
                  >
                    <option value="" disabled>Select Account Type</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Current">Current Account</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  if (user) {
                    localStorage.setItem(`profile_popup_seen_${user.id}`, "true");
                  }
                }}
                disabled={isProfileSaving}
                className="rounded-full bg-transparent font-semibold"
              >
                Skip
              </Button>
              <Button
                type="submit"
                disabled={isProfileSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 flex items-center gap-2 border border-transparent shadow-sm"
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

      {/* Dialog for Loan Type Selection */}
      <Dialog open={isLoanSelectorOpen} onOpenChange={setIsLoanSelectorOpen}>
        <DialogContent className="max-w-xl bg-card dark:bg-slate-900 border-border dark:border-border rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground dark:text-white">
              <FileText className="h-5 w-5 text-primary" />
              Select Loan Type
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">
              Choose the category of loan you want to apply for to start the application process
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {[
              {
                id: "home",
                title: "Home Loan",
                icon: Home,
                desc: "Buy your dream home with low rates",
                color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25 hover:border-emerald-500/50"
              },
              {
                id: "car",
                title: "Car Loan",
                icon: Car,
                desc: "Finance new or pre-owned vehicles",
                color: "text-amber-500 bg-amber-500/10 border-amber-500/25 hover:border-amber-500/50"
              },
              {
                id: "personal",
                title: "Personal Loan",
                icon: User,
                desc: "Get instant cash for personal needs",
                color: "text-primary bg-primary/10 border-primary/20 hover:border-primary/50"
              },
              {
                id: "gold",
                title: "Gold Loan",
                icon: Coins,
                desc: "Unlock the value of your gold items",
                color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/25 hover:border-yellow-500/50"
              }
            ].map((loanOption) => {
              const LoanIcon = loanOption.icon;
              return (
                <button
                  key={loanOption.id}
                  type="button"
                  onClick={() => {
                    setIsLoanSelectorOpen(false);
                    if (onNavigateToPage) {
                      onNavigateToPage(`loan-application-${loanOption.id}`);
                    }
                  }}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group ${loanOption.color}`}
                >
                  <div className="p-2.5 rounded-lg bg-card dark:bg-slate-900 shadow-sm border border-border/50 dark:border-border shrink-0">
                    <LoanIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="font-bold text-sm text-foreground dark:text-slate-200 block group-hover:text-primary transition-colors">
                      {loanOption.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-normal block">
                      {loanOption.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLoanSelectorOpen(false)}
              className="w-full text-muted-foreground font-semibold border-border dark:border-border rounded-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
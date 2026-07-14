"use client";
import "react-date-range/dist/styles.css"; // main style file
import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  Users,
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  FileDown,
  RefreshCcw,
  Brain,
  MessageCircle,
  Send,
  Clock,
  PiggyBank,
  MapPin,
  Briefcase,
  User,
  ShieldCheck
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export function AdminDashboard({ user, onPageChange }: any) {
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loanTypes, setLoanTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [liveStats, setLiveStats] = useState({ totalUsers: 0, activeLoans: 0, totalRevenue: 0 });
  const [liveApplications, setLiveApplications] = useState<any[]>([]);
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [livePayments, setLivePayments] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const fetchLiveAdminData = async () => {
    setLiveLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, servicesRes, usersRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/user-services", { headers }),
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/payments", { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.stats) {
          setLiveStats(statsData.stats);
        }
      }
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        if (servicesData.success && Array.isArray(servicesData.services)) {
          setLiveApplications(servicesData.services);
        }
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success && Array.isArray(usersData.users)) {
          setLiveUsers(usersData.users);
        }
      }
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        if (paymentsData.success && Array.isArray(paymentsData.payments)) {
          setLivePayments(paymentsData.payments);
        }
      }
    } catch (err) {
      console.error("Failed to load live admin data", err);
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAdminData();
  }, []);

  // Request notifications permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // ✅ Live Analytics & Graph Updates from liveApplications / livePayments
  useEffect(() => {
    // 1. Group Revenue by Month from livePayments
    const grouped: Record<string, number> = {};

    // Sort payments chronologically
    const sortedPayments = [...livePayments].sort(
      (a, b) => new Date(a.payment.paymentDate).getTime() - new Date(b.payment.paymentDate).getTime()
    );

    sortedPayments.forEach((p: any) => {
      const date = new Date(p.payment.paymentDate);
      const month = date.toLocaleString("en-IN", { month: "short" });
      grouped[month] = (grouped[month] || 0) + parseFloat(p.payment.amount);
    });

    let monthly = Object.keys(grouped).map((m) => ({
      month: m,
      amount: grouped[m],
    }));

    if (monthly.length === 0) {
      const currentMonth = new Date().toLocaleString("en-IN", { month: "short" });
      monthly = [{ month: currentMonth, amount: 0 }];
    }

    setMonthlyRevenue(monthly);

    // 2. Loan Type Distribution from liveApplications
    const loanDist: Record<string, number> = {};
    const filteredApps = liveApplications;

    filteredApps.forEach((app: any) => {
      const name = app.serviceType.displayName || app.serviceType.name;
      loanDist[name] = (loanDist[name] || 0) + 1;
    });

    const colors = ["#002D72", "#FFCB08", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"];
    const formattedDist = Object.entries(loanDist).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));

    setLoanTypes(formattedDist);
  }, [liveApplications, livePayments]);

  // ✅ AI Revenue Forecast
  useEffect(() => {
  if (!monthlyRevenue.length) return;

  const x = monthlyRevenue.map((_, i) => i);
  const y = monthlyRevenue.map(d => d.amount);

  if (y.length < 2) {
    setForecastData(monthlyRevenue);
    return;
  }

  // Linear regression
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const futureMonths = ["Jul", "Aug", "Sep"];
  const predictions = futureMonths.map((m, i) => ({
    month: m,
    amount: Math.round(intercept + slope * (x.length + i)),
    predicted: true,
  }));

  setForecastData([...monthlyRevenue, ...predictions]);
}, [monthlyRevenue]);

 // ✅ AI Insights with Linear Regression Forecast
  useEffect(() => {
    if (liveApplications.length === 0 || monthlyRevenue.length === 0) {
      setAiInsights([
        "💡 AI Insight: No live applications recorded in the database yet.",
        "📈 Portfolio Strategy: Promote the Gold Loan schemes from the user console to drive customer growth."
      ]);
      return;
    }

    const totalRevenue = liveStats.totalRevenue;
    const lastMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.amount || 0;
    const prevMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2]?.amount || 0;
    const revenueGrowth = prevMonthRevenue
      ? (((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(2)
      : "0";

    const serviceRevenueMap: Record<string, number> = {};
    liveApplications.forEach((app: any) => {
      const name = app.serviceType.displayName || app.serviceType.name;
      serviceRevenueMap[name] = (serviceRevenueMap[name] || 0) + parseFloat(app.userService.amount);
    });

    const topServices = Object.entries(serviceRevenueMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    const pendingLoans = liveApplications.filter(app => app.userService.status === "pending").length;

    const x = monthlyRevenue.map((_, i) => i);
    const y = monthlyRevenue.map(d => d.amount);
    let predictedRevenue = 0;

    if (y.length >= 2) {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
      const sumXX = x.reduce((a, b) => a + b * b, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      predictedRevenue = Math.round(
        intercept + slope * (x.length) +
        intercept + slope * (x.length + 1) +
        intercept + slope * (x.length + 2)
      );
    } else {
      predictedRevenue = Math.round(totalRevenue * 1.1);
    }

    setAiInsights([
      `📈 Live Payment Revenue grew ${revenueGrowth}% last month.`,
      `⚠️ Pending applications awaiting action: ${pendingLoans}`,
      `💰 Top contributing schemes: ${topServices.join(", ") || "None"}`,
      `🧮 Predicted live payment revenue next quarter: ${formatCurrency(predictedRevenue)}`
    ]);
  }, [liveApplications, livePayments, monthlyRevenue, liveStats]);

  // ✅ Daily Revenue (Advanced Analytics)
  useEffect(() => {
    const filtered = livePayments.filter(p => {
      const pDate = new Date(p.payment.paymentDate);
      return pDate >= dateRange.start && pDate <= dateRange.end;
    });

    const grouped: Record<string, number> = {};
    filtered.forEach(p => {
      const dateStr = new Date(p.payment.paymentDate).toLocaleDateString("en-IN");
      grouped[dateStr] = (grouped[dateStr] || 0) + parseFloat(p.payment.amount);
    });

    setDailyRevenue(Object.entries(grouped).map(([date, amount]) => ({ date, amount })));
  }, [livePayments, dateRange]);

  // ✅ Activity Logger
  const logActivity = (msg: string) => {
    setActivityLog(prev => [msg, ...prev.slice(0, 49)]);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(msg);
    }
  };

  // ✅ Export CSV
  const handleExportData = () => {
    const csvRows = [
      ["App Number", "Customer Name", "Customer Email", "Service / Loan Type", "Requested Amount", "EMI Amount", "Status"],
      ...liveApplications.map((app: any) => [
        app.userService.applicationNumber,
        app.user.name,
        app.user.email,
        app.serviceType.displayName || app.serviceType.name,
        app.userService.amount,
        app.userService.emi || "0",
        app.userService.status,
      ]),
    ];
    const blob = new Blob([csvRows.map((r) => r.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "live_finance_applications.csv";
    a.click();
    logActivity("📤 CSV exported successfully");
  };

  // ✅ Generate PDF (unchanged from your current robust version)
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const element = dashboardRef.current;
      if (!element) {
        alert("Report generation failed: dashboard not found.");
        setLoading(false);
        return;
      }

      // Capture active element directly, preserving responsive chart dimensions
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Multi-page support
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save("FinanceFlowAI_Report.pdf");
      logActivity("📄 PDF report generated successfully");
    } catch (err) {
      console.error("PDF generation error:", err);
      logActivity("❌ PDF report generation failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format Currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);



  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground">
          You don’t have permission to access this dashboard.
        </p>
      </div>
    );
  }

  // Calculate dynamic card metrics
  const verificationRate = liveUsers.length > 0 
    ? ((liveUsers.filter(u => u.isActive).length / liveUsers.length) * 100).toFixed(1) 
    : "100.0";



  // Exclude fixed deposits from outstanding loan portfolio since FDs are user assets, not debts
  const totalOutstanding = liveApplications
    .filter(a => a.userService.status === "active" && a.serviceType.name !== "fixed-deposit")
    .reduce((sum, a) => sum + parseFloat(a.userService.outstandingAmount || "0"), 0);

  // Exclude fixed deposits from loan approval statistics
  const loanApplications = liveApplications.filter(a => a.serviceType.name !== "fixed-deposit");
  const approvalSuccessRate = loanApplications.length > 0
    ? ((loanApplications.filter(a => ["active", "completed"].includes(a.userService.status)).length / loanApplications.length) * 100).toFixed(1)
    : "0.0";

  // Fixed Deposit metrics
  const fdApplications = liveApplications.filter(
    (a) => a.serviceType.name === "fixed-deposit" && a.userService.status === "active"
  );
  const fdAccountsCount = fdApplications.length;
  const fdVolume = fdApplications.reduce((sum, a) => sum + parseFloat(a.userService.amount || "0"), 0);
  const fdTarget = 1000000; // 10 Lakhs target goal
  const fdProgress = Math.min(100, Number(((fdVolume / fdTarget) * 100).toFixed(1)));

  return (
    <div className="p-6 sm:p-8 space-y-8" ref={dashboardRef}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Real-time Finance Insights & AI Forecast</p>
        </div>
        <div className="flex gap-2" data-html2canvas-ignore="true">
          <Button variant="outline" onClick={handleExportData}>
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" /> Generate Report
              </>
            )}
          </Button>
        </div>
      </div>



      {/* PREMIUM KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Users & Signups */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          {/* Top section */}
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-gray-100">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Total Active Users</span>
              <div className="text-2xl font-bold text-gray-900">{liveStats.totalUsers}</div>
              <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-none text-[10px] py-0.5 px-2 font-semibold">
                Live Database
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-100">
              <Users className="h-5 w-5" />
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">New Signups (Today)</span>
              <div className="text-xl font-bold text-gray-800">
                {liveUsers.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length}
              </div>
              <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> Awaiting action
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-100">
              <Users className="h-5 w-5" />
            </div>
          </div>
          
          {/* Progress footer */}
          <div className="space-y-1.5 mt-auto">
            <div className="my-2" data-html2canvas-ignore="true">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange && onPageChange("admin-users")}
                className="text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto font-bold flex items-center gap-1"
              >
                Manage Users Directory &rarr;
              </Button>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Verification Rate</span>
              <span className="text-primary font-bold">{verificationRate}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${verificationRate}%` }} />
            </div>
          </div>
          {/* Accent bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </Card>

        {/* Card 2: Revenue & Portfolio */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          {/* Top section */}
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-gray-100">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Total Revenue</span>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(liveStats.totalRevenue)}</div>
              <span className="text-[10px] text-gray-500 font-medium">From completed EMI payments</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-100">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Outstanding Portfolio</span>
              <div className="text-xl font-bold text-gray-800">
                {formatCurrency(totalOutstanding)}
              </div>
              <span className="text-[10px] text-gray-500 font-medium">Total active outstanding balance</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          
          {/* Progress footer */}
          <div className="space-y-1.5 mt-auto">
            <div className="my-2" data-html2canvas-ignore="true">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange && onPageChange("admin-payments")}
                className="text-xs text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 p-0 h-auto font-bold flex items-center gap-1"
              >
                View Repayments Ledger &rarr;
              </Button>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Collection Recovery Rate</span>
              <span className="text-cyan-600 font-bold">86.8%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" style={{ width: "86.8%" }} />
            </div>
          </div>
          {/* Accent bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500" />
        </Card>

        {/* Card 3: Applications & Performance */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          {/* Top section */}
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-gray-100">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Total Applications</span>
              <div className="text-2xl font-bold text-gray-900">{liveApplications.length}</div>
              <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none text-[10px] py-0.5 px-2 font-semibold">
                +100% Growth
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Pending Reviews</span>
              <div className="text-xl font-bold text-amber-600">
                {liveApplications.filter(a => a.userService.status === "pending").length}
              </div>
              <span className="text-[10px] text-gray-500 font-medium">Awaiting administrator approval</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-100">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          
          {/* Progress footer */}
          <div className="space-y-1.5 mt-auto">
            <div className="my-2" data-html2canvas-ignore="true">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange && onPageChange("admin-applications")}
                className="text-xs text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 p-0 h-auto font-bold flex items-center gap-1"
              >
                Review Loan Applications &rarr;
              </Button>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Approval Success Rate</span>
              <span className="text-indigo-600 font-bold">{approvalSuccessRate}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${approvalSuccessRate}%` }} />
            </div>
          </div>
          {/* Accent bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        </Card>

        {/* Card 4: FDs & Investments */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden flex flex-col justify-between p-5 min-h-[280px]">
          {/* Top section */}
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-gray-100">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Fixed Deposit Accounts</span>
              <div className="text-2xl font-bold text-gray-900">{fdAccountsCount}</div>
              <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-none text-[10px] py-0.5 px-2 font-semibold">
                High-Yield Interest
              </Badge>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-100">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="flex justify-between items-start pt-4 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">FD Investment Volume</span>
              <div className="text-xl font-bold text-gray-800">{formatCurrency(fdVolume)}</div>
              <span className="text-[10px] text-gray-500 font-medium">Total capital invested in FDs</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          
          {/* Progress footer */}
          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Target Deposit Goal</span>
              <span className="text-rose-600 font-bold">{fdProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${fdProgress}%` }} />
            </div>
          </div>
          {/* Accent bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
        </Card>
        
      </div>

      {/* TABS */}
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Live Analytics</TabsTrigger>
          <TabsTrigger value="forecast">AI Forecast</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* ANALYTICS */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue */}
            <Card>
              <CardHeader><CardTitle>Live Monthly Revenue</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Loan Type Distribution */}
            <Card>
              <CardHeader><CardTitle>Live Loan Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={loanTypes} dataKey="value" outerRadius={100}>
                      {loanTypes.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Revenue Trend */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Daily Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <DateRange
                  ranges={[{ startDate: dateRange.start, endDate: dateRange.end, key: 'selection' }]}
                  onChange={(item: any) => setDateRange({ start: item.selection.startDate, end: item.selection.endDate })}
                  className="mb-4"
                />
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Line type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FORECAST */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" /> AI Revenue Forecast
              </CardTitle>
              <CardDescription>Next 3 months based on current growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                                    <Line type="monotone" dataKey="amount" stroke="#16A34A" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI INSIGHTS */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Insights & Recommendations</CardTitle>
                <CardDescription>Smart suggestions generated from your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="p-2 bg-blue-50 rounded-md">{insight}</div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Log & Notifications</CardTitle>
                <CardDescription>Recent admin actions and alerts</CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto max-h-96 space-y-1">
                {activityLog.length === 0 ? (
                  <div className="text-gray-500 text-sm">No recent activity.</div>
                ) : (
                  activityLog.map((act, idx) => (
                    <div key={idx} className="text-sm">{act}</div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
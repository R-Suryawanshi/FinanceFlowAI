"use client";
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
  FileText,
  Clock,
  ShieldCheck,
  User,
  MapPin,
  Briefcase,
  DollarSign,
  RefreshCcw,
  Search,
  CheckCircle,
  ArrowLeft,
  Building
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AdminApplicationsPageProps {
  user: any;
  onBack?: () => void;
}

export function AdminApplicationsPage({ user, onBack }: AdminApplicationsPageProps) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [liveStats, setLiveStats] = useState({ totalUsers: 0, activeLoans: 0, totalRevenue: 0 });
  const [liveApplications, setLiveApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLiveApplicationsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, servicesRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/user-services", { headers }),
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
    } catch (err) {
      console.error("Failed to load admin applications data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/user-services/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchLiveApplicationsData();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating loan status:", err);
    }
  };

  useEffect(() => {
    fetchLiveApplicationsData();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground">
          You don’t have permission to access this page.
        </p>
      </div>
    );
  }

  // Filtered pending and processed applications based on admin search and filter inputs
  const filteredPending = liveApplications.filter(app => {
    if (app.userService.status !== "pending") return false;
    if (filter !== "All" && filter !== "Pending") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = app.user.name?.toLowerCase().includes(q);
      const emailMatch = app.user.email?.toLowerCase().includes(q);
      const appNumMatch = app.userService.applicationNumber?.toLowerCase().includes(q);
      const serviceMatch = (app.serviceType.displayName || app.serviceType.name)?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !appNumMatch && !serviceMatch) return false;
    }
    return true;
  });

  const filteredProcessed = liveApplications.filter(app => {
    if (app.userService.status === "pending") return false;
    if (filter !== "All") {
      const option = filter.toLowerCase();
      const status = app.userService.status.toLowerCase();
      if (option === "approved") {
        if (status !== "approved" && status !== "active") return false;
      } else if (status !== option) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = app.user.name?.toLowerCase().includes(q);
      const emailMatch = app.user.email?.toLowerCase().includes(q);
      const appNumMatch = app.userService.applicationNumber?.toLowerCase().includes(q);
      const serviceMatch = (app.serviceType.displayName || app.serviceType.name)?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !appNumMatch && !serviceMatch) return false;
    }
    return true;
  });

  // Exclude fixed deposits from loan approval statistics
  const loanApplications = liveApplications.filter(a => a.serviceType.name !== "fixed-deposit");
  const approvalSuccessRate = loanApplications.length > 0
    ? ((loanApplications.filter(a => ["active", "completed"].includes(a.userService.status)).length / loanApplications.length) * 100).toFixed(1)
    : "0.0";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-4">
          {onBack && (
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              data-testid="page-back-button"
              className="h-10 w-10 rounded-lg border border-border/50 dark:border-border bg-card dark:bg-slate-900 text-primary hover:bg-muted/30 dark:hover:bg-slate-955 transition-colors shadow-sm flex items-center justify-center shrink-0 mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="space-y-1 flex-1 text-left">
            <h1 className="text-3xl font-bold text-foreground dark:text-white">Applications Ledger</h1>
            <p className="text-muted-foreground">Manage and review incoming customer finance applications</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto border-border dark:border-border hover:bg-muted dark:hover:bg-slate-850" onClick={fetchLiveApplicationsData} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Applications */}
        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Total Applications</span>
              <div className="text-3xl font-bold text-foreground dark:text-white">{liveApplications.length}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
        </Card>

        {/* Metric 2: Pending Reviews */}
        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Pending Reviews</span>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {liveApplications.filter(a => a.userService.status === "pending").length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-100 dark:shadow-none">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </Card>

        {/* Metric 3: Approval Rate */}
        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Approval Success Rate</span>
              <div className="text-3xl font-bold text-primary">{approvalSuccessRate}%</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100 dark:shadow-none">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 dark:bg-slate-900/30 p-4 rounded-xl border border-border dark:border-border">
        <h2 className="font-semibold text-lg text-foreground dark:text-slate-200">Review Board</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select className="border border-border dark:border-border p-2 rounded-md text-sm bg-card dark:bg-slate-900 text-foreground dark:text-slate-200 shrink-0 focus:outline-none focus:ring-1 focus:ring-ring" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Approved">Approved Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search user or service..."
              className="border border-border dark:border-border pl-8 pr-3 py-2 w-full rounded-md text-sm bg-card dark:bg-slate-900 text-foreground dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      {(filter === "All" || filter === "Pending") && (
        <Card className="rounded-2xl border border-border dark:border-border shadow-md overflow-hidden bg-card dark:bg-slate-900">
          <CardHeader className="bg-muted/30/50 dark:bg-slate-950/20 border-b border-border dark:border-border/80">
            <CardTitle className="text-lg text-foreground dark:text-white font-bold">Pending Loan Applications</CardTitle>
            <CardDescription>Verify user documents and underwrite requested loans</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto max-h-[400px]">
            {filteredPending.length === 0 ? (
              <div className="text-center text-muted-foreground dark:text-muted-foreground py-12 text-sm font-medium">No pending applications found.</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-muted/30 dark:bg-slate-950/30">
                  <tr>
                    {["App #", "Customer", "Email", "Loan Name", "Requested", "Tenure", "Details", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPending.map((app) => (
                    <tr key={app.userService.id} className="hover:bg-muted/30/40 dark:hover:bg-slate-800/40 text-sm">
                      <td className="px-6 py-4 font-semibold text-primary">{app.userService.applicationNumber}</td>
                      <td className="px-6 py-4 font-medium text-foreground dark:text-slate-200">{app.user.name}</td>
                      <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">{app.user.email}</td>
                      <td className="px-6 py-4 font-medium text-muted-foreground dark:text-slate-300 capitalize">{app.serviceType.displayName || app.serviceType.name}</td>
                      <td className="px-6 py-4 font-bold text-foreground dark:text-white">{formatCurrency(Number(app.userService.amount))}</td>
                      <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">{app.userService.tenureMonths} Months</td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-primary/20 text-primary hover:bg-primary/5 flex items-center gap-1 font-medium text-xs rounded-lg"
                          onClick={() => setSelectedApp(app)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Review KYC
                        </Button>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                          onClick={() => handleUpdateStatus(app.userService.id, "active")}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="font-medium rounded-lg"
                          onClick={() => handleUpdateStatus(app.userService.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active & Closed Loans Ledger */}
      <Card className="rounded-2xl border border-border dark:border-border shadow-md overflow-hidden bg-card dark:bg-slate-900">
        <CardHeader className="bg-muted/30/50 dark:bg-slate-950/20 border-b border-border dark:border-border/80">
          <CardTitle className="text-lg text-foreground dark:text-white font-bold">Active & Closed Loans Ledger</CardTitle>
          <CardDescription>Repayment tracking and balances ledger for verified loans</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[400px]">
          {filteredProcessed.length === 0 ? (
            <div className="text-center text-slate-450 dark:text-muted-foreground py-12 text-sm font-medium">No processed applications found matching search criteria.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-muted/30 dark:bg-slate-950/30">
                <tr>
                  {["App #", "Customer", "Loan Name", "Approved Amount", "Monthly EMI", "Outstanding", "Paid", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-card dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProcessed.map((app) => (
                  <tr key={app.userService.id} className="hover:bg-muted/30/40 dark:hover:bg-slate-800/40 text-sm">
                    <td className="px-6 py-4 font-semibold text-primary">{app.userService.applicationNumber}</td>
                    <td className="px-6 py-4 font-medium text-foreground dark:text-slate-200">{app.user.name}</td>
                    <td className="px-6 py-4 font-medium text-muted-foreground dark:text-slate-300 capitalize">{app.serviceType.displayName || app.serviceType.name}</td>
                    <td className="px-6 py-4 font-bold text-foreground dark:text-white">{formatCurrency(Number(app.userService.amount))}</td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">{formatCurrency(Number(app.userService.emi || "0"))}</td>
                    <td className="px-6 py-4 font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(Number(app.userService.outstandingAmount || "0"))}</td>
                    <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">{formatCurrency(Number(app.userService.totalPaidAmount || "0"))}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        app.userService.status === "completed" 
                          ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-none hover:bg-green-100" 
                          : app.userService.status === "active" 
                          ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10" 
                          : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-none hover:bg-red-100"
                      }>
                        {app.userService.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* UNDERWRITING & KYC VERIFICATION DIALOG */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 border border-border dark:border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader className="border-b border-border dark:border-border/80 pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
              <ShieldCheck className="h-6 w-6 text-green-650 animate-pulse" />
              Underwriting Sheet & KYC Audit
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground font-medium">
              Verify income proofs, documentation lists, and collateral metrics for Application <strong>{selectedApp?.userService?.applicationNumber}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (() => {
            const appNotesProfile = selectedApp.userService?.notes ? (
              (() => {
                try {
                  const parsed = JSON.parse(selectedApp.userService.notes);
                  if (parsed && typeof parsed === 'object' && parsed.fullName) {
                    return parsed;
                  }
                } catch (e) {}
                return null;
              })()
            ) : null;

            const p = appNotesProfile || selectedApp.profile || {};
            const name = appNotesProfile?.fullName || selectedApp.user?.name || "—";
            const email = appNotesProfile?.email || selectedApp.user?.email || "—";
            const phone = appNotesProfile?.phone || p.phoneNumber || "—";
            const dob = appNotesProfile?.dateOfBirth || p.dateOfBirth;
            const gender = appNotesProfile?.gender || p.gender || "—";
            const aadhar = appNotesProfile?.aadharNumber || p.aadharNumber || "—";
            const pan = appNotesProfile?.panNumber || p.panNumber || "—";
            const address = appNotesProfile?.address || p.address || "—";
            const city = appNotesProfile?.city || p.city || "";
            const state = appNotesProfile?.state || p.state || "";
            const pincode = appNotesProfile?.pincode || p.pincode || "";
            
            const occupation = appNotesProfile?.occupation || p.occupation || "—";
            const companyName = appNotesProfile?.companyName || p.companyName || "—";
            const monthlyIncome = appNotesProfile?.monthlyIncome || p.monthlyIncome || "0";
            const creditScore = p.creditScore || 720;

            const bankName = appNotesProfile?.bankName || p.bankName || "—";
            const accountNumber = appNotesProfile?.accountNumber || p.accountNumber || "—";
            const ifscCode = appNotesProfile?.ifscCode || p.ifscCode || "—";
            const accountHolderName = appNotesProfile?.accountHolderName || p.accountHolderName || "—";
            const accountType = appNotesProfile?.accountType || p.accountType || "—";

            return (
              <div className="space-y-6 pt-4 text-sm">
                
                {/* Row 1: Profile & Contacts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 dark:bg-slate-950/20 p-4 rounded-xl border border-border dark:border-border">
                  <div className="space-y-3">
                    <h3 className="font-bold text-muted-foreground dark:text-slate-350 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Applicant Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-muted-foreground dark:text-muted-foreground">Full Name:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{name}</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Gender:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{gender}</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Email:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{email}</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Phone:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{phone}</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Date of Birth:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">
                        {dob ? new Date(dob).toLocaleDateString("en-IN") : "—"}
                      </span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Aadhaar Number:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{aadhar}</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">PAN Number:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{pan}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-muted-foreground dark:text-slate-350 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Address Details
                    </h3>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-foreground dark:text-slate-200">{address}</p>
                      <p className="text-muted-foreground dark:text-muted-foreground">
                        {[city, state, pincode].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Financial Auditing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 border border-border dark:border-border p-4 rounded-xl">
                    <h3 className="font-bold text-muted-foreground dark:text-slate-350 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Employment & Income
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-muted-foreground dark:text-muted-foreground">Occupation:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200 capitalize">{occupation}</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Company Name:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{companyName}</span>
                      <span className="text-muted-foreground dark:text-slate-550">Monthly Income:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {monthlyIncome ? formatCurrency(parseFloat(monthlyIncome)) : "—"}
                      </span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Credit Score:</span>
                      <span className="font-bold text-primary">{creditScore}</span>
                    </div>
                  </div>

                  <div className="space-y-3 border border-border dark:border-border p-4 rounded-xl">
                    <h3 className="font-bold text-muted-foreground dark:text-slate-350 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" /> Loan Terms
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-muted-foreground dark:text-muted-foreground">Scheme Name:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200 capitalize">{selectedApp.serviceType?.displayName || selectedApp.serviceType?.name}</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Requested Principal:</span>
                      <span className="font-bold text-foreground dark:text-white">{formatCurrency(parseFloat(selectedApp.userService?.amount))}</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Tenure Requested:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{selectedApp.userService?.tenureMonths || selectedApp.userService?.tenure} Months</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Base Interest Rate:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{selectedApp.userService?.interestRate}% p.a.</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">Purpose of Loan:</span>
                      <span className="font-semibold text-foreground dark:text-slate-200 italic col-span-1 break-words">{selectedApp.userService?.purpose || "General Purpose"}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2.5: Bank Account Details */}
                <div className="space-y-3 border border-border dark:border-border p-4 rounded-xl bg-muted/30/50 dark:bg-slate-950/10">
                  <h3 className="font-bold text-muted-foreground dark:text-slate-350 flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" /> Disbursement Bank Account Details
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-450 dark:text-muted-foreground block mb-0.5">Bank Name</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{bankName}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 dark:text-muted-foreground block mb-0.5">Account Number</span>
                      <span className="font-semibold text-foreground dark:text-slate-200 font-mono">{accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 dark:text-muted-foreground block mb-0.5">IFSC Code</span>
                      <span className="font-semibold text-foreground dark:text-slate-200 font-mono">{ifscCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 dark:text-muted-foreground block mb-0.5">Account Holder & Type</span>
                      <span className="font-semibold text-foreground dark:text-slate-200">{accountHolderName} ({accountType})</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Co-Applicant & Collateral */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 dark:bg-slate-950/20 p-4 rounded-xl border border-border dark:border-border">
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-slate-450 dark:text-muted-foreground uppercase tracking-wider">Guarantor / Co-Applicant</h4>
                    {selectedApp.userService?.guarantor ? (
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-foreground dark:text-slate-200">Name: <span className="font-normal text-muted-foreground dark:text-muted-foreground">{(selectedApp.userService.guarantor as any).name || "—"}</span></p>
                        <p className="font-semibold text-foreground dark:text-slate-200">Relation: <span className="font-normal text-muted-foreground dark:text-muted-foreground">{(selectedApp.userService.guarantor as any).relation || "—"}</span></p>
                        <p className="font-semibold text-foreground dark:text-slate-200">Income: <span className="font-normal text-muted-foreground dark:text-muted-foreground">{(selectedApp.userService.guarantor as any).income ? formatCurrency(parseFloat((selectedApp.userService.guarantor as any).income)) : "—"}</span></p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground dark:text-slate-550 italic">No co-applicant or guarantor provided.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-slate-450 dark:text-muted-foreground uppercase tracking-wider">Collateral / Security Details</h4>
                    {selectedApp.userService?.collateral ? (
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-foreground dark:text-slate-200">Existing Loan Ledger: <span className="font-normal text-muted-foreground dark:text-muted-foreground">{(selectedApp.userService.collateral as any).details || "—"}</span></p>
                        <p className="font-semibold text-foreground dark:text-slate-200">Value of Security: <span className="font-normal text-muted-foreground dark:text-muted-foreground">{(selectedApp.userService.collateral as any).value ? formatCurrency(parseFloat((selectedApp.userService.collateral as any).value)) : "—"}</span></p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground dark:text-slate-550 italic">No existing loan balance or collateral provided.</p>
                    )}
                  </div>
                </div>

                {/* Row 4: KYC Files checklist */}
                <div className="space-y-3 border border-border dark:border-border p-4 rounded-xl">
                  <h3 className="font-bold text-muted-foreground dark:text-slate-350 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Submitted KYC Verification Documents
                  </h3>
                  {selectedApp.userService?.documents && Object.keys(selectedApp.userService.documents).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(selectedApp.userService.documents).map(([key, val]: any) => (
                        <div key={key} className="flex justify-between items-center p-2.5 rounded-lg border border-border dark:border-border bg-muted/30 dark:bg-slate-955/20 text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[10px] text-primary uppercase tracking-wider block">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="font-semibold text-slate-755 dark:text-slate-205 truncate max-w-[180px] block" title={val.name}>
                              {val.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground dark:text-muted-foreground font-bold whitespace-nowrap">
                            {val.size ? `${(val.size / 1024).toFixed(1)} KB` : "Document Loaded"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-amber-50 dark:bg-amber-955/10 rounded-xl border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs flex flex-col gap-1 items-center">
                      <span>⚠️ No KYC file uploads found on this application record.</span>
                      <span className="text-amber-600/80">Please request manual document copies from the applicant.</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })()}
          <DialogFooter className="border-t border-border dark:border-border/80 pt-4 mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedApp(null)}
              className="text-muted-foreground dark:text-muted-foreground font-medium border-border dark:border-border hover:bg-muted dark:hover:bg-slate-850"
            >
              Close
            </Button>
            <Button
              variant="destructive"
              className="font-medium"
              onClick={() => {
                handleUpdateStatus(selectedApp.userService.id, "rejected");
                setSelectedApp(null);
              }}
            >
              Reject Application
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-md shadow-green-100 dark:shadow-none"
              onClick={() => {
                handleUpdateStatus(selectedApp.userService.id, "active");
                setSelectedApp(null);
              }}
            >
              Approve Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

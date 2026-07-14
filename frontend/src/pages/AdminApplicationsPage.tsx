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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function AdminApplicationsPage({ user }: any) {
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Applications Ledger</h1>
          <p className="text-muted-foreground">Manage and review incoming customer finance applications</p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850" onClick={fetchLiveApplicationsData} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Applications */}
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Total Applications</span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{liveApplications.length}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
        </Card>

        {/* Metric 2: Pending Reviews */}
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Pending Reviews</span>
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
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Approval Success Rate</span>
              <div className="text-3xl font-bold text-indigo-650 dark:text-indigo-400">{approvalSuccessRate}%</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100 dark:shadow-none">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold text-lg text-slate-850 dark:text-slate-200">Review Board</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select className="border border-slate-200 dark:border-slate-800 p-2 rounded-md text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shrink-0 focus:outline-none focus:ring-1 focus:ring-ring" value={filter} onChange={(e) => setFilter(e.target.value)}>
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
              className="border border-slate-200 dark:border-slate-800 pl-8 pr-3 py-2 w-full rounded-md text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      {(filter === "All" || filter === "Pending") && (
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-lg text-slate-900 dark:text-white font-bold">Pending Loan Applications</CardTitle>
            <CardDescription>Verify user documents and underwrite requested loans</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto max-h-[400px]">
            {filteredPending.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm font-medium">No pending applications found.</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950/30">
                  <tr>
                    {["App #", "Customer", "Email", "Loan Name", "Requested", "Tenure", "Details", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPending.map((app) => (
                    <tr key={app.userService.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 text-sm">
                      <td className="px-6 py-4 font-semibold text-primary dark:text-blue-400">{app.userService.applicationNumber}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{app.user.name}</td>
                      <td className="px-6 py-4 text-slate-650 dark:text-slate-400">{app.user.email}</td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 capitalize">{app.serviceType.displayName || app.serviceType.name}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{formatCurrency(Number(app.userService.amount))}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{app.userService.tenureMonths} Months</td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-primary/20 dark:border-blue-800 text-primary dark:text-blue-400 hover:bg-primary/5 dark:hover:bg-blue-955/20 flex items-center gap-1 font-medium text-xs rounded-lg"
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
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-lg text-slate-900 dark:text-white font-bold">Active & Closed Loans Ledger</CardTitle>
          <CardDescription>Repayment tracking and balances ledger for verified loans</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[400px]">
          {filteredProcessed.length === 0 ? (
            <div className="text-center text-slate-450 dark:text-slate-500 py-12 text-sm font-medium">No processed applications found matching search criteria.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/30">
                <tr>
                  {["App #", "Customer", "Loan Name", "Approved Amount", "Monthly EMI", "Outstanding", "Paid", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProcessed.map((app) => (
                  <tr key={app.userService.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 text-sm">
                    <td className="px-6 py-4 font-semibold text-primary dark:text-blue-400">{app.userService.applicationNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{app.user.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 capitalize">{app.serviceType.displayName || app.serviceType.name}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{formatCurrency(Number(app.userService.amount))}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatCurrency(Number(app.userService.emi || "0"))}</td>
                    <td className="px-6 py-4 font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(Number(app.userService.outstandingAmount || "0"))}</td>
                    <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">{formatCurrency(Number(app.userService.totalPaidAmount || "0"))}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        app.userService.status === "completed" 
                          ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-none hover:bg-green-100" 
                          : app.userService.status === "active" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-955/30 dark:text-blue-400 border-none hover:bg-blue-100" 
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary dark:text-blue-400">
              <ShieldCheck className="h-6 w-6 text-green-650 animate-pulse" />
              Underwriting Sheet & KYC Audit
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Verify income proofs, documentation lists, and collateral metrics for Application <strong>{selectedApp?.userService?.applicationNumber}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 pt-4 text-sm">
              
              {/* Row 1: Profile & Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary dark:text-blue-400" /> Applicant Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-slate-400 dark:text-slate-500">Full Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.user?.name}</span>
                    <span className="text-slate-400 dark:text-slate-500">Email:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.user?.email}</span>
                    <span className="text-slate-400 dark:text-slate-500">Phone:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.profile?.phoneNumber || "—"}</span>
                    <span className="text-slate-400 dark:text-slate-500">Date of Birth:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedApp.profile?.dateOfBirth 
                        ? new Date(selectedApp.profile.dateOfBirth).toLocaleDateString("en-IN") 
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary dark:text-blue-400" /> Permanent Address
                  </h3>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.profile?.address || "—"}</p>
                    <p className="text-slate-650 dark:text-slate-400">
                      {[selectedApp.profile?.city, selectedApp.profile?.state, selectedApp.profile?.pincode]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: Financial Auditing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                  <h3 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary dark:text-blue-400" /> Employment & Income
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-slate-400 dark:text-slate-500">Occupation:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{selectedApp.profile?.occupation || "—"}</span>
                    <span className="text-slate-400 dark:text-slate-500">Company Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.profile?.companyName || "—"}</span>
                    <span className="text-slate-400 dark:text-slate-500">Monthly Income:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {selectedApp.profile?.monthlyIncome 
                        ? formatCurrency(parseFloat(selectedApp.profile.monthlyIncome)) 
                        : "—"}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">Credit Score:</span>
                    <span className="font-bold text-primary dark:text-blue-400">{selectedApp.profile?.creditScore || 720}</span>
                  </div>
                </div>

                <div className="space-y-3 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                  <h3 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary dark:text-blue-400" /> Loan Terms
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-slate-400 dark:text-slate-500">Scheme Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{selectedApp.serviceType?.displayName || selectedApp.serviceType?.name}</span>
                    <span className="text-slate-400 dark:text-slate-500">Requested Principal:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(parseFloat(selectedApp.userService?.amount))}</span>
                    <span className="text-slate-400 dark:text-slate-500">Tenure Requested:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.userService?.tenureMonths || selectedApp.userService?.tenure} Months</span>
                    <span className="text-slate-400 dark:text-slate-500">Base Interest Rate:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.userService?.interestRate}% p.a.</span>
                    <span className="text-slate-400 dark:text-slate-500">Purpose of Loan:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 italic col-span-1 break-words">{selectedApp.userService?.purpose || "General Purpose"}</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Co-Applicant & Collateral */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-wider">Guarantor / Co-Applicant</h4>
                  {selectedApp.userService?.guarantor ? (
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Name: <span className="font-normal text-slate-600 dark:text-slate-400">{(selectedApp.userService.guarantor as any).name || "—"}</span></p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Relation: <span className="font-normal text-slate-600 dark:text-slate-400">{(selectedApp.userService.guarantor as any).relation || "—"}</span></p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Income: <span className="font-normal text-slate-600 dark:text-slate-400">{(selectedApp.userService.guarantor as any).income ? formatCurrency(parseFloat((selectedApp.userService.guarantor as any).income)) : "—"}</span></p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-550 italic">No co-applicant or guarantor provided.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-wider">Collateral / Security Details</h4>
                  {selectedApp.userService?.collateral ? (
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Existing Loan Ledger: <span className="font-normal text-slate-600 dark:text-slate-400">{(selectedApp.userService.collateral as any).details || "—"}</span></p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Value of Security: <span className="font-normal text-slate-600 dark:text-slate-400">{(selectedApp.userService.collateral as any).value ? formatCurrency(parseFloat((selectedApp.userService.collateral as any).value)) : "—"}</span></p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-550 italic">No existing loan balance or collateral provided.</p>
                  )}
                </div>
              </div>

              {/* Row 4: KYC Files checklist */}
              <div className="space-y-3 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                <h3 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary dark:text-blue-400" /> Submitted KYC Verification Documents
                </h3>
                {selectedApp.userService?.documents && Object.keys(selectedApp.userService.documents).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedApp.userService.documents).map(([key, val]: any) => (
                      <div key={key} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[10px] text-primary dark:text-blue-400 uppercase tracking-wider block">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="font-semibold text-slate-750 dark:text-slate-200 truncate max-w-[180px] block" title={val.name}>
                            {val.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold whitespace-nowrap">
                          {val.size ? `${(val.size / 1024).toFixed(1)} KB` : "Document Loaded"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-amber-50 dark:bg-amber-950/10 rounded-xl border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs flex flex-col gap-1 items-center">
                    <span>⚠️ No KYC file uploads found on this application record.</span>
                    <span className="text-amber-600/80">Please request manual document copies from the applicant.</span>
                  </div>
                )}
              </div>

            </div>
          )}

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedApp(null)}
              className="text-slate-500 dark:text-slate-400 font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850"
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

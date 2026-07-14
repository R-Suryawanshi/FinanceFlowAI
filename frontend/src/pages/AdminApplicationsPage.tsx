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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Applications Ledger</h1>
          <p className="text-muted-foreground">Manage and review incoming customer finance applications</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLiveApplicationsData} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Applications */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Total Applications</span>
              <div className="text-3xl font-bold text-gray-900">{liveApplications.length}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
        </Card>

        {/* Metric 2: Pending Reviews */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Pending Reviews</span>
              <div className="text-3xl font-bold text-amber-600">
                {liveApplications.filter(a => a.userService.status === "pending").length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-100">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </Card>

        {/* Metric 3: Approval Rate */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Approval Success Rate</span>
              <div className="text-3xl font-bold text-indigo-600">{approvalSuccessRate}%</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border">
        <h2 className="font-semibold text-lg text-slate-800">Review Board</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <select className="border p-2 rounded-md text-sm bg-white shrink-0" value={filter} onChange={(e) => setFilter(e.target.value)}>
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
              className="border pl-8 pr-3 py-2 w-full rounded-md text-sm bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      {(filter === "All" || filter === "Pending") && (
        <Card className="rounded-2xl border shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg text-slate-900">Pending Loan Applications</CardTitle>
            <CardDescription>Verify user documents and underwrite requested loans</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto max-h-[400px]">
            {filteredPending.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-sm font-medium">No pending applications found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    {["App #", "Customer", "Email", "Loan Name", "Requested", "Tenure", "Details", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPending.map((app) => (
                    <tr key={app.userService.id} className="hover:bg-slate-50/40 text-sm">
                      <td className="px-6 py-4 font-semibold text-primary">{app.userService.applicationNumber}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{app.user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{app.user.email}</td>
                      <td className="px-6 py-4 font-medium text-gray-700 capitalize">{app.serviceType.displayName || app.serviceType.name}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(Number(app.userService.amount))}</td>
                      <td className="px-6 py-4 text-gray-600">{app.userService.tenureMonths} Months</td>
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
      <Card className="rounded-2xl border shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg text-slate-900">Active & Closed Loans Ledger</CardTitle>
          <CardDescription>Repayment tracking and balances ledger for verified loans</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[400px]">
          {filteredProcessed.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm font-medium">No processed applications found matching search criteria.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  {["App #", "Customer", "Loan Name", "Approved Amount", "Monthly EMI", "Outstanding", "Paid", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredProcessed.map((app) => (
                  <tr key={app.userService.id} className="hover:bg-slate-50/40 text-sm">
                    <td className="px-6 py-4 font-semibold text-primary">{app.userService.applicationNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{app.user.name}</td>
                    <td className="px-6 py-4 font-medium text-gray-700 capitalize">{app.serviceType.displayName || app.serviceType.name}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(Number(app.userService.amount))}</td>
                    <td className="px-6 py-4 text-gray-600">{formatCurrency(Number(app.userService.emi || "0"))}</td>
                    <td className="px-6 py-4 font-semibold text-amber-600">{formatCurrency(Number(app.userService.outstandingAmount || "0"))}</td>
                    <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(Number(app.userService.totalPaidAmount || "0"))}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        app.userService.status === "completed" 
                          ? "bg-green-100 text-green-800 border-none hover:bg-green-100" 
                          : app.userService.status === "active" 
                          ? "bg-blue-100 text-blue-800 border-none hover:bg-blue-100" 
                          : "bg-red-100 text-red-800 border-none hover:bg-red-100"
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 border-none shadow-2xl rounded-2xl p-6">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
              <ShieldCheck className="h-6 w-6 text-green-600 animate-pulse" />
              Underwriting Sheet & KYC Audit
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 font-medium">
              Verify income proofs, documentation lists, and collateral metrics for Application <strong>{selectedApp?.userService?.applicationNumber}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 pt-4 text-sm">
              
              {/* Row 1: Profile & Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Applicant Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-400">Full Name:</span>
                    <span className="font-semibold text-gray-800">{selectedApp.user?.name}</span>
                    <span className="text-gray-400">Email:</span>
                    <span className="font-semibold text-gray-800">{selectedApp.user?.email}</span>
                    <span className="text-gray-400">Phone:</span>
                    <span className="font-semibold text-gray-800">{selectedApp.profile?.phoneNumber || "—"}</span>
                    <span className="text-gray-400">Date of Birth:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedApp.profile?.dateOfBirth 
                        ? new Date(selectedApp.profile.dateOfBirth).toLocaleDateString("en-IN") 
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Permanent Address
                  </h3>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-gray-800">{selectedApp.profile?.address || "—"}</p>
                    <p className="text-gray-600">
                      {[selectedApp.profile?.city, selectedApp.profile?.state, selectedApp.profile?.pincode]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: Financial Auditing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 border border-slate-100 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> Employment & Income
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-400">Occupation:</span>
                    <span className="font-semibold text-gray-800 capitalize">{selectedApp.profile?.occupation || "—"}</span>
                    <span className="text-gray-400">Company Name:</span>
                    <span className="font-semibold text-gray-800">{selectedApp.profile?.companyName || "—"}</span>
                    <span className="text-gray-400">Monthly Income:</span>
                    <span className="font-bold text-green-600">
                      {selectedApp.profile?.monthlyIncome 
                        ? formatCurrency(parseFloat(selectedApp.profile.monthlyIncome)) 
                        : "—"}
                    </span>
                    <span className="text-gray-400">Credit Score:</span>
                    <span className="font-bold text-primary">{selectedApp.profile?.creditScore || 720}</span>
                  </div>
                </div>

                <div className="space-y-3 border border-slate-100 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Loan Terms
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-400">Scheme Name:</span>
                    <span className="font-semibold text-gray-800 capitalize">{selectedApp.serviceType?.displayName || selectedApp.serviceType?.name}</span>
                    <span className="text-gray-400">Requested Principal:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(parseFloat(selectedApp.userService?.amount))}</span>
                    <span className="text-gray-400">Tenure Requested:</span>
                    <span className="font-semibold text-gray-800">{selectedApp.userService?.tenureMonths || selectedApp.userService?.tenure} Months</span>
                    <span className="text-gray-400">Base Interest Rate:</span>
                    <span className="font-semibold text-gray-800">{selectedApp.userService?.interestRate}% p.a.</span>
                    <span className="text-gray-400">Purpose of Loan:</span>
                    <span className="font-semibold text-gray-800 italic col-span-1 break-words">{selectedApp.userService?.purpose || "General Purpose"}</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Co-Applicant & Collateral */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider">Guarantor / Co-Applicant</h4>
                  {selectedApp.userService?.guarantor ? (
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-gray-800">Name: <span className="font-normal text-gray-600">{(selectedApp.userService.guarantor as any).name || "—"}</span></p>
                      <p className="font-semibold text-gray-800">Relation: <span className="font-normal text-gray-600">{(selectedApp.userService.guarantor as any).relation || "—"}</span></p>
                      <p className="font-semibold text-gray-800">Income: <span className="font-normal text-gray-600">{(selectedApp.userService.guarantor as any).income ? formatCurrency(parseFloat((selectedApp.userService.guarantor as any).income)) : "—"}</span></p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No co-applicant or guarantor provided.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider">Collateral / Security Details</h4>
                  {selectedApp.userService?.collateral ? (
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-gray-800">Existing Loan Ledger: <span className="font-normal text-gray-600">{(selectedApp.userService.collateral as any).details || "—"}</span></p>
                      <p className="font-semibold text-gray-800">Value of Security: <span className="font-normal text-gray-600">{(selectedApp.userService.collateral as any).value ? formatCurrency(parseFloat((selectedApp.userService.collateral as any).value)) : "—"}</span></p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No existing loan balance or collateral provided.</p>
                  )}
                </div>
              </div>

              {/* Row 4: KYC Files checklist */}
              <div className="space-y-3 border border-slate-100 p-4 rounded-xl">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Submitted KYC Verification Documents
                </h3>
                {selectedApp.userService?.documents && Object.keys(selectedApp.userService.documents).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedApp.userService.documents).map(([key, val]: any) => (
                      <div key={key} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[10px] text-primary uppercase tracking-wider block">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="font-semibold text-gray-700 truncate max-w-[180px] block" title={val.name}>
                            {val.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                          {val.size ? `${(val.size / 1024).toFixed(1)} KB` : "Document Loaded"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-xs flex flex-col gap-1 items-center">
                    <span>⚠️ No KYC file uploads found on this application record.</span>
                    <span className="text-amber-600/80">Please request manual document copies from the applicant.</span>
                  </div>
                )}
              </div>

            </div>
          )}

          <DialogFooter className="border-t border-gray-100 pt-4 mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedApp(null)}
              className="text-gray-500 font-medium"
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
              className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-md shadow-green-100"
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

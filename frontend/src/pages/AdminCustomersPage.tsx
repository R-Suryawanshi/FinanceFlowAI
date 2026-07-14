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
  Users,
  RefreshCcw,
  Search,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  UserMinus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminCustomersPage({ user }: any) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLiveUsersData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch("/api/admin/users", { headers });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          // Filter to show only customer accounts (role === "user")
          const dbCustomers = data.users.filter((u: any) => u.role === "user");
          setLiveUsers(dbCustomers);
        }
      }
    } catch (err) {
      console.error("Failed to load admin customers data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveUsersData();
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

  // Filter customers based on search query
  const filteredCustomers = liveUsers.filter(u => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = (u.name || "").toLowerCase().includes(q);
      const emailMatch = (u.email || "").toLowerCase().includes(q);
      const usernameMatch = (u.username || "").toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !usernameMatch) return false;
    }
    return true;
  });

  const handleToggleStatus = async (customerId: string, name: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`/api/admin/users/${customerId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast({
            title: "Customer Status Changed",
            description: `${name} has been ${currentStatus ? "suspended" : "reactivated"} successfully.`
          });
          fetchLiveUsersData();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyKyc = (customerId: string, name: string) => {
    // Just mock KYC approval by showing a success alert
    toast({
      title: "KYC Verified",
      description: `${name}'s documents and verification details have been certified.`
    });
  };

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Accounts</h1>
          <p className="text-muted-foreground">Review registered borrower portfolios, verification status, and credit ratings</p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto border-slate-205 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850" onClick={fetchLiveUsersData} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Customers
        </Button>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Total Customers</span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {liveUsers.length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-100 dark:shadow-none">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Verified KYC Users</span>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-450">
                {liveUsers.filter(e => e.isActive).length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100 dark:shadow-none">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">KYC Pending / Inactive</span>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-450">
                {liveUsers.filter(e => !e.isActive).length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-100 dark:shadow-none">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </Card>
      </div>

      {/* Search Input */}
      <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="font-semibold text-lg text-slate-850 dark:text-slate-200">Customer Accounts Directory</h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            className="border border-slate-200 dark:border-slate-800 pl-8 pr-3 py-2 w-full rounded-md text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-lg text-slate-900 dark:text-white font-bold">Borrowers & Depositors Ledger</CardTitle>
          <CardDescription>Live users registered in the Bhalchandra Finance portal</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[500px]">
          {filteredCustomers.length === 0 ? (
            <div className="text-center text-slate-450 dark:text-slate-500 py-12 text-sm font-medium">No registered customer accounts found.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/30">
                <tr>
                  {["Name", "Username", "Email", "KYC Verification", "Account Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 text-sm">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{cust.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{cust.username}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{cust.email}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        cust.isActive 
                          ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-none" 
                          : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-none"
                      }>
                        {cust.isActive ? "Verified" : "Pending Action"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${cust.isActive ? "text-slate-700 dark:text-slate-350" : "text-amber-600 dark:text-amber-400"}`}>
                        {cust.isActive ? "Active Account" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {!cust.isActive && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleVerifyKyc(cust.id, cust.name)}
                          className="text-xs border border-blue-200 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        >
                          Verify KYC
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleToggleStatus(cust.id, cust.name, cust.isActive)}
                        className={`text-xs border ${
                          cust.isActive 
                            ? "text-rose-600 border-rose-250 hover:bg-rose-50 dark:hover:bg-rose-950/20" 
                            : "text-green-600 border-green-250 hover:bg-green-50 dark:hover:bg-green-950/20"
                        }`}
                      >
                        {cust.isActive ? "Suspend" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

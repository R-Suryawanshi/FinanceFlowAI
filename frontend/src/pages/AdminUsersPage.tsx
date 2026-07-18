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
  ArrowLeft
} from "lucide-react";

interface AdminUsersPageProps {
  user: any;
  onBack?: () => void;
}

export function AdminUsersPage({ user, onBack }: AdminUsersPageProps) {
  const [search, setSearch] = useState("");
  const [liveStats, setLiveStats] = useState({ totalUsers: 0, activeLoans: 0, totalRevenue: 0 });
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLiveUsersData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/users", { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.stats) {
          setLiveStats(statsData.stats);
        }
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success && Array.isArray(usersData.users)) {
          setLiveUsers(usersData.users);
        }
      }
    } catch (err) {
      console.error("Failed to load admin users data", err);
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

  // Filter users based on search
  const filteredUsers = liveUsers.filter(u => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = (u.name || "").toLowerCase().includes(q);
      const emailMatch = (u.email || "").toLowerCase().includes(q);
      const usernameMatch = (u.username || "").toLowerCase().includes(q);
      const roleMatch = (u.role || "").toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !usernameMatch && !roleMatch) return false;
    }
    return true;
  });

  const verificationRate = liveUsers.length > 0 
    ? ((liveUsers.filter(u => u.isActive).length / liveUsers.length) * 100).toFixed(1) 
    : "100.0";

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
              className="h-10 w-10 rounded-lg border border-border/50 dark:border-border bg-card dark:bg-slate-900 text-blue-700 dark:text-blue-400 hover:bg-muted/30 dark:hover:bg-slate-955 transition-colors shadow-sm flex items-center justify-center shrink-0 mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="space-y-1 flex-1 text-left">
            <h1 className="text-3xl font-bold text-foreground dark:text-white">Registered Users</h1>
            <p className="text-muted-foreground">Monitor and manage registered user accounts in the Bhalchandra Finance portal</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto border-border dark:border-border hover:bg-muted dark:hover:bg-slate-850" onClick={fetchLiveUsersData} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Active Users */}
        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Total Active Users</span>
              <div className="text-3xl font-bold text-foreground dark:text-white">{liveStats.totalUsers}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-100 dark:shadow-none">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </Card>

        {/* Metric 2: New Signups Today */}
        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">New Signups (Today)</span>
              <div className="text-3xl font-bold text-foreground dark:text-slate-200">
                {liveUsers.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-100 dark:shadow-none">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
        </Card>

        {/* Metric 3: Verification Rate */}
        <Card className="rounded-2xl border border-border/80 dark:border-border/80 shadow-md dark:shadow-none bg-card dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">Verification Rate</span>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-450">{verificationRate}%</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100 dark:shadow-none">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </Card>
      </div>

      {/* Search Input */}
      <div className="bg-muted/30 dark:bg-slate-900/30 p-4 rounded-xl border border-border dark:border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="font-semibold text-lg text-foreground dark:text-slate-200">Users Accounts Directory</h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, username or role..."
            className="border border-border dark:border-border pl-8 pr-3 py-2 w-full rounded-md text-sm bg-card dark:bg-slate-900 text-foreground dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users List Table */}
      <Card className="rounded-2xl border border-border dark:border-border shadow-md overflow-hidden bg-card dark:bg-slate-900">
        <CardHeader className="bg-muted/30/50 dark:bg-slate-950/20 border-b border-border dark:border-border/80">
          <CardTitle className="text-lg text-foreground dark:text-white font-bold">Registered User Accounts</CardTitle>
          <CardDescription>Live users registered in the Bhalchandra Finance portal</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[500px]">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-slate-450 dark:text-muted-foreground py-12 text-sm font-medium">No registered user accounts found.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-muted/30 dark:bg-slate-950/30">
                <tr>
                  {["Name", "Username", "Email", "Role", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-card dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30/40 dark:hover:bg-slate-800/40 text-sm">
                    <td className="px-6 py-4 font-semibold text-foreground dark:text-slate-200">{u.name}</td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">{u.username}</td>
                    <td className="px-6 py-4 text-muted-foreground dark:text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4 font-semibold capitalize text-primary dark:text-blue-400">{u.role}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        u.isActive 
                          ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-none hover:bg-green-100" 
                          : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-none hover:bg-red-100"
                      }>
                        {u.isActive ? "Active" : "Deactivated"}
                      </Badge>
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

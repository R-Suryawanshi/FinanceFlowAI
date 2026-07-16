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
  Briefcase,
  UserCheck,
  UserX,
  Plus,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminEmployeesPageProps {
  user: any;
  onPageChange: (page: string) => void;
  onBack?: () => void;
}

export function AdminEmployeesPage({ user, onPageChange, onBack }: AdminEmployeesPageProps) {
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
          // Keep all staff users from the live backend (whose role is not "user")
          const dbEmployees = data.users.filter((u: any) => u.role !== "user");
          setLiveUsers(dbEmployees);
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

  // Reference live database staff/admin accounts
  const allEmployees = liveUsers;

  // Filter based on search query
  const filteredEmployees = allEmployees.filter(u => {
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

  const handleToggleStatus = async (employeeId: string, name: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`/api/admin/users/${employeeId}/status`, {
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
            title: "Employee Status Changed",
            description: `${name} status updated on the database.`
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
              className="h-10 w-10 rounded-lg border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-955 transition-colors shadow-sm flex items-center justify-center shrink-0 mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="space-y-1 flex-1 text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Employee Management</h1>
            <p className="text-muted-foreground">Manage administrative access, underwriters, and loan officer accounts</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850" onClick={fetchLiveUsersData} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Directory
          </Button>
          <Button size="sm" className="flex-1 sm:flex-initial bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5" onClick={() => onPageChange && onPageChange("admin-add-employee")}>
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        </div>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Active Staff</span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {allEmployees.filter(e => e.isActive).length}
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
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Underwriter Officers</span>
              <div className="text-3xl font-bold text-slate-855 dark:text-slate-200">
                {allEmployees.filter(e => e.role === "underwriter").length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Administrative Admins</span>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-450">
                {allEmployees.filter(e => e.role === "admin").length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100 dark:shadow-none">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </Card>
      </div>

      {/* Search Input */}
      <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="font-semibold text-lg text-slate-850 dark:text-slate-200">Staff Accounts Directory</h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, username or role..."
            className="border border-slate-200 dark:border-slate-800 pl-8 pr-3 py-2 w-full rounded-md text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Employees Table */}
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-lg text-slate-900 dark:text-white font-bold">Registered Staff Accounts</CardTitle>
          <CardDescription>Review employee credentials, assigned system roles, and status</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[500px]">
          {filteredEmployees.length === 0 ? (
            <div className="text-center text-slate-455 dark:text-slate-500 py-12 text-sm font-medium">No employee records match the search.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-955/30">
                <tr>
                  {["Name", "Username", "Assigned Role", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 text-sm">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>
                        <p className="leading-tight">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1">{emp.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{emp.username}</td>
                    <td className="px-6 py-4 capitalize font-semibold text-primary dark:text-blue-400">{emp.role.replace('-', ' ')}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        emp.isActive 
                          ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-none" 
                          : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-none"
                      }>
                        {emp.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(emp.id, emp.name, emp.isActive)}
                        className={`text-xs border ${
                          emp.isActive 
                            ? "text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20" 
                            : "text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20"
                        }`}
                      >
                        {emp.isActive ? "Suspend" : "Activate"}
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

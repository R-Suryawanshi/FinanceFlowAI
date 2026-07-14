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
  DollarSign,
  TrendingUp,
  RefreshCcw,
  Search,
  Calendar,
} from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export function AdminPaymentsPage({ user }: any) {
  const [search, setSearch] = useState("");
  const [liveStats, setLiveStats] = useState({ totalUsers: 0, activeLoans: 0, totalRevenue: 0 });
  const [livePayments, setLivePayments] = useState<any[]>([]);
  const [liveApplications, setLiveApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 12)), // Default 1 year back
    end: new Date()
  });

  const fetchLivePaymentsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, paymentsRes, servicesRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/payments", { headers }),
        fetch("/api/admin/user-services", { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.stats) {
          setLiveStats(statsData.stats);
        }
      }
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        if (paymentsData.success && Array.isArray(paymentsData.payments)) {
          setLivePayments(paymentsData.payments);
        }
      }
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        if (servicesData.success && Array.isArray(servicesData.services)) {
          setLiveApplications(servicesData.services);
        }
      }
    } catch (err) {
      console.error("Failed to load admin payments data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePaymentsData();
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

  // Filter payments by search query and date range
  const filteredPayments = livePayments.filter(p => {
    const pDate = new Date(p.payment.paymentDate);
    const dateMatch = pDate >= dateRange.start && pDate <= dateRange.end;
    if (!dateMatch) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const txnMatch = (p.payment.transactionId || p.payment.paymentReference || "")
        .toLowerCase()
        .includes(q);
      const nameMatch = (p.user?.name || "").toLowerCase().includes(q);
      const methodMatch = (p.payment.paymentMethod || "").toLowerCase().includes(q);
      const schemeMatch = (p.serviceType?.displayName || p.serviceType?.name || "").toLowerCase().includes(q);
      if (!txnMatch && !nameMatch && !methodMatch && !schemeMatch) return false;
    }
    return true;
  });

  const totalOutstanding = liveApplications
    .filter(a => a.userService.status === "active" && a.serviceType.name !== "fixed-deposit")
    .reduce((sum, a) => sum + parseFloat(a.userService.outstandingAmount || "0"), 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Repayments Ledger</h1>
          <p className="text-muted-foreground">Track historical and incoming customer EMI payment transactions</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLivePaymentsData} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Revenue */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Total Revenue</span>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(liveStats.totalRevenue)}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-100">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />
        </Card>

        {/* Metric 2: Outstanding Portfolio */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Outstanding Portfolio</span>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </Card>

        {/* Metric 3: Recovery Rate */}
        <Card className="rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-50/50 bg-white relative overflow-hidden p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Collection Recovery Rate</span>
              <div className="text-3xl font-bold text-cyan-600">86.8%</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </Card>
      </div>

      {/* Date Range Selection & Search */}
      <div className="bg-slate-50 p-4 rounded-xl border flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-semibold text-lg text-slate-800">Transactions List</h2>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="bg-white text-gray-700 flex items-center gap-2 border"
            >
              <Calendar className="h-4 w-4" />
              {dateRange.start.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - {dateRange.end.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
            </Button>
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transaction, customer or method..."
                className="border pl-8 pr-3 py-2 w-full rounded-md text-sm bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {showDatePicker && (
          <div className="border bg-white p-3 rounded-lg shadow-inner self-start flex flex-col gap-2 z-10">
            <DateRange
              ranges={[{ startDate: dateRange.start, endDate: dateRange.end, key: 'selection' }]}
              onChange={(item: any) => setDateRange({ start: item.selection.startDate, end: item.selection.endDate })}
              maxDate={new Date()}
            />
            <Button size="sm" className="self-end" onClick={() => setShowDatePicker(false)}>
              Apply Range
            </Button>
          </div>
        )}
      </div>

      {/* Payments Ledger Table */}
      <Card className="rounded-2xl border shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg text-slate-900 font-bold">Repayment Transactions</CardTitle>
          <CardDescription>Real-time log of customer EMI payments received</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[500px]">
          {filteredPayments.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm font-medium">No payment transactions found in selected range.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-55/30">
                <tr>
                  {["TXN ID", "Customer", "Loan Name", "Paid Amount", "Method", "Date", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredPayments.map((p) => (
                  <tr key={p.payment.id} className="hover:bg-slate-50/40 text-sm">
                    <td className="px-6 py-4 font-semibold text-primary">{p.payment.transactionId || p.payment.paymentReference}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{p.user.name}</td>
                    <td className="px-6 py-4 text-gray-700 capitalize">{p.serviceType.displayName || p.serviceType.name}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(Number(p.payment.amount))}</td>
                    <td className="px-6 py-4 font-semibold text-gray-600 uppercase">{p.payment.paymentMethod}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(p.payment.paymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        p.payment.status === "success" 
                          ? "bg-green-100 text-green-800 border-none hover:bg-green-100" 
                          : "bg-red-100 text-red-800 border-none hover:bg-red-100"
                      }>
                        {p.payment.status}
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

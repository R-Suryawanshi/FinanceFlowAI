"use client";
import "react-date-range/dist/styles.css"; // main style file
import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
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
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export function AdminDashboard({ user }: any) {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
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

  // ✅ Load Excel File
  useEffect(() => {
    async function loadExcel() {
      try {
        const res = await fetch("/finance_data.xlsx");
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setData(json as any[]);
        logActivity("🟢 Dashboard loaded and Excel data fetched.");
      } catch (err) {
        console.error("Failed to load Excel data", err);
        logActivity("❌ Failed to load Excel data.");
      }
    }
    loadExcel();
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // ✅ Dynamic Analytics & Graph Updates
  useEffect(() => {
    if (!data.length) return;

    const filtered =
      filter === "All"
        ? data
        : data.filter(
            (d) => d.Status?.toLowerCase() === filter.toLowerCase()
          );

    // Group Revenue by Month
    const grouped: Record<string, number> = {};
    filtered.forEach((d: any) => {
      const month =
        d.Month ||
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][
          Math.floor(Math.random() * 6)
        ];
      grouped[month] = (grouped[month] || 0) + (Number(d.Amount) || 0);
    });
    const monthly = Object.keys(grouped).map((m) => ({
      month: m,
      amount: grouped[m],
    }));
    setMonthlyRevenue(monthly);

    // Loan Type Distribution
    const loanDist = Object.entries(
      filtered.reduce((acc: any, d: any) => {
        acc[d.Service] = (acc[d.Service] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({
      name,
      value,
      color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
    }));
    setLoanTypes(loanDist);
  }, [data, filter]);

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
  if (!data.length || !monthlyRevenue.length) return;

  const totalRevenue = data.reduce((sum, d) => sum + (Number(d.Amount) || 0), 0);
  const lastMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.amount || 0;
  const prevMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2]?.amount || 0;
  const revenueGrowth = prevMonthRevenue
    ? (((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(2)
    : "0";

  const topServices = Object.entries(
    data.reduce((acc: any, d: any) => {
      acc[d.Service] = (acc[d.Service] || 0) + (Number(d.Amount) || 0);
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, _]) => name);

  const pendingLoans = data.filter(d => d.Status === "Pending").length;

  // ✅ Predicted revenue using linear regression
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

    // Predict next 3 months
    predictedRevenue = Math.round(
      intercept + slope * (x.length) +
      intercept + slope * (x.length + 1) +
      intercept + slope * (x.length + 2)
    );
  } else {
    // fallback if not enough data
    predictedRevenue = Math.round(totalRevenue * 1.1);
  }

  setAiInsights([
    `📈 Revenue grew ${revenueGrowth}% last month.`,
    `⚠️ Pending loans: ${pendingLoans}`,
    `💰 Top 3 services contributing to revenue: ${topServices.join(", ")}`,
    `🧮 Predicted total revenue next quarter: ${formatCurrency(predictedRevenue)}`
  ]);
}, [data, monthlyRevenue]);

  // ✅ Daily Revenue (Advanced Analytics)
  useEffect(() => {
    const filtered = data.filter(d => {
      const dDate = d.Date ? new Date(d.Date) : new Date();
      return dDate >= dateRange.start && dDate <= dateRange.end;
    });

    const grouped: Record<string, number> = {};
    filtered.forEach(d => {
      const dateStr = new Date(d.Date).toLocaleDateString();
      grouped[dateStr] = (grouped[dateStr] || 0) + (Number(d.Amount) || 0);
    });

    setDailyRevenue(Object.entries(grouped).map(([date, amount]) => ({ date, amount })));
  }, [data, dateRange]);

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
      ["Name", "Email", "Service", "Status", "Amount"],
      ...data.map((s: any) => [
        s.Name,
        s.Email,
        s.Service,
        s.Status,
        s.Amount,
      ]),
    ];
    const blob = new Blob([csvRows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "finance_data.csv";
    a.click();
    logActivity(`📤 CSV exported successfully`);
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

    // Clone element off-screen
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.top = "-9999px";
    clone.style.left = "0";
    clone.style.width = element.offsetWidth + "px";
    document.body.appendChild(clone);

    // Wait a bit to ensure charts and styles render
    await new Promise((res) => setTimeout(res, 500));

    // Capture canvas
    const canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    document.body.removeChild(clone);

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

  // ✅ Filtered Data
  const filteredData = data.filter((d: any) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      d.Name?.toLowerCase().includes(searchLower) ||
      d.Email?.toLowerCase().includes(searchLower) ||
      d.Service?.toLowerCase().includes(searchLower) ||
      d.Status?.toLowerCase().includes(searchLower);
    const matchesFilter = filter === "All" || d.Status?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // ✅ Metrics
  const totalUsers = filteredData.length;
  const activeLoans = filteredData.filter((d) => d.Status === "Approved").length;
  const totalRevenue = filteredData.reduce((sum, d) => sum + (Number(d.Amount) || 0), 0);

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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8" ref={dashboardRef}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Real-time Finance Insights & AI Forecast</p>
        </div>
        <div className="flex gap-2">
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

      {/* Filter & Search */}
      <div className="flex justify-end gap-3">
        <select className="border p-2 rounded-md text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>Approved</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Search user or service..."
          className="border p-2 rounded-md text-sm"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Users", icon: Users, value: totalUsers },
          { title: "Active Loans", icon: TrendingUp, value: activeLoans },
          { title: "Total Revenue", icon: DollarSign, value: formatCurrency(totalRevenue) },
          { title: "Calculations Today", icon: Calculator, value: "—" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex justify-between">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABS */}
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="forecast">AI Forecast</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="users">User Data</TabsTrigger>
        </TabsList>

        {/* ANALYTICS */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue */}
            <Card>
              <CardHeader><CardTitle>Monthly Revenue ({filter})</CardTitle></CardHeader>
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
              <CardHeader><CardTitle>Loan Type Distribution ({filter})</CardTitle></CardHeader>
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

        {/* USER DATA TABLE */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Finance Data</CardTitle>
              <CardDescription>Showing {filteredData.length} records</CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto max-h-[500px]">
              {filteredData.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No results found.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {["Name", "Email", "Service", "Status", "Amount"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredData.slice(0, 100).map((d: any, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3 font-medium text-gray-800">{d.Name}</td>
                        <td className="px-6 py-3 text-gray-600">{d.Email}</td>
                        <td className="px-6 py-3">{d.Service}</td>
                        <td className="px-6 py-3">
                          <Badge
                            variant={
                              d.Status === "Approved"
                                ? "success"
                                : d.Status === "Pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {d.Status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3">{formatCurrency(Number(d.Amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
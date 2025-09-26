import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Activity,
  UserCheck,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Todo: remove mock data when implementing real backend
const mockData = {
  stats: {
    totalUsers: 10247,
    activeLoans: 1523,
    totalRevenue: 45670000,
    calculationsToday: 342,
  },
  recentActivity: [
    { id: 1, user: "Rajesh Kumar", action: "Applied for gold loan", amount: "₹2,50,000", time: "2 hours ago" },
    { id: 2, user: "Priya Sharma", action: "EMI calculation", amount: "₹15,00,000", time: "3 hours ago" },
    { id: 3, user: "Amit Patel", action: "Loan approved", amount: "₹5,00,000", time: "5 hours ago" },
    { id: 4, user: "Sunita Mehta", action: "Gold loan inquiry", amount: "₹1,75,000", time: "1 day ago" },
  ],
  chartData: {
    revenue: [
      { month: 'Jan', amount: 3200000 },
      { month: 'Feb', amount: 3800000 },
      { month: 'Mar', amount: 4200000 },
      { month: 'Apr', amount: 3900000 },
      { month: 'May', amount: 4500000 },
      { month: 'Jun', amount: 4567000 },
    ],
    loanTypes: [
      { name: 'Personal Loans', value: 45, color: 'hsl(var(--chart-1))' },
      { name: 'Gold Loans', value: 30, color: 'hsl(var(--chart-2))' },
      { name: 'Home Loans', value: 20, color: 'hsl(var(--chart-3))' },
      { name: 'Car Loans', value: 5, color: 'hsl(var(--chart-4))' },
    ],
    dailyCalculations: [
      { day: 'Mon', emi: 45, gold: 23 },
      { day: 'Tue', emi: 52, gold: 31 },
      { day: 'Wed', emi: 38, gold: 19 },
      { day: 'Thu', emi: 61, gold: 28 },
      { day: 'Fri', emi: 49, gold: 35 },
      { day: 'Sat', emi: 67, gold: 42 },
      { day: 'Sun', emi: 34, gold: 25 },
    ],
  },
};

interface AdminDashboardProps {
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    createdAt: string;
  };
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this dashboard.</p>
        </div>
      </div>
    );
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor your financial services performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-data">
            Export Data
          </Button>
          <Button data-testid="button-generate-report">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">
              {mockData.stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-loans">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-loans">
              {mockData.stats.activeLoans.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              {formatCurrency(mockData.stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary">+15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-calculations-today">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculations Today</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-calculations-today">
              {mockData.stats.calculationsToday}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary">+23%</span> from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card data-testid="card-revenue-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Revenue
            </CardTitle>
            <CardDescription>Revenue trend over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loan Types Distribution */}
        <Card data-testid="card-loan-distribution">
          <CardHeader>
            <CardTitle>Loan Types Distribution</CardTitle>
            <CardDescription>Breakdown of loan applications by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.chartData.loanTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {mockData.chartData.loanTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Calculator Usage */}
        <Card data-testid="card-calculator-usage">
          <CardHeader>
            <CardTitle>Daily Calculator Usage</CardTitle>
            <CardDescription>EMI and Gold loan calculator usage this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.chartData.dailyCalculations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="emi" fill="hsl(var(--chart-1))" name="EMI Calculator" />
                <Bar dataKey="gold" fill="hsl(var(--chart-2))" name="Gold Loan Calculator" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest user actions and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {activity.action.includes('loan') ? (
                        <DollarSign className="h-4 w-4 text-primary" />
                      ) : (
                        <Calculator className="h-4 w-4 text-secondary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm" data-testid={`activity-user-${activity.id}`}>
                        {activity.user}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm" data-testid={`activity-amount-${activity.id}`}>
                      {activity.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-activity">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="flex flex-col h-20 gap-2" data-testid="button-approve-loans">
              <UserCheck className="h-5 w-5" />
              <span className="text-xs">Approve Loans</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 gap-2" data-testid="button-manage-users">
              <Users className="h-5 w-5" />
              <span className="text-xs">Manage Users</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 gap-2" data-testid="button-update-rates">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Update Rates</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 gap-2" data-testid="button-view-reports">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">View Reports</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 gap-2" data-testid="button-system-alerts">
              <AlertCircle className="h-5 w-5" />
              <span className="text-xs">System Alerts</span>
              <Badge variant="destructive" className="text-xs">3</Badge>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 gap-2" data-testid="button-calculator-config">
              <Calculator className="h-5 w-5" />
              <span className="text-xs">Calculator Config</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
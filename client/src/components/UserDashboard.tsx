import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Coins,
  CreditCard,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Todo: remove mock data when implementing real backend
const mockUserData = {
  user: {
    name: "Rajesh Kumar",
    accountNumber: "BF2024001234",
    joinDate: "January 2024",
  },
  stats: {
    activeLoan: 250000,
    totalCalculations: 15,
    creditScore: 750,
    savingsGoal: 1000000,
    currentSavings: 650000,
  },
  recentActivity: [
    { id: 1, type: "emi", description: "EMI Calculation - Home Loan", amount: "₹25,000", date: "2 days ago", status: "completed" },
    { id: 2, type: "gold", description: "Gold Loan Quote Request", amount: "₹2,50,000", date: "1 week ago", status: "pending" },
    { id: 3, type: "emi", description: "Car Loan EMI Calculation", amount: "₹18,500", date: "2 weeks ago", status: "completed" },
    { id: 4, type: "inquiry", description: "Personal Loan Inquiry", amount: "₹5,00,000", date: "1 month ago", status: "completed" },
  ],
  loanHistory: [
    { month: 'Jan', amount: 250000 },
    { month: 'Feb', amount: 240000 },
    { month: 'Mar', amount: 230000 },
    { month: 'Apr', amount: 220000 },
    { month: 'May', amount: 210000 },
    { month: 'Jun', amount: 200000 },
  ],
  quickActions: [
    { id: 'emi-calc', title: 'EMI Calculator', icon: Calculator, description: 'Calculate loan EMIs' },
    { id: 'gold-calc', title: 'Gold Loan Calculator', icon: Coins, description: 'Check gold loan eligibility' },
    { id: 'loan-apply', title: 'Apply for Loan', icon: FileText, description: 'Start loan application' },
    { id: 'payment-history', title: 'Payment History', icon: Clock, description: 'View past payments' },
  ]
};

interface UserDashboardProps {
  onNavigateToCalculator: (type: 'emi' | 'gold') => void;
}

export function UserDashboard({ onNavigateToCalculator }: UserDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>;
      default:
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const savingsProgress = (mockUserData.stats.currentSavings / mockUserData.stats.savingsGoal) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-welcome">
              Welcome back, {mockUserData.user.name}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Account: {mockUserData.user.accountNumber} • Member since {mockUserData.user.joinDate}
            </p>
          </div>
          <Badge variant="outline" className="bg-background/50">
            Credit Score: {mockUserData.stats.creditScore}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-active-loan">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-loan">
              {formatCurrency(mockUserData.stats.activeLoan)}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding amount
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-calculations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculations</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-calculations">
              {mockUserData.stats.totalCalculations}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-credit-score">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary" data-testid="text-credit-score">
              {mockUserData.stats.creditScore}
            </div>
            <p className="text-xs text-muted-foreground">
              Excellent rating
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-savings-goal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-savings-progress">
              {savingsProgress.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(mockUserData.stats.currentSavings)} of {formatCurrency(mockUserData.stats.savingsGoal)}
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used financial tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockUserData.quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-20 flex flex-col gap-2 hover-elevate"
                    onClick={() => {
                      if (action.id === 'emi-calc') {
                        onNavigateToCalculator('emi');
                      } else if (action.id === 'gold-calc') {
                        onNavigateToCalculator('gold');
                      }
                      console.log('Quick action clicked:', action.title);
                    }}
                    data-testid={`button-${action.id}`}
                  >
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Loan Repayment Progress */}
        <Card data-testid="card-loan-progress">
          <CardHeader>
            <CardTitle>Loan Repayment Progress</CardTitle>
            <CardDescription>Your outstanding loan amount over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockUserData.loanHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Outstanding']}
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

        {/* Recent Activity */}
        <Card data-testid="card-user-activity" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest financial activities and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUserData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {activity.type === 'emi' ? (
                        <Calculator className="h-4 w-4 text-primary" />
                      ) : activity.type === 'gold' ? (
                        <Coins className="h-4 w-4 text-secondary" />
                      ) : (
                        <FileText className="h-4 w-4 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm" data-testid={`activity-description-${activity.id}`}>
                        {activity.description}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {getStatusIcon(activity.status)}
                        {activity.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm" data-testid={`activity-amount-${activity.id}`}>
                        {activity.amount}
                      </p>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-user-activity">
              View Complete History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Tips */}
      <Card data-testid="card-financial-tips">
        <CardHeader>
          <CardTitle>Financial Health Tips</CardTitle>
          <CardDescription>Personalized recommendations based on your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-secondary mb-2" />
              <h4 className="font-medium mb-1">Great Credit Score!</h4>
              <p className="text-sm text-muted-foreground">
                Your credit score of {mockUserData.stats.creditScore} qualifies you for premium loan rates.
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-1">Savings on Track</h4>
              <p className="text-sm text-muted-foreground">
                You're {savingsProgress.toFixed(0)}% towards your savings goal. Keep it up!
              </p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
              <Calculator className="h-6 w-6 text-accent mb-2" />
              <h4 className="font-medium mb-1">Consider Refinancing</h4>
              <p className="text-sm text-muted-foreground">
                Current market rates might offer savings on your existing loan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
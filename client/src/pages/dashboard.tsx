import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import FinancialHealthScore from "@/components/financial-health-score";
import MetricCard from "@/components/metric-card";
import SpendingChart from "@/components/spending-chart";
import NetWorthChart from "@/components/net-worth-chart";
import RecentTransactions from "@/components/recent-transactions";
import InvestmentRecommendations from "@/components/investment-recommendations";
import FinancialInsights from "@/components/financial-insights";
import FinancialGoals from "@/components/financial-goals";
import SmartAlerts from "@/components/smart-alerts";
import OnboardingFlow from "@/components/onboarding-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, CreditCard, PiggyBank, DollarSign, Compass, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: dashboardData, isLoading: dashboardLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Session Expired",
      description: "Please log in again to continue.",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-8">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-80 w-full rounded-xl" />
              <Skeleton className="h-80 w-full rounded-xl" />
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  // Show onboarding for new users
  if (!dashboardData?.accounts?.length && !dashboardData?.goals?.length) {
    return <OnboardingFlow />;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No dashboard data available.</p>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const { financialHealth, recentTransactions, goals, investmentRecommendations } = dashboardData;
  
  const getUserName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Compass className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Your Financial Journey</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Welcome back, {getUserName()}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Here's how your financial story is unfolding. Every decision you make shapes the narrative of your future.
            </p>
          </div>

          <FinancialHealthScore data={financialHealth} />
        </div>

        {/* Key Insights */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Key Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Net Worth"
              value={`$${parseFloat(financialHealth?.netWorth || "0").toLocaleString()}`}
              change="+$2,340 (1.9%)"
              changeType="positive"
              icon={TrendingUp}
              iconColor="text-success"
              iconBg="bg-success/10"
            />
            <MetricCard
              title="Monthly Spending"
              value={`$${parseFloat(financialHealth?.monthlyExpenses || "0").toLocaleString()}`}
              change="+$156 (3.8%)"
              changeType="negative"
              icon={CreditCard}
              iconColor="text-accent"
              iconBg="bg-accent/10"
            />
            <MetricCard
              title="Savings Rate"
              value={`${parseFloat(financialHealth?.savingsRate || "0").toFixed(0)}%`}
              change="+2% this month"
              changeType="positive"
              icon={PiggyBank}
              iconColor="text-primary"
              iconBg="bg-primary/10"
            />
            <MetricCard
              title="Investment Return"
              value="+8.4%"
              change="YTD Performance"
              changeType="positive"
              icon={DollarSign}
              iconColor="text-secondary"
              iconBg="bg-secondary/10"
            />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">Your Financial Patterns</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SpendingChart />
            <NetWorthChart />
          </div>
        </div>

        {/* Activity & Recommendations */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity & Recommendations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentTransactions transactions={recentTransactions} />
            <InvestmentRecommendations recommendations={investmentRecommendations} />
          </div>
        </div>

        {/* Insights & Goals */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Progress & Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SmartAlerts />
            <FinancialInsights />
            <FinancialGoals goals={goals} />
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

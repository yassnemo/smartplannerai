import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import SpendingChart from "@/components/spending-chart";
import NetWorthChart from "@/components/net-worth-chart";
import AdvancedAnalytics from "@/components/advanced-analytics";
import { MXConnect } from "@/components/mx-connect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { BarChart3, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState("3months");

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

  const { data: spendingData, isLoading: spendingLoading } = useQuery({
    queryKey: ["/api/spending-analytics", timeRange === "1month" ? "month" : "quarter"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: netWorthData, isLoading: netWorthLoading } = useQuery({
    queryKey: ["/api/net-worth-history", timeRange === "1month" ? "1" : timeRange === "3months" ? "3" : "6"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-8">
            <Skeleton className="h-40 w-full rounded-2xl" />
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

  const totalSpending = spendingData?.totalSpending || 0;
  const spendingChange = 12.5; // Mock data - in production this would be calculated
  const averageDaily = totalSpending / 30;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-sm font-medium text-secondary uppercase tracking-wider">Financial Analytics</span>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Advanced Analytics
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                AI-powered insights into your financial health, spending patterns, and investment opportunities.
              </p>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <MXConnect onSuccess={() => {
            toast({
              title: "Success!",
              description: "Your account has been connected. Analyzing your data...",
            });
          }} />

          <Separator />

          <AdvancedAnalytics />

          <Separator />

          <div>
            <h2 className="text-2xl font-bold mb-6">Spending Breakdown</h2>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center text-sm text-success">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {spendingChange}%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Total Spending
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ${totalSpending.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Daily Average
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ${averageDaily.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Categories Tracked
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {spendingData?.categories?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SpendingChart />
          <NetWorthChart />
        </div>

        {/* Advanced Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Advanced Analytics</h2>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent>
              <AdvancedAnalytics />
            </CardContent>
          </Card>
        </div>

        {/* MX Connect Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Connect with MX</h2>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent>
              <MXConnect />
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Category Breakdown</h2>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {spendingLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {spendingData?.categories?.map((category: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}></div>
                        <span className="font-medium text-foreground">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">${category.amount.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No spending data available for this period</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
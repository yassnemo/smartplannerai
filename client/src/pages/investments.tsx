import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import InvestmentRecommendations from "@/components/investment-recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, PieChart, DollarSign, Target, AlertCircle, CheckCircle } from "lucide-react";

export default function Investments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/investment-recommendations"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const currentPortfolioValue = 67350; // Mock current portfolio value
  const targetAllocation = 100;
  const currentAllocation = 85;
  const riskScore = dashboardData?.financialHealth?.healthScore || 75;

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "Conservative", color: "text-success bg-success/10" };
    if (score >= 60) return { level: "Moderate", color: "text-primary bg-primary/10" };
    return { level: "Aggressive", color: "text-warning bg-warning/10" };
  };

  const riskInfo = getRiskLevel(riskScore);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <span className="text-sm font-medium text-accent uppercase tracking-wider">Investment Portfolio</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Investment Strategy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Personalized investment recommendations based on your financial profile, risk tolerance, and long-term goals.
            </p>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div className="flex items-center text-sm text-success">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  8.4%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Portfolio Value
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ${currentPortfolioValue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  +$4,230 this year
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <Badge className={riskInfo.color}>
                  {riskInfo.level}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Risk Profile
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {riskScore}/100
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on financial health
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-warning" />
                </div>
                <div className="flex items-center text-sm text-warning">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  15% left
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Allocation Progress
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {currentAllocation}%
                </p>
                <Progress value={currentAllocation} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Holdings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Current Holdings</h2>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Your Investment Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">VTI</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Vanguard Total Stock Market ETF</h4>
                      <p className="text-sm text-muted-foreground">40% allocation • 245 shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">$26,940</p>
                    <div className="flex items-center text-sm text-success">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.3%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-secondary">AGG</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">iShares Core U.S. Aggregate Bond ETF</h4>
                      <p className="text-sm text-muted-foreground">30% allocation • 195 shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">$20,205</p>
                    <div className="flex items-center text-sm text-success">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +3.8%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-accent">VEA</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Vanguard FTSE Developed Markets ETF</h4>
                      <p className="text-sm text-muted-foreground">15% allocation • 280 shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">$13,470</p>
                    <div className="flex items-center text-sm text-success">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +7.2%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Recommendations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">AI-Powered Recommendations</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <CheckCircle className="h-3 w-3 mr-1" />
              Updated Today
            </Badge>
          </div>
          <InvestmentRecommendations recommendations={recommendations} />
        </div>

        {/* Investment Strategy */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Your Investment Strategy</h2>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Strategy Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-foreground">Diversified Growth</h4>
                        <p className="text-sm text-muted-foreground">
                          60% stocks, 30% bonds, 10% international for balanced growth
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-foreground">Low-Cost ETFs</h4>
                        <p className="text-sm text-muted-foreground">
                          Focus on broad market index funds with expense ratios under 0.1%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-foreground">Dollar-Cost Averaging</h4>
                        <p className="text-sm text-muted-foreground">
                          Regular monthly investments to reduce timing risk
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Next Steps</h3>
                  <div className="space-y-3">
                    <Button className="w-full justify-start bg-primary hover:bg-primary/90">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Rebalance Portfolio
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Set Investment Goals
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <PieChart className="h-4 w-4 mr-2" />
                      Review Risk Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
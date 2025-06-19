import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Shield, 
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface HealthScoreBreakdown {
  totalScore: number;
  savingsScore: number;
  debtScore: number;
  emergencyFundScore: number;
  spendingScore: number;
  creditScore: number;
  recommendations: string[];
}

interface InvestmentRecommendation {
  symbol: string;
  name: string;
  type: string;
  allocation: number;
  riskLevel: string;
  expectedReturn: string;
  description: string;
  reasonCode: string;
}

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState('health');

  // Fetch detailed financial health
  const { data: healthData, isLoading: isLoadingHealth } = useQuery<HealthScoreBreakdown>({
    queryKey: ['/api/financial-health/detailed'],
    retry: false,
  });

  // Fetch investment recommendations
  const { data: investments, isLoading: isLoadingInvestments } = useQuery<InvestmentRecommendation[]>({
    queryKey: ['/api/investment-recommendations/generate'],
    retry: false,
  });

  // Fetch rebalancing recommendations
  const { data: rebalanceData, isLoading: isLoadingRebalance } = useQuery<{actions: string[]}>({
    queryKey: ['/api/investment-recommendations/rebalance'],
    retry: false,
  });

  // Fetch market insights
  const { data: marketData, isLoading: isLoadingMarket } = useQuery<{insights: string[]}>({
    queryKey: ['/api/insights/market'],
    retry: false,
  });

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoadingHealth && isLoadingInvestments) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          AI-Powered Insights
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Health Score
          </TabsTrigger>
          <TabsTrigger value="investments" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Investments
          </TabsTrigger>
          <TabsTrigger value="rebalance" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Rebalancing
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Market
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          {healthData ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Financial Health Score
                      <Badge 
                        variant={getScoreBadgeVariant(healthData.totalScore, 100)}
                        className="text-lg px-3 py-1"
                      >
                        {healthData.totalScore}/100
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Comprehensive analysis of your financial wellness
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Savings Rate</span>
                        <span className={`text-sm font-bold ${getScoreColor(healthData.savingsScore, 25)}`}>
                          {healthData.savingsScore}/25
                        </span>
                      </div>
                      <Progress value={(healthData.savingsScore / 25) * 100} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Debt Management</span>
                        <span className={`text-sm font-bold ${getScoreColor(healthData.debtScore, 25)}`}>
                          {healthData.debtScore}/25
                        </span>
                      </div>
                      <Progress value={(healthData.debtScore / 25) * 100} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Emergency Fund</span>
                        <span className={`text-sm font-bold ${getScoreColor(healthData.emergencyFundScore, 25)}`}>
                          {healthData.emergencyFundScore}/25
                        </span>
                      </div>
                      <Progress value={(healthData.emergencyFundScore / 25) * 100} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Spending Control</span>
                        <span className={`text-sm font-bold ${getScoreColor(healthData.spendingScore, 15)}`}>
                          {healthData.spendingScore}/15
                        </span>
                      </div>
                      <Progress value={(healthData.spendingScore / 15) * 100} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Credit Score</span>
                        <span className={`text-sm font-bold ${getScoreColor(healthData.creditScore, 10)}`}>
                          {healthData.creditScore}/10
                        </span>
                      </div>
                      <Progress value={(healthData.creditScore / 10) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Personalized Recommendations
                    </CardTitle>
                    <CardDescription>
                      AI-generated actions to improve your financial health
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {healthData.recommendations.map((recommendation, index) => (
                        <Alert key={index}>
                          <Info className="h-4 w-4" />
                          <AlertDescription>{recommendation}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Connect your accounts to see detailed financial health analysis
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          {investments && investments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {investments.map((investment, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {investment.symbol}
                      <Badge 
                        variant="outline" 
                        className={getRiskColor(investment.riskLevel)}
                      >
                        {investment.riskLevel} risk
                      </Badge>
                    </CardTitle>
                    <CardDescription>{investment.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Recommended Allocation</span>
                      <span className="text-lg font-bold">{investment.allocation.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Expected Return</span>
                      <span className="text-sm text-green-600 font-medium">
                        {investment.expectedReturn}
                      </span>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        {investment.description}
                      </p>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      {investment.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Complete your financial profile to get personalized investment recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rebalance" className="space-y-6">
          {rebalanceData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Portfolio Rebalancing
                </CardTitle>
                <CardDescription>
                  Recommended actions to optimize your investment allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebalanceData.actions.map((action, index) => (
                    <Alert key={index}>
                      {action.includes('well-balanced') ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      <AlertDescription>{action}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Set up investments to see rebalancing recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          {marketData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Insights
                </CardTitle>
                <CardDescription>
                  Current market conditions and strategic considerations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.insights.map((insight, index) => (
                    <Alert key={index}>
                      <Info className="h-4 w-4" />
                      <AlertDescription>{insight}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Loading market insights...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

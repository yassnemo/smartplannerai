import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  CreditCard, 
  Target,
  Bell,
  CheckCircle,
  Info,
  DollarSign,
  Calendar
} from 'lucide-react';

interface SmartAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'high' | 'medium' | 'low';
  category: 'spending' | 'goals' | 'investments' | 'bills' | 'security';
  timestamp: string;
}

const getAlertIcon = (type: string, category: string) => {
  switch (category) {
    case 'spending':
      return type === 'warning' ? TrendingDown : DollarSign;
    case 'goals':
      return Target;
    case 'investments':
      return TrendingUp;
    case 'bills':
      return Calendar;
    case 'security':
      return AlertTriangle;
    default:
      return Info;
  }
};

const getAlertColor = (type: string) => {
  switch (type) {
    case 'warning':
      return 'border-orange-200 bg-orange-50';
    case 'danger':
      return 'border-red-200 bg-red-50';
    case 'success':
      return 'border-green-200 bg-green-50';
    default:
      return 'border-blue-200 bg-blue-50';
  }
};

const getBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function SmartAlerts() {
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/dashboard']
  });

  const { data: financialHealth } = useQuery({
    queryKey: ['/api/financial-health']
  });

  // Generate smart alerts based on user's financial data
  const generateAlerts = (): SmartAlert[] => {
    const alerts: SmartAlert[] = [];

    if (!dashboardData || !financialHealth) return alerts;    // Spending alerts
    const currentSpending = (dashboardData as any)?.totalExpenses || 0;
    const lastMonthSpending = (dashboardData as any)?.lastMonthExpenses || 0;
    
    if (currentSpending > lastMonthSpending * 1.2) {
      alerts.push({
        id: 'spending-increase',
        type: 'warning',
        title: 'Spending Alert',
        message: `Your spending is up ${Math.round(((currentSpending - lastMonthSpending) / lastMonthSpending) * 100)}% this month`,
        priority: 'high',
        category: 'spending',
        timestamp: new Date().toISOString(),
        action: {
          label: 'View Analytics',
          onClick: () => window.location.href = '/analytics'
        }
      });
    }    // Financial health alerts
    if ((financialHealth as any)?.healthScore < 60) {
      alerts.push({
        id: 'health-score-low',
        type: 'warning',
        title: 'Financial Health Needs Attention',
        message: `Your financial health score is ${(financialHealth as any).healthScore}/100. Consider reviewing your spending and savings.`,
        priority: 'high',
        category: 'spending',
        timestamp: new Date().toISOString(),
        action: {
          label: 'Get Recommendations',
          onClick: () => window.location.href = '/analytics'
        }
      });
    }

    // Emergency fund alert
    const emergencyFund = (financialHealth as any)?.emergencyFundMonths || 0;
    if (emergencyFund < 3) {
      alerts.push({
        id: 'emergency-fund-low',
        type: 'warning',
        title: 'Emergency Fund Below Recommended Level',
        message: `You have ${emergencyFund.toFixed(1)} months of expenses saved. Experts recommend 3-6 months.`,
        priority: 'medium',
        category: 'goals',
        timestamp: new Date().toISOString(),
        action: {
          label: 'Set Emergency Fund Goal',
          onClick: () => window.location.href = '/goals'
        }
      });
    }    // Debt-to-income ratio alert
    const debtToIncome = (financialHealth as any)?.debtToIncomeRatio || 0;
    if (debtToIncome > 36) {
      alerts.push({
        id: 'debt-ratio-high',
        type: 'danger',
        title: 'High Debt-to-Income Ratio',
        message: `Your debt-to-income ratio is ${debtToIncome}%. Consider debt reduction strategies.`,
        priority: 'high',
        category: 'spending',
        timestamp: new Date().toISOString(),
        action: {
          label: 'View Debt Strategy',
          onClick: () => window.location.href = '/analytics'
        }
      });
    }

    // Investment opportunities
    const savingsRate = (financialHealth as any)?.savingsRate || 0;
    if (savingsRate > 20 && (dashboardData as any)?.totalInvestments < (dashboardData as any)?.totalSavings * 0.5) {
      alerts.push({
        id: 'investment-opportunity',
        type: 'info',
        title: 'Investment Opportunity',
        message: `With a ${savingsRate}% savings rate, consider investing more for long-term growth.`,
        priority: 'medium',
        category: 'investments',
        timestamp: new Date().toISOString(),
        action: {
          label: 'View Recommendations',
          onClick: () => window.location.href = '/investments'
        }
      });
    }

    // Goal progress alerts
    if ((dashboardData as any)?.goals) {
      (dashboardData as any).goals.forEach((goal: any) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        if (progress > 90) {
          alerts.push({
            id: `goal-near-complete-${goal.id}`,
            type: 'success',
            title: 'Goal Almost Complete!',
            message: `You're ${progress.toFixed(0)}% of the way to your ${goal.name} goal!`,
            priority: 'medium',
            category: 'goals',
            timestamp: new Date().toISOString(),
            action: {
              label: 'View Goals',
              onClick: () => window.location.href = '/goals'
            }
          });
        }
      });
    }

    // Sort by priority and timestamp
    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const alerts = generateAlerts();

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Smart Alerts</CardTitle>
          </div>
          <CardDescription>
            AI-powered insights about your financial health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">All Good!</h3>
            <p className="text-gray-600">
              No urgent financial alerts at the moment. Keep up the great work!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Smart Alerts</CardTitle>
          </div>
          <Badge variant="secondary">
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription>
          AI-powered insights about your financial health
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.slice(0, 5).map((alert) => {
          const Icon = getAlertIcon(alert.type, alert.category);
          
          return (
            <Alert key={alert.id} className={getAlertColor(alert.type)}>
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <Badge variant={getBadgeVariant(alert.priority)} className="text-xs">
                      {alert.priority}
                    </Badge>
                  </div>
                  <AlertDescription className="text-sm">
                    {alert.message}
                  </AlertDescription>
                  {alert.action && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={alert.action.onClick}
                    >
                      {alert.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </Alert>
          );
        })}
        
        {alerts.length > 5 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm">
              View All {alerts.length} Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SmartAlerts;

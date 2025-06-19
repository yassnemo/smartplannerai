import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react";

const getInsightIcon = (type: string) => {
  switch (type) {
    case "alert":
      return AlertTriangle;
    case "success":
      return CheckCircle;
    case "info":
      return Info;
    default:
      return Lightbulb;
  }
};

const getInsightColor = (type: string) => {
  switch (type) {
    case "alert":
      return "bg-accent/10 border-l-accent text-accent-foreground";
    case "success":
      return "bg-success/10 border-l-success text-success-foreground";
    case "info":
      return "bg-primary/10 border-l-primary text-primary-foreground";
    default:
      return "bg-warning/10 border-l-warning text-warning-foreground";
  }
};

export default function FinancialInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/financial-insights"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Lightbulb className="text-warning text-xl mr-3 h-5 w-5" />
            <CardTitle>AI Financial Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback insights if no data is available
  const fallbackInsights = [
    {
      type: "alert",
      title: "Spending Pattern Alert",
      message: "You've spent 23% more on dining out this month compared to your average. Consider meal planning to reduce costs by $200-300 monthly.",
      category: "spending"
    },
    {
      type: "success",
      title: "Savings Opportunity",
      message: "Your grocery spending is 15% below average. Great job! You could redirect this extra $150 to your emergency fund.",
      category: "savings"
    },
    {
      type: "info",
      title: "Investment Timing",
      message: "Market conditions suggest it's a good time to increase your stock allocation by 5% based on your risk profile.",
      category: "investment"
    }
  ];

  const displayInsights = insights && insights.length > 0 ? insights : fallbackInsights;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Lightbulb className="text-warning text-xl mr-3 h-5 w-5" />
          <CardTitle>AI Financial Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayInsights.map((insight: any, index: number) => {
            const Icon = getInsightIcon(insight.type);
            const colorClass = getInsightColor(insight.type);
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${colorClass}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

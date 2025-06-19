import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { InvestmentRecommendation } from "@shared/schema";

interface InvestmentRecommendationsProps {
  recommendations?: InvestmentRecommendation[];
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "very_low":
      return "bg-blue-100 text-blue-800";
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRiskLabel = (riskLevel: string) => {
  switch (riskLevel) {
    case "very_low":
      return "Very Low Risk";
    case "low":
      return "Low Risk";
    case "medium":
      return "Medium Risk";
    case "high":
      return "High Risk";
    default:
      return "Unknown Risk";
  }
};

export default function InvestmentRecommendations({ recommendations = [] }: InvestmentRecommendationsProps) {
  const { toast } = useToast();

  const handleAddToPortfolio = (symbol: string) => {
    toast({
      title: "Added to Portfolio",
      description: `${symbol} has been added to your investment portfolio.`,
    });
  };

  if (!recommendations.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Investment Recommendations</CardTitle>
            <Badge variant="secondary" className="text-xs">AI Powered</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No investment recommendations available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Investment Recommendations</CardTitle>
          <Badge variant="secondary" className="text-xs">AI Powered</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{recommendation.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Recommended allocation: {parseFloat(recommendation.recommendedAllocation).toFixed(0)}%
                  </p>
                </div>
                <Badge className={getRiskColor(recommendation.riskLevel)}>
                  {getRiskLabel(recommendation.riskLevel)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {recommendation.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-success">
                  Expected Annual Return: {recommendation.expectedReturn}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddToPortfolio(recommendation.symbol)}
                  className="text-primary hover:text-primary-foreground hover:bg-primary"
                >
                  Add to Portfolio
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

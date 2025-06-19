import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { FinancialHealth } from "@shared/schema";

interface FinancialHealthScoreProps {
  data?: FinancialHealth;
}

export default function FinancialHealthScore({ data }: FinancialHealthScoreProps) {
  if (!data) {
    return (
      <Card className="bg-gradient-to-br from-primary/90 to-primary border-0 text-primary-foreground">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Financial Health Score</h2>
                <p className="text-primary-foreground/80 text-base">
                  Your comprehensive financial wellness assessment
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold mb-2 text-primary-foreground/50">--</div>
              <div className="text-sm text-primary-foreground/60">Calculating...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const score = data.healthScore;
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Exceptional";
    if (score >= 80) return "Strong";
    if (score >= 70) return "Healthy";
    if (score >= 60) return "Developing";
    return "Needs Focus";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-success/90 to-success";
    if (score >= 60) return "from-primary/90 to-primary";
    return "from-warning/90 to-warning";
  };

  const getScoreChange = () => {
    // In production, this would come from historical data comparison
    return 3; // +3 point improvement this month
  };

  const scoreChange = getScoreChange();
  const TrendIcon = scoreChange > 0 ? TrendingUp : scoreChange < 0 ? TrendingDown : Minus;

  return (
    <Card className={`bg-gradient-to-br ${getScoreColor(score)} border-0 text-white`}>
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Financial Health Score</h2>
              <p className="text-white/80 text-base">
                Your comprehensive financial wellness assessment
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-2">{score}</div>
            <div className="text-sm text-white/80 mb-1">{getScoreLabel(score)}</div>
            <div className="flex items-center justify-end text-xs text-white/70">
              <TrendIcon className="h-3 w-3 mr-1" />
              {Math.abs(scoreChange)} point{Math.abs(scoreChange) !== 1 ? 's' : ''} this month
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <Progress 
              value={score} 
              className="h-2 bg-transparent [&>div]:bg-white [&>div]:transition-all [&>div]:duration-1000"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">
                ${parseFloat(data.netWorth).toLocaleString()}
              </div>
              <div className="text-xs text-white/70">Net Worth</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {parseFloat(data.savingsRate).toFixed(0)}%
              </div>
              <div className="text-xs text-white/70">Savings Rate</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {data.emergencyFundMonths}mo
              </div>
              <div className="text-xs text-white/70">Emergency Fund</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

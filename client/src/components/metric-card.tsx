import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor, 
  iconBg 
}: MetricCardProps) {
  const changeColorClass = {
    positive: "text-success",
    negative: "text-accent",
    neutral: "text-muted-foreground"
  }[changeType];

  const TrendIcon = changeType === "positive" ? TrendingUp : 
                   changeType === "negative" ? TrendingDown : null;

  return (
    <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`${iconBg} p-3 rounded-xl`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          {TrendIcon && (
            <div className="flex items-center space-x-1">
              <TrendIcon className={`h-3 w-3 ${changeColorClass}`} />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground leading-none">
            {value}
          </p>
          <p className={`text-sm font-medium ${changeColorClass} flex items-center`}>
            {TrendIcon && <TrendIcon className="h-3 w-3 mr-1" />}
            {change}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

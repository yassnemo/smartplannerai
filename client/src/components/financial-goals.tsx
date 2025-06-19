import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { Goal } from "@shared/schema";

interface FinancialGoalsProps {
  goals?: Goal[];
}

const getGoalColor = (percentage: number) => {
  if (percentage >= 75) return "text-success";
  if (percentage >= 50) return "text-primary";  
  if (percentage >= 25) return "text-warning";
  return "text-muted-foreground";
};

const getTargetStatus = (targetDate: string) => {
  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Overdue";
  if (diffDays < 30) return "Due soon";
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months left`;
  return `${Math.ceil(diffDays / 365)} years left`;
};

export default function FinancialGoals({ goals = [] }: FinancialGoalsProps) {
  const { toast } = useToast();

  const handleAddGoal = () => {
    toast({
      title: "Add Goal",
      description: "Goal creation feature will be available soon.",
    });
  };

  if (!goals.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financial Goals</CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddGoal}>
              + Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No financial goals set yet</p>
            <Button variant="outline" onClick={handleAddGoal} className="mt-4">
              Create Your First Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Financial Goals</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddGoal}>
            + Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => {
            const currentAmount = parseFloat(goal.currentAmount);
            const targetAmount = parseFloat(goal.targetAmount);
            const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
            const statusColor = getGoalColor(percentage);
            const status = goal.targetDate ? getTargetStatus(goal.targetDate) : "No target date";
            
            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{goal.name}</h4>
                  <span className="text-sm text-muted-foreground">
                    ${currentAmount.toLocaleString()} / ${targetAmount.toLocaleString()}
                  </span>
                </div>
                <Progress value={Math.min(percentage, 100)} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {percentage.toFixed(0)}% complete
                  </span>
                  <span className={`font-medium ${statusColor}`}>
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

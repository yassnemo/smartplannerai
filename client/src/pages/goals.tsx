import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import FinancialGoals from "@/components/financial-goals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Plus, TrendingUp, Calendar, DollarSign, Home, Car, GraduationCap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Goals() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    goalType: "savings"
  });

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

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/goals"],
    enabled: isAuthenticated,
    retry: false,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      return await apiRequest("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsDialogOpen(false);
      setNewGoal({ name: "", targetAmount: "", targetDate: "", goalType: "savings" });
      toast({
        title: "Goal Created",
        description: "Your financial goal has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-8">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const getGoalIcon = (goalType: string) => {
    switch (goalType) {
      case "house": return Home;
      case "car": return Car;
      case "education": return GraduationCap;
      case "emergency": return Target;
      default: return DollarSign;
    }
  };

  const getGoalColor = (goalType: string) => {
    switch (goalType) {
      case "house": return "text-primary bg-primary/10";
      case "car": return "text-secondary bg-secondary/10";
      case "education": return "text-accent bg-accent/10";
      case "emergency": return "text-success bg-success/10";
      default: return "text-muted-foreground bg-muted/10";
    }
  };

  const totalGoalsValue = goals?.reduce((sum: number, goal: any) => sum + parseFloat(goal.targetAmount || 0), 0) || 0;
  const totalProgress = goals?.reduce((sum: number, goal: any) => sum + parseFloat(goal.currentAmount || 0), 0) || 0;
  const completedGoals = goals?.filter((goal: any) => goal.isCompleted).length || 0;

  const handleCreateGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      toast({
        title: "Missing Information",
        description: "Please provide a goal name and target amount.",
        variant: "destructive",
      });
      return;
    }

    createGoalMutation.mutate({
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      targetDate: newGoal.targetDate || null,
      goalType: newGoal.goalType,
      currentAmount: "0"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-success" />
            </div>
            <span className="text-sm font-medium text-success uppercase tracking-wider">Financial Goals</span>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Your Financial Goals
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Track your progress toward the future you envision. Every milestone brings you closer to your dreams.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-success hover:bg-success/90 text-success-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Financial Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Goal Name</Label>
                    <Input
                      id="name"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      placeholder="e.g., Emergency Fund, House Down Payment"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Target Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Target Date (Optional)</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Goal Type</Label>
                    <Select value={newGoal.goalType} onValueChange={(value) => setNewGoal({ ...newGoal, goalType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency Fund</SelectItem>
                        <SelectItem value="house">House Purchase</SelectItem>
                        <SelectItem value="car">Vehicle</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="retirement">Retirement</SelectItem>
                        <SelectItem value="savings">General Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleCreateGoal} 
                    disabled={createGoalMutation.isPending}
                    className="w-full bg-success hover:bg-success/90"
                  >
                    {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-success" />
                </div>
                <Badge className="bg-success/10 text-success">
                  Active
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Total Goal Value
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ${totalGoalsValue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Across {goals?.length || 0} goal{goals?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center text-sm text-primary">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {totalGoalsValue > 0 ? ((totalProgress / totalGoalsValue) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Total Progress
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ${totalProgress.toLocaleString()}
                </p>
                <Progress value={totalGoalsValue > 0 ? (totalProgress / totalGoalsValue) * 100 : 0} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Completed Goals
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {completedGoals}
                </p>
                <p className="text-sm text-muted-foreground">
                  Milestones achieved
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Your Goals</h2>
          
          {goalsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : !goals || goals.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Goals Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start your financial journey by setting your first goal. Whether it's an emergency fund, 
                  a dream vacation, or a new home, every goal begins with a single step.
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal: any) => {
                const Icon = getGoalIcon(goal.goalType);
                const colorClass = getGoalColor(goal.goalType);
                const progress = parseFloat(goal.targetAmount) > 0 
                  ? (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100 
                  : 0;
                const daysLeft = goal.targetDate 
                  ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <Card key={goal.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-colors">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {goal.isCompleted && (
                          <Badge className="bg-success/10 text-success">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              ${parseFloat(goal.currentAmount).toLocaleString()} / ${parseFloat(goal.targetAmount).toLocaleString()}
                            </span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>{progress.toFixed(0)}% complete</span>
                            {daysLeft !== null && (
                              <span>
                                {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <Button variant="outline" size="sm" className="text-xs">
                            Add Funds
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Edit Goal
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Goal Tips */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Tips for Success</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Set SMART Goals</h3>
                <p className="text-sm text-muted-foreground">
                  Make your goals Specific, Measurable, Achievable, Relevant, and Time-bound for better success rates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Automate Savings</h3>
                <p className="text-sm text-muted-foreground">
                  Set up automatic transfers to your goal accounts to make consistent progress without thinking about it.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Regular check-ins and milestone celebrations keep you motivated on your financial journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
import { BarChart3, CreditCard, TrendingUp, Target } from "lucide-react";

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 px-6 py-3 z-40">
      <div className="flex justify-around">
        <button className="flex flex-col items-center py-2 px-3 text-primary bg-primary/10 rounded-xl">
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Overview</span>
        </button>
        <button className="flex flex-col items-center py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
          <CreditCard className="h-5 w-5" />
          <span className="text-xs mt-1">Activity</span>
        </button>
        <button className="flex flex-col items-center py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs mt-1">Invest</span>
        </button>
        <button className="flex flex-col items-center py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
          <Target className="h-5 w-5" />
          <span className="text-xs mt-1">Goals</span>
        </button>
      </div>
    </nav>
  );
}

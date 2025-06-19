import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, BarChart3, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.split(' ');
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground tracking-tight">FinanceAI</span>
            </div>
            <nav className="hidden lg:ml-12 lg:flex space-x-8">
              <Link href="/" className={`${location === "/" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"} transition-colors text-sm`}>
                Overview
              </Link>
              <Link href="/analytics" className={`${location === "/analytics" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"} transition-colors text-sm`}>
                Analytics
              </Link>
              <Link href="/investments" className={`${location === "/investments" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"} transition-colors text-sm`}>
                Investments
              </Link>
              <Link href="/goals" className={`${location === "/goals" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"} transition-colors text-sm`}>
                Goals
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9 w-9"
            >
              <Bell className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-border/50">
              <Avatar className="h-9 w-9 ring-2 ring-background">
                <AvatarImage src={user?.photoURL || ''} alt="Profile" />
                <AvatarFallback className="text-xs font-medium bg-muted">
                  {getInitials(user?.displayName, user?.email)}
                </AvatarFallback>
              </Avatar>
              
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-none">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user?.email || 'No email'}
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9 w-9"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

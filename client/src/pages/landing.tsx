import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Shield, Target, BarChart3, Compass, Award } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    setLocation('/dashboard');
    return null;
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground tracking-tight">FinanceAI</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowAuth(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to homepage
            </Button>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground tracking-tight">FinanceAI</span>
            </div>
            <Button 
              onClick={() => setShowAuth(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              Begin Journey
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Compass className="w-3 h-3 mr-2" />
            Your Financial Compass
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-tight">
            Understand Your
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Financial Story
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Every transaction tells a story. Every decision shapes your future. 
            We help you understand the narrative and write your next chapter with confidence.
          </p>
          
          <Button 
            size="lg"
            onClick={() => setShowAuth(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 h-auto group"
          >
            Start Your Story
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Journey Steps */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Your Journey to Financial Clarity
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three thoughtfully designed steps to transform how you understand and manage your financial life.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Step 1: Discover */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <Card className="pt-8 border-2 border-border/50 hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-8">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Step One</span>
                  <h3 className="text-2xl font-bold text-foreground mt-2">Discover Your Patterns</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We analyze your spending habits, income patterns, and financial behaviors to reveal insights 
                  you never knew existed. Understanding is the first step to transformation.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                    Automatic transaction categorization
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                    Spending pattern recognition
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                    Financial health assessment
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Optimize */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
              <Target className="h-8 w-8 text-secondary" />
            </div>
            <Card className="pt-8 border-2 border-border/50 hover:border-secondary/20 transition-all duration-300">
              <CardContent className="p-8">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Step Two</span>
                  <h3 className="text-2xl font-bold text-foreground mt-2">Optimize Your Strategy</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  With clarity comes opportunity. We provide personalized recommendations to optimize your 
                  spending, maximize savings, and align your finances with your deepest aspirations.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3"></div>
                    Personalized investment strategies
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3"></div>
                    Smart budgeting recommendations
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3"></div>
                    Goal-oriented financial planning
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Achieve */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
              <Award className="h-8 w-8 text-accent" />
            </div>
            <Card className="pt-8 border-2 border-border/50 hover:border-accent/20 transition-all duration-300">
              <CardContent className="p-8">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-accent uppercase tracking-wider">Step Three</span>
                  <h3 className="text-2xl font-bold text-foreground mt-2">Achieve Your Dreams</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Track your progress, celebrate milestones, and stay motivated as you work toward your financial 
                  goals. Every step forward is a step toward the life you envision.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3"></div>
                    Real-time progress tracking
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3"></div>
                    Milestone celebrations
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3"></div>
                    Continuous refinement
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium mb-8">
              <Shield className="w-3 h-3 mr-2" />
              Enterprise-Grade Security
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Your Trust is Our Foundation
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              We understand that your financial data is deeply personal. That's why we've built our platform 
              with the same security standards used by major financial institutions, ensuring your information 
              remains private and protected.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">256-bit Encryption</h3>
                <p className="text-sm text-muted-foreground">Bank-level encryption protects all your data</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
                <p className="text-sm text-muted-foreground">Your data is never sold or shared</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Secure Access</h3>
                <p className="text-sm text-muted-foreground">Multi-factor authentication & secure login</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/10">
          <CardContent className="p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands who have already discovered the power of truly understanding their financial story. 
              Your journey to financial clarity starts with a single step.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-4 h-auto group"
            >
              Begin Your Transformation
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">FinanceAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transforming financial futures through intelligent insights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MXConnect } from './mx-connect';
import { 
  Shield, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  CreditCard,
  PiggyBank,
  BarChart3
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has accounts
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/dashboard'],
    retry: false,
  });

  // Initialize mock data mutation
  const initMockDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/init-mock-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to initialize data');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      markStepCompleted('connect-accounts');
      setCurrentStep(1);
      toast({
        title: 'Demo Data Loaded',
        description: 'Explore SmartPlannerAI with sample financial data!',
      });
    },
  });

  const steps: OnboardingStep[] = [
    {
      id: 'connect-accounts',
      title: 'Connect Your Accounts',
      description: 'Link your bank accounts for real-time financial insights',
      icon: CreditCard,
      completed: completedSteps.has('connect-accounts') || (dashboardData?.accounts?.length > 0)
    },
    {
      id: 'set-goals',
      title: 'Set Financial Goals',
      description: 'Define your financial objectives and track progress',
      icon: Target,
      completed: completedSteps.has('set-goals') || (dashboardData?.goals?.length > 0)
    },
    {
      id: 'explore-insights',
      title: 'Explore Your Insights',
      description: 'Discover AI-powered recommendations and analytics',
      icon: BarChart3,
      completed: completedSteps.has('explore-insights')
    }
  ];

  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const handleSkipOnboarding = () => {
    initMockDataMutation.mutate();
  };

  const completedCount = steps.filter(step => step.completed).length;
  const progress = (completedCount / steps.length) * 100;

  // If user already has data, don't show onboarding
  if (dashboardData?.accounts?.length > 0 || dashboardData?.goals?.length > 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SmartPlannerAI
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Let's get your financial journey started in just a few steps
          </p>
          
          {/* Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{completedCount}/{steps.length} completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Steps Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = step.completed;
            
            return (
              <Card 
                key={step.id} 
                className={`relative transition-all duration-200 ${
                  isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
                } ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${
                      isCompleted ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Icon className={`h-5 w-5 ${
                          isActive ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                      )}
                    </div>
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Current Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 0 && (
            <Card>
              <CardHeader className="text-center">
                <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Connect Your Bank Accounts</CardTitle>
                <CardDescription>
                  Choose how you'd like to get started with SmartPlannerAI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Real Bank Connection */}
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <Shield className="h-8 w-8 text-blue-600 mb-2" />
                      <CardTitle className="text-lg">Connect Real Accounts</CardTitle>
                      <CardDescription>
                        Get personalized insights from your actual financial data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">                      <MXConnect onSuccess={() => {
                        markStepCompleted('connect-accounts');
                        setCurrentStep(1);
                      }} />
                    </CardContent>
                  </Card>

                  {/* Demo Data */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader>
                      <Sparkles className="h-8 w-8 text-purple-600 mb-2" />
                      <CardTitle className="text-lg">Try Demo Mode</CardTitle>
                      <CardDescription>
                        Explore features with sample financial data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleSkipOnboarding}
                        disabled={initMockDataMutation.isPending}
                      >
                        {initMockDataMutation.isPending ? 'Loading...' : 'Use Demo Data'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Security Assurance */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">Your Data is Secure</h4>
                      <p className="text-sm text-green-700">
                        We use bank-level 256-bit encryption and never store your login credentials. 
                        Your financial data is protected with the same security standards used by major banks.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <Card>
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Set Your Financial Goals</CardTitle>
                <CardDescription>
                  Define what you're working towards financially
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { name: 'Emergency Fund', amount: '$10,000', icon: Shield },
                    { name: 'Home Down Payment', amount: '$50,000', icon: PiggyBank },
                    { name: 'Retirement', amount: '$1,000,000', icon: TrendingUp },
                    { name: 'Vacation', amount: '$5,000', icon: Sparkles },
                  ].map((goal) => (
                    <Card key={goal.name} className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <goal.icon className="h-6 w-6 text-blue-600" />
                          <div>
                            <div className="font-medium">{goal.name}</div>
                            <div className="text-sm text-gray-600">{goal.amount}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                  <Button 
                    onClick={() => {
                      markStepCompleted('set-goals');
                      setCurrentStep(2);
                    }}
                    className="flex-1"
                  >
                    Set Goals Later
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>You're All Set!</CardTitle>
                <CardDescription>
                  Ready to explore your personalized financial dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-2">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Smart Analytics</h4>
                    <p className="text-sm text-gray-600">AI-powered insights and trends</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-2">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium">Goal Tracking</h4>
                    <p className="text-sm text-gray-600">Monitor your progress</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-2">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium">Secure & Private</h4>
                    <p className="text-sm text-gray-600">Your data is protected</p>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    markStepCompleted('explore-insights');
                    window.location.href = '/dashboard';
                  }}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingFlow;

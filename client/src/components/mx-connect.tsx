import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Shield, Link, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface MXConnectProps {
  onSuccess?: () => void;
}

export function MXConnect({ onSuccess }: MXConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [widgetWindow, setWidgetWindow] = useState<Window | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch MX widget URL
  const { data: widgetData, isLoading: isLoadingWidget } = useQuery({
    queryKey: ['mx-widget-url'],
    queryFn: async () => {
      const response = await fetch('/api/mx/widget-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create widget URL');
      return response.json();
    },
  });

  // Handle connection callback mutation
  const connectCallbackMutation = useMutation({
    mutationFn: async (memberGuid?: string) => {
      const response = await fetch('/api/mx/connect-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_guid: memberGuid }),
      });
      if (!response.ok) throw new Error('Failed to connect accounts');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsConnecting(false);
      setConnectError(null);
      
      toast({
        title: 'Accounts Connected Successfully',
        description: `${data.accounts?.length || 0} account(s) connected and syncing...`,
      });
      
      onSuccess?.();
    },
    onError: (error: Error) => {
      setConnectError(error.message);
      setIsConnecting(false);
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Listen for widget completion messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check origin for security (in production, verify this matches MX's domain)
      if (event.origin !== 'https://int-widgets.moneydesktop.com' && 
          event.origin !== 'https://widgets.moneydesktop.com') {
        return;
      }

      const data = event.data;
      
      if (data.type === 'mx/connect/memberConnected') {
        console.log('[MX] Member connected:', data.metadata);
        setIsConnecting(true);
        connectCallbackMutation.mutate(data.metadata?.member_guid);
        
        // Close the widget window
        if (widgetWindow) {
          widgetWindow.close();
          setWidgetWindow(null);
        }
      } else if (data.type === 'mx/connect/memberDeleted') {
        console.log('[MX] Member deleted:', data.metadata);
        toast({
          title: 'Account Disconnected',
          description: 'The account has been disconnected successfully.',
        });
      } else if (data.type === 'mx/connect/error') {
        console.error('[MX] Widget error:', data.metadata);
        setConnectError('Connection failed. Please try again.');
        if (widgetWindow) {
          widgetWindow.close();
          setWidgetWindow(null);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [widgetWindow, connectCallbackMutation, toast]);

  const openMXWidget = () => {
    if (!widgetData?.widget_url) {
      setConnectError('Widget URL not available');
      return;
    }

    setConnectError(null);
    
    // Open MX Connect widget in a popup window
    const popup = window.open(
      widgetData.widget_url,
      'mx_connect',
      'width=800,height=700,scrollbars=yes,resizable=yes,toolbar=no,location=no,directories=no,status=no,menubar=no'
    );

    if (popup) {
      setWidgetWindow(popup);
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setWidgetWindow(null);
          setIsConnecting(false);
        }
      }, 1000);
    } else {
      setConnectError('Popup blocked. Please allow popups for this site.');
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Link className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <CardTitle>Connect Your Bank Account</CardTitle>
        <CardDescription>
          Securely link your bank accounts using MX - a trusted financial data platform with bank-level security
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* MX Security Features */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">MX Security & Trust</span>
          </div>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 256-bit encryption for all data transmission</li>
            <li>• Read-only access to your accounts</li>
            <li>• SOC 2 Type II certified security</li>
            <li>• Used by major banks and financial institutions</li>
            <li>• No storage of banking credentials</li>
          </ul>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="font-medium">What you'll get:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Smart categorization</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Real-time insights</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Spending analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Financial health score</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {connectError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm">{connectError}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={openMXWidget}
          disabled={!widgetData?.widget_url || isLoadingWidget || isConnecting}
          className="w-full"
          size="lg"
        >
          {isLoadingWidget ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing Connection...
            </>
          ) : isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting Accounts...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect Bank Accounts
            </>
          )}
        </Button>

        {/* Alternative Option */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Want to explore first?
          </p>
          <Button variant="outline" onClick={onSuccess} className="text-sm">
            Continue with Demo Data
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex justify-center items-center gap-4 pt-4 border-t">
          <Badge variant="secondary" className="text-xs">
            SOC 2 Certified
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Bank-Grade Security
          </Badge>
          <Badge variant="secondary" className="text-xs">
            No Credential Storage
          </Badge>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <strong>Why MX?</strong> MX is a leading financial data platform trusted by thousands of banks and fintech companies. 
              Unlike some providers, MX offers a free tier for developers and focuses on data quality and user experience.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MXConnect;

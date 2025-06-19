import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./firebaseAuth";
import { mockDataService } from "./services/mockDataService";
import { financialService } from "./services/financialService";
import { mxService } from "./services/mxService";
import { mlCategorizationService } from "./services/mlCategorizationService";
import { financialHealthService } from "./services/financialHealthService";
import { investmentRecommendationService } from "./services/investmentRecommendationService";
import { insertAccountSchema, insertTransactionSchema, insertGoalSchema } from "@shared/schema";
import { 
  securityHeaders, 
  apiRateLimit, 
  authRateLimit, 
  financialIntegrationRateLimit,
  auditLog,
  validateGoal,
  validateTransaction,
  validateAccount
} from "./middleware/security";

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(securityHeaders);
  app.use('/api', apiRateLimit);

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', authRateLimit, isAuthenticated, auditLog('USER_INFO'), async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUser(userId);
      res.json(user || {
        id: userId,
        email: req.user.email,
        firstName: req.user.name?.split(' ')[0] || 'User',
        lastName: req.user.name?.split(' ')[1] || ''
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Initialize mock data for new users
  app.post('/api/init-mock-data', isAuthenticated, auditLog('INIT_MOCK_DATA'), async (req: any, res) => {
    try {
      const userId = req.user.uid;
      await mockDataService.initializeUserData(userId);
      res.json({ message: "Mock data initialized successfully" });
    } catch (error) {
      console.error("Error initializing mock data:", error);
      res.status(500).json({ message: "Failed to initialize mock data" });
    }
  });

  // Dashboard data
  app.get('/api/dashboard', isAuthenticated, auditLog('DASHBOARD_VIEW'), async (req: any, res) => {
    try {
      const userId = req.user.uid;
      
      // Check if user has data, if not initialize it
      const accounts = await storage.getUserAccounts(userId);
      if (accounts.length === 0) {
        await mockDataService.initializeUserData(userId);
      }

      const dashboardData = await financialService.getDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Financial health score
  app.get('/api/financial-health', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const healthData = await storage.getLatestFinancialHealth(userId);
      res.json(healthData);
    } catch (error) {
      console.error("Error fetching financial health:", error);
      res.status(500).json({ message: "Failed to fetch financial health" });
    }
  });

  // Transactions
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Goals
  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post('/api/goals', isAuthenticated, validateGoal, auditLog('GOAL_CREATE'), async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const goalData = { ...req.body, userId };
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  // Investment recommendations
  app.get('/api/investment-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const recommendations = await storage.getUserInvestmentRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching investment recommendations:", error);
      res.status(500).json({ message: "Failed to fetch investment recommendations" });
    }
  });

  // Spending analytics
  app.get('/api/spending-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const period = req.query.period as string || 'month';
      const analytics = await financialService.getSpendingAnalytics(userId, period);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching spending analytics:", error);
      res.status(500).json({ message: "Failed to fetch spending analytics" });
    }
  });

  // Net worth trend
  app.get('/api/net-worth-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const months = parseInt(req.query.months as string) || 6;
      const history = await financialService.getNetWorthHistory(userId, months);
      res.json(history);
    } catch (error) {
      console.error("Error fetching net worth history:", error);
      res.status(500).json({ message: "Failed to fetch net worth history" });
    }
  });

  // MX Integration Routes (replacing Plaid)
  app.post('/api/mx/widget-url', financialIntegrationRateLimit, isAuthenticated, auditLog('MX_WIDGET_URL'), async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const widgetUrl = await mxService.getConnectWidgetUrl(userId);
      res.json({ widget_url: widgetUrl });
    } catch (error) {
      console.error("Error creating MX widget URL:", error);
      res.status(500).json({ message: "Failed to create widget URL" });
    }
  });

  app.post('/api/mx/connect-callback', financialIntegrationRateLimit, isAuthenticated, auditLog('MX_CONNECT'), async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const { member_guid } = req.body;
      
      const result = await mxService.handleWidgetCallback(userId, member_guid);
      
      // Trigger ML categorization for new transactions
      await mlCategorizationService.batchCategorizeTransactions(userId);
      
      // Recalculate financial health
      await financialHealthService.calculateFinancialHealth(userId);
      
      res.json(result);
    } catch (error) {
      console.error("Error handling MX callback:", error);
      res.status(500).json({ message: "Failed to connect accounts" });
    }
  });

  app.post('/api/mx/sync', financialIntegrationRateLimit, isAuthenticated, auditLog('MX_SYNC'), async (req: any, res) => {
    try {
      const userId = req.user.uid;
      await mxService.refreshAccountBalances(userId);
      
      // Re-run ML analysis on new data
      await mlCategorizationService.batchCategorizeTransactions(userId);
      await mlCategorizationService.detectAnomalies(userId);
      
      res.json({ message: "Accounts synced successfully" });
    } catch (error) {
      console.error("Error syncing MX accounts:", error);
      res.status(500).json({ message: "Failed to sync accounts" });
    }
  });

  // ML and Analytics Routes
  app.post('/api/ml/categorize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      await mlCategorizationService.batchCategorizeTransactions(userId);
      res.json({ message: "Transaction categorization completed" });
    } catch (error) {
      console.error("Error in ML categorization:", error);
      res.status(500).json({ message: "Failed to categorize transactions" });
    }
  });

  app.get('/api/financial-health/detailed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const healthBreakdown = await financialHealthService.calculateFinancialHealth(userId);
      res.json(healthBreakdown);
    } catch (error) {
      console.error("Error calculating detailed financial health:", error);
      res.status(500).json({ message: "Failed to calculate financial health" });
    }
  });

  app.get('/api/investment-recommendations/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const recommendations = await investmentRecommendationService.generateRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating investment recommendations:", error);
      res.status(500).json({ message: "Failed to generate investment recommendations" });
    }
  });

  app.get('/api/investment-recommendations/rebalance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const rebalanceActions = await investmentRecommendationService.rebalancePortfolio(userId);
      res.json({ actions: rebalanceActions });
    } catch (error) {
      console.error("Error generating rebalance recommendations:", error);
      res.status(500).json({ message: "Failed to generate rebalance recommendations" });
    }
  });

  app.get('/api/insights/market', isAuthenticated, async (req: any, res) => {
    try {
      const insights = await investmentRecommendationService.getMarketInsights();
      res.json({ insights });
    } catch (error) {
      console.error("Error fetching market insights:", error);
      res.status(500).json({ message: "Failed to fetch market insights" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

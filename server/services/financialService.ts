import { storage } from "../storage";

class FinancialService {
  async getDashboardData(userId: string) {
    const [
      accounts,
      financialHealth,
      recentTransactions,
      goals,
      investmentRecommendations
    ] = await Promise.all([
      storage.getUserAccounts(userId),
      storage.getLatestFinancialHealth(userId),
      storage.getUserTransactions(userId, 5),
      storage.getUserGoals(userId),
      storage.getUserInvestmentRecommendations(userId)
    ]);

    return {
      accounts,
      financialHealth,
      recentTransactions,
      goals,
      investmentRecommendations
    };
  }

  async getSpendingAnalytics(userId: string, period: string = 'month') {
    const days = period === 'month' ? 30 : period === 'quarter' ? 90 : 30;
    const transactions = await storage.getUserTransactions(userId, undefined, days);
    
    // Group by category
    const categoryTotals: Record<string, number> = {};
    
    transactions
      .filter(t => !t.isIncome)
      .forEach(t => {
        const amount = Math.abs(parseFloat(t.amount));
        if (categoryTotals[t.category]) {
          categoryTotals[t.category] += amount;
        } else {
          categoryTotals[t.category] = amount;
        }
      });

    // Convert to array format for charts
    const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: 0 // Will be calculated on frontend
    }));

    const totalSpending = chartData.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate percentages
    chartData.forEach(item => {
      item.percentage = totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0;
    });

    // Sort by amount descending
    chartData.sort((a, b) => b.amount - a.amount);

    return {
      period,
      totalSpending,
      categories: chartData,
      transactionCount: transactions.filter(t => !t.isIncome).length
    };
  }

  async getNetWorthHistory(userId: string, months: number = 6) {
    // For now, generate mock historical data based on current net worth
    const currentHealth = await storage.getLatestFinancialHealth(userId);
    if (!currentHealth) {
      return [];
    }

    const currentNetWorth = parseFloat(currentHealth.netWorth);
    const history = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Simulate gradual growth with some volatility
      const growthFactor = 1 + (Math.random() * 0.04 - 0.02); // -2% to +2% monthly change
      const baseGrowth = Math.pow(1.005, months - i); // 0.5% monthly base growth
      const netWorth = Math.round(currentNetWorth * baseGrowth * growthFactor);
      
      history.push({
        date: date.toISOString().split('T')[0],
        netWorth,
        month: date.toLocaleString('default', { month: 'short' })
      });
    }

    return history;
  }

  async getFinancialInsights(userId: string) {
    const [
      transactions,
      financialHealth,
      goals
    ] = await Promise.all([
      storage.getUserTransactions(userId, undefined, 60), // Last 2 months
      storage.getLatestFinancialHealth(userId),
      storage.getUserGoals(userId)
    ]);

    const insights = [];

    // Spending pattern analysis
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transactionDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transactionDate >= thirtyDaysAgo && !t.isIncome;
    });

    const previousMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transactionDate);
      const sixtyDaysAgo = new Date();
      const thirtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transactionDate >= sixtyDaysAgo && transactionDate < thirtyDaysAgo && !t.isIncome;
    });

    // Dining out analysis
    const currentDining = currentMonthTransactions
      .filter(t => t.category === 'Food & Dining' && t.subcategory === 'Restaurants')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    
    const previousDining = previousMonthTransactions
      .filter(t => t.category === 'Food & Dining' && t.subcategory === 'Restaurants')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

    if (previousDining > 0) {
      const diningChange = ((currentDining - previousDining) / previousDining) * 100;
      if (diningChange > 15) {
        insights.push({
          type: 'alert',
          title: 'Spending Pattern Alert',
          message: `You've spent ${diningChange.toFixed(0)}% more on dining out this month compared to last month. Consider meal planning to reduce costs by $200-300 monthly.`,
          category: 'spending'
        });
      }
    }

    // Savings opportunity
    const currentGroceries = currentMonthTransactions
      .filter(t => t.category === 'Food & Dining' && t.subcategory === 'Groceries')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    
    const previousGroceries = previousMonthTransactions
      .filter(t => t.category === 'Food & Dining' && t.subcategory === 'Groceries')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

    if (previousGroceries > 0) {
      const groceryChange = ((currentGroceries - previousGroceries) / previousGroceries) * 100;
      if (groceryChange < -10) {
        insights.push({
          type: 'success',
          title: 'Savings Opportunity',
          message: `Your grocery spending is ${Math.abs(groceryChange).toFixed(0)}% below average. Great job! You could redirect this extra $${Math.abs(currentGroceries - previousGroceries).toFixed(0)} to your emergency fund.`,
          category: 'savings'
        });
      }
    }

    // Investment timing
    if (financialHealth && parseFloat(financialHealth.savingsRate) > 15) {
      insights.push({
        type: 'info',
        title: 'Investment Timing',
        message: 'Market conditions suggest it\'s a good time to increase your stock allocation by 5% based on your risk profile.',
        category: 'investment'
      });
    }

    return insights;
  }
}

export const financialService = new FinancialService();

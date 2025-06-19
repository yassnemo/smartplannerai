import { storage } from '../storage';

interface FinancialHealthMetrics {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  creditScore?: number;
}

interface HealthScoreBreakdown {
  totalScore: number;
  savingsScore: number;
  debtScore: number;
  emergencyFundScore: number;
  spendingScore: number;
  creditScore: number;
  recommendations: string[];
}

class FinancialHealthService {
  
  async calculateFinancialHealth(userId: string): Promise<HealthScoreBreakdown> {
    try {
      const metrics = await this.gatherFinancialMetrics(userId);
      const breakdown = this.calculateHealthScoreBreakdown(metrics);
      
      // Store the calculated health data
      await storage.createFinancialHealth({
        userId,
        healthScore: breakdown.totalScore,
        netWorth: metrics.netWorth.toString(),
        monthlyIncome: metrics.monthlyIncome.toString(),
        monthlyExpenses: metrics.monthlyExpenses.toString(),
        savingsRate: metrics.savingsRate.toString(),
        debtToIncomeRatio: metrics.debtToIncomeRatio.toString(),
        creditScore: metrics.creditScore,
        emergencyFundMonths: metrics.emergencyFundMonths.toString()
      });

      return breakdown;
    } catch (error) {
      console.error('Error calculating financial health:', error);
      throw new Error('Failed to calculate financial health');
    }
  }

  private async gatherFinancialMetrics(userId: string): Promise<FinancialHealthMetrics> {
    const [accounts, transactions] = await Promise.all([
      storage.getUserAccounts(userId),
      storage.getUserTransactions(userId, undefined, 90) // Last 3 months
    ]);

    // Calculate net worth
    const netWorth = accounts.reduce((total, account) => {
      const balance = parseFloat(account.balance);
      if (account.accountType === 'credit') {
        return total - Math.abs(balance); // Credit balances are negative to net worth
      }
      return total + balance;
    }, 0);

    // Calculate monthly income and expenses from last 30 days
    const last30Days = transactions.filter(t => {
      const transactionDate = new Date(t.transactionDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transactionDate >= thirtyDaysAgo;
    });

    const monthlyIncome = last30Days
      .filter(t => t.isIncome)
      .reduce((total, t) => total + parseFloat(t.amount), 0);

    const monthlyExpenses = Math.abs(last30Days
      .filter(t => !t.isIncome)
      .reduce((total, t) => total + parseFloat(t.amount), 0));

    // Calculate savings rate
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    // Calculate debt-to-income ratio
    const debtAccounts = accounts.filter(a => a.accountType === 'credit');
    const totalDebt = debtAccounts.reduce((total, account) => {
      return total + Math.abs(parseFloat(account.balance));
    }, 0);
    
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;

    // Calculate emergency fund months
    const liquidAccounts = accounts.filter(a => 
      a.accountType === 'checking' || a.accountType === 'savings'
    );
    const emergencyFund = liquidAccounts.reduce((total, account) => {
      return total + parseFloat(account.balance);
    }, 0);
    const emergencyFundMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;

    return {
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      debtToIncomeRatio,
      emergencyFundMonths,
      creditScore: 720 + Math.floor(Math.random() * 80) // Mock credit score for now
    };
  }

  private calculateHealthScoreBreakdown(metrics: FinancialHealthMetrics): HealthScoreBreakdown {
    const recommendations: string[] = [];

    // Savings Rate Score (0-25 points)
    let savingsScore = 0;
    if (metrics.savingsRate >= 20) {
      savingsScore = 25;
    } else if (metrics.savingsRate >= 15) {
      savingsScore = 20;
    } else if (metrics.savingsRate >= 10) {
      savingsScore = 15;
    } else if (metrics.savingsRate >= 5) {
      savingsScore = 10;
    } else if (metrics.savingsRate > 0) {
      savingsScore = 5;
    }

    if (savingsScore < 15) {
      recommendations.push('Increase your savings rate to at least 15% for better financial health');
    }

    // Debt Score (0-25 points)
    let debtScore = 25;
    if (metrics.debtToIncomeRatio > 40) {
      debtScore = 0;
      recommendations.push('Your debt-to-income ratio is high. Consider debt consolidation or payment strategies');
    } else if (metrics.debtToIncomeRatio > 30) {
      debtScore = 10;
      recommendations.push('Work on reducing your debt-to-income ratio below 30%');
    } else if (metrics.debtToIncomeRatio > 20) {
      debtScore = 15;
    } else if (metrics.debtToIncomeRatio > 10) {
      debtScore = 20;
    }

    // Emergency Fund Score (0-25 points)
    let emergencyFundScore = 0;
    if (metrics.emergencyFundMonths >= 6) {
      emergencyFundScore = 25;
    } else if (metrics.emergencyFundMonths >= 3) {
      emergencyFundScore = 20;
    } else if (metrics.emergencyFundMonths >= 1) {
      emergencyFundScore = 15;
    } else if (metrics.emergencyFundMonths >= 0.5) {
      emergencyFundScore = 10;
    } else if (metrics.emergencyFundMonths > 0) {
      emergencyFundScore = 5;
    }

    if (emergencyFundScore < 20) {
      recommendations.push('Build an emergency fund covering 3-6 months of expenses');
    }

    // Spending Score (0-15 points) - Based on expense-to-income ratio
    let spendingScore = 15;
    const expenseRatio = metrics.monthlyIncome > 0 ? (metrics.monthlyExpenses / metrics.monthlyIncome) * 100 : 100;
    
    if (expenseRatio > 95) {
      spendingScore = 0;
      recommendations.push('Your expenses are too high relative to income. Create a budget to reduce spending');
    } else if (expenseRatio > 85) {
      spendingScore = 5;
      recommendations.push('Consider reducing discretionary spending to improve your financial health');
    } else if (expenseRatio > 75) {
      spendingScore = 10;
    }

    // Credit Score (0-10 points)
    let creditScore = 0;
    if (metrics.creditScore) {
      if (metrics.creditScore >= 800) {
        creditScore = 10;
      } else if (metrics.creditScore >= 740) {
        creditScore = 8;
      } else if (metrics.creditScore >= 670) {
        creditScore = 6;
      } else if (metrics.creditScore >= 580) {
        creditScore = 4;
      } else {
        creditScore = 2;
        recommendations.push('Work on improving your credit score through timely payments and debt reduction');
      }
    }

    const totalScore = savingsScore + debtScore + emergencyFundScore + spendingScore + creditScore;

    // Add general recommendations based on total score
    if (totalScore >= 85) {
      recommendations.unshift('Excellent financial health! Consider advanced investment strategies');
    } else if (totalScore >= 70) {
      recommendations.unshift('Good financial health. Focus on optimizing your investment portfolio');
    } else if (totalScore >= 50) {
      recommendations.unshift('Fair financial health. Prioritize building emergency fund and reducing debt');
    } else {
      recommendations.unshift('Financial health needs improvement. Focus on budgeting and debt reduction');
    }

    return {
      totalScore,
      savingsScore,
      debtScore,
      emergencyFundScore,
      spendingScore,
      creditScore,
      recommendations
    };
  }

  async getFinancialHealthInsights(userId: string): Promise<string[]> {
    try {
      const healthData = await storage.getLatestFinancialHealth(userId);
      if (!healthData) {
        return ['Complete your financial profile to get personalized insights'];
      }

      const insights: string[] = [];
      const savingsRate = parseFloat(healthData.savingsRate);
      const debtRatio = parseFloat(healthData.debtToIncomeRatio);
      const emergencyMonths = parseFloat(healthData.emergencyFundMonths);

      // Savings insights
      if (savingsRate < 10) {
        insights.push(`Your savings rate is ${savingsRate.toFixed(1)}%. Try to increase it to at least 15% by reducing unnecessary expenses.`);
      } else if (savingsRate > 20) {
        insights.push(`Excellent savings rate of ${savingsRate.toFixed(1)}%! Consider investing the excess in diversified portfolios.`);
      }

      // Debt insights
      if (debtRatio > 30) {
        insights.push(`Your debt-to-income ratio is ${debtRatio.toFixed(1)}%. Focus on paying down high-interest debt first.`);
      }

      // Emergency fund insights
      if (emergencyMonths < 3) {
        const needed = (3 - emergencyMonths) * parseFloat(healthData.monthlyExpenses);
        insights.push(`You need $${needed.toFixed(0)} more for a 3-month emergency fund. Consider automating savings transfers.`);
      }

      return insights;
    } catch (error) {
      console.error('Error getting financial health insights:', error);
      return ['Unable to generate insights at this time'];
    }
  }
}

export const financialHealthService = new FinancialHealthService();

import { storage } from "../storage";
import type { InsertAccount, InsertTransaction, InsertGoal, InsertInvestmentRecommendation, InsertFinancialHealth } from "@shared/schema";

class MockDataService {
  async initializeUserData(userId: string) {
    // Create sample accounts
    const accounts = await this.createSampleAccounts(userId);
    
    // Create sample transactions
    await this.createSampleTransactions(accounts);
    
    // Create sample goals
    await this.createSampleGoals(userId);
    
    // Create investment recommendations
    await this.createInvestmentRecommendations(userId);
    
    // Calculate and store financial health
    await this.calculateFinancialHealth(userId);
  }

  private async createSampleAccounts(userId: string) {
    const sampleAccounts: InsertAccount[] = [
      {
        userId,
        accountType: "checking",
        accountName: "Primary Checking",
        institutionName: "Chase Bank",
        balance: "3245.67"
      },
      {
        userId,
        accountType: "savings",
        accountName: "High Yield Savings",
        institutionName: "Marcus by Goldman Sachs",
        balance: "15420.85"
      },
      {
        userId,
        accountType: "credit",
        accountName: "Rewards Credit Card",
        institutionName: "Chase Sapphire",
        balance: "-1287.34"
      },
      {
        userId,
        accountType: "investment",
        accountName: "401(k)",
        institutionName: "Fidelity",
        balance: "45200.12"
      },
      {
        userId,
        accountType: "investment",
        accountName: "Roth IRA",
        institutionName: "Vanguard",
        balance: "22150.88"
      }
    ];

    const createdAccounts = [];
    for (const account of sampleAccounts) {
      const created = await storage.createAccount(account);
      createdAccounts.push(created);
    }
    
    return createdAccounts;
  }

  private async createSampleTransactions(accounts: any[]) {
    const categories = [
      { category: "Food & Dining", subcategory: "Groceries" },
      { category: "Food & Dining", subcategory: "Restaurants" },
      { category: "Transportation", subcategory: "Gas" },
      { category: "Transportation", subcategory: "Public Transport" },
      { category: "Shopping", subcategory: "Clothing" },
      { category: "Shopping", subcategory: "Electronics" },
      { category: "Entertainment", subcategory: "Streaming" },
      { category: "Entertainment", subcategory: "Movies" },
      { category: "Bills & Utilities", subcategory: "Electric" },
      { category: "Bills & Utilities", subcategory: "Internet" },
      { category: "Healthcare", subcategory: "Doctor" },
      { category: "Income", subcategory: "Salary" }
    ];

    const checkingAccount = accounts.find(a => a.accountType === "checking");
    if (!checkingAccount) return;

    // Generate transactions for the last 90 days
    const transactions: InsertTransaction[] = [];
    const today = new Date();
    
    // Add salary income
    for (let i = 1; i <= 3; i++) {
      const salaryDate = new Date(today);
      salaryDate.setDate(today.getDate() - (i * 30));
      
      transactions.push({
        accountId: checkingAccount.id,
        amount: "4250.00",
        description: "Salary Deposit - Acme Corp",
        category: "Income",
        subcategory: "Salary",
        transactionDate: salaryDate.toISOString().split('T')[0],
        isIncome: true
      });
    }

    // Add regular expenses
    for (let i = 0; i < 90; i++) {
      const transactionDate = new Date(today);
      transactionDate.setDate(today.getDate() - i);
      
      // Skip some days randomly
      if (Math.random() > 0.6) continue;
      
      const numTransactions = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numTransactions; j++) {
        const categoryData = categories[Math.floor(Math.random() * categories.length)];
        const isIncome = categoryData.category === "Income";
        
        let amount: string;
        let description: string;
        
        if (isIncome) {
          amount = (Math.random() * 1000 + 500).toFixed(2);
          description = "Income - " + categoryData.subcategory;
        } else {
          amount = "-" + (Math.random() * 200 + 10).toFixed(2);
          description = this.generateTransactionDescription(categoryData.category, categoryData.subcategory);
        }
        
        transactions.push({
          accountId: checkingAccount.id,
          amount,
          description,
          category: categoryData.category,
          subcategory: categoryData.subcategory,
          transactionDate: transactionDate.toISOString().split('T')[0],
          isIncome
        });
      }
    }

    // Create all transactions
    for (const transaction of transactions) {
      await storage.createTransaction(transaction);
    }
  }

  private generateTransactionDescription(category: string, subcategory: string): string {
    const descriptions: Record<string, Record<string, string[]>> = {
      "Food & Dining": {
        "Groceries": ["Whole Foods Market", "Safeway", "Trader Joe's", "Kroger"],
        "Restaurants": ["Chipotle", "Starbucks", "Olive Garden", "Local Bistro"]
      },
      "Transportation": {
        "Gas": ["Shell Gas Station", "Chevron", "BP", "Exxon"],
        "Public Transport": ["Metro Transit", "Bus Pass", "Uber", "Lyft"]
      },
      "Shopping": {
        "Clothing": ["Target", "Amazon", "Macy's", "Old Navy"],
        "Electronics": ["Best Buy", "Apple Store", "Amazon", "Newegg"]
      },
      "Entertainment": {
        "Streaming": ["Netflix", "Spotify", "Disney+", "Hulu"],
        "Movies": ["AMC Theaters", "Regal Cinemas", "Local Cinema"]
      },
      "Bills & Utilities": {
        "Electric": ["PG&E", "ConEd", "Duke Energy"],
        "Internet": ["Comcast", "Verizon", "AT&T"]
      },
      "Healthcare": {
        "Doctor": ["Primary Care", "Dentist", "Pharmacy", "Urgent Care"]
      }
    };

    const options = descriptions[category]?.[subcategory] || ["Generic Transaction"];
    return options[Math.floor(Math.random() * options.length)];
  }

  private async createSampleGoals(userId: string) {
    const sampleGoals: InsertGoal[] = [
      {
        userId,
        name: "Emergency Fund",
        targetAmount: "15000.00",
        currentAmount: "8500.00",
        targetDate: "2024-12-31",
        goalType: "emergency"
      },
      {
        userId,
        name: "House Down Payment",
        targetAmount: "80000.00",
        currentAmount: "32000.00",
        targetDate: "2025-08-31",
        goalType: "house"
      },
      {
        userId,
        name: "Retirement (401k)",
        targetAmount: "1000000.00",
        currentAmount: "45200.00",
        targetDate: "2055-12-31",
        goalType: "retirement"
      }
    ];

    for (const goal of sampleGoals) {
      await storage.createGoal(goal);
    }
  }

  private async createInvestmentRecommendations(userId: string) {
    const recommendations: InsertInvestmentRecommendation[] = [
      {
        userId,
        symbol: "VTI",
        name: "Vanguard Total Stock Market ETF",
        recommendedAllocation: "40.00",
        riskLevel: "low",
        expectedReturn: "7-10%",
        description: "Broad market exposure with low fees. Perfect for your moderate risk profile."
      },
      {
        userId,
        symbol: "AGG",
        name: "iShares Core U.S. Aggregate Bond ETF",
        recommendedAllocation: "30.00",
        riskLevel: "very_low",
        expectedReturn: "3-5%",
        description: "Stable bond fund to balance your portfolio and reduce volatility."
      },
      {
        userId,
        symbol: "VEA",
        name: "Vanguard FTSE Developed Markets ETF",
        recommendedAllocation: "20.00",
        riskLevel: "medium",
        expectedReturn: "6-9%",
        description: "International diversification to reduce portfolio risk."
      },
      {
        userId,
        symbol: "VWO",
        name: "Vanguard Emerging Markets Stock ETF",
        recommendedAllocation: "10.00",
        riskLevel: "high",
        expectedReturn: "8-12%",
        description: "Higher growth potential through emerging markets exposure."
      }
    ];

    for (const recommendation of recommendations) {
      await storage.createInvestmentRecommendation(recommendation);
    }
  }

  private async calculateFinancialHealth(userId: string) {
    // Get user's financial data
    const accounts = await storage.getUserAccounts(userId);
    const transactions = await storage.getUserTransactions(userId, 90);
    
    // Calculate net worth
    const netWorth = accounts.reduce((sum, account) => {
      return sum + parseFloat(account.balance);
    }, 0);

    // Calculate monthly income and expenses
    const recentTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transactionDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transactionDate >= thirtyDaysAgo;
    });

    const monthlyIncome = recentTransactions
      .filter(t => t.isIncome)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyExpenses = Math.abs(recentTransactions
      .filter(t => !t.isIncome)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0));

    // Calculate savings rate
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    // Simple debt calculation (negative balances)
    const totalDebt = Math.abs(accounts
      .filter(a => parseFloat(a.balance) < 0)
      .reduce((sum, a) => sum + parseFloat(a.balance), 0));

    const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;

    // Calculate health score (0-100)
    let healthScore = 50; // Base score
    
    // Net worth component (0-25 points)
    if (netWorth > 100000) healthScore += 25;
    else if (netWorth > 50000) healthScore += 20;
    else if (netWorth > 25000) healthScore += 15;
    else if (netWorth > 10000) healthScore += 10;
    else if (netWorth > 0) healthScore += 5;

    // Savings rate component (0-25 points)
    if (savingsRate > 20) healthScore += 25;
    else if (savingsRate > 15) healthScore += 20;
    else if (savingsRate > 10) healthScore += 15;
    else if (savingsRate > 5) healthScore += 10;
    else if (savingsRate > 0) healthScore += 5;

    // Debt component (0-25 points, inverse)
    if (debtToIncomeRatio < 10) healthScore += 25;
    else if (debtToIncomeRatio < 20) healthScore += 20;
    else if (debtToIncomeRatio < 30) healthScore += 15;
    else if (debtToIncomeRatio < 40) healthScore += 10;
    else if (debtToIncomeRatio < 50) healthScore += 5;

    // Emergency fund calculation
    const savingsAccounts = accounts.filter(a => a.accountType === 'savings');
    const emergencyFund = savingsAccounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
    const emergencyFundMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;

    const healthData: InsertFinancialHealth = {
      userId,
      healthScore: Math.min(100, Math.max(0, healthScore)),
      netWorth: netWorth.toFixed(2),
      monthlyIncome: monthlyIncome.toFixed(2),
      monthlyExpenses: monthlyExpenses.toFixed(2),
      savingsRate: savingsRate.toFixed(2),
      debtToIncomeRatio: debtToIncomeRatio.toFixed(2),
      creditScore: 720 + Math.floor(Math.random() * 80), // Mock credit score
      emergencyFundMonths: emergencyFundMonths.toFixed(1)
    };

    await storage.createFinancialHealth(healthData);
  }
}

export const mockDataService = new MockDataService();

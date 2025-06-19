import { storage } from '../storage';

// Simple ML-style transaction categorization service
// In production, this would use actual ML models like scikit-learn or TensorFlow.js

interface CategoryRule {
  keywords: string[];
  category: string;
  subcategory: string;
  confidence: number;
}

interface CategoryPrediction {
  category: string;
  subcategory: string;
  confidence: number;
}

class MLCategorizationService {
  private rules: CategoryRule[] = [
    // Food & Dining
    { keywords: ['starbucks', 'coffee', 'cafe', 'restaurant', 'pizza', 'mcdonalds', 'subway', 'chipotle', 'taco bell'], category: 'Food & Dining', subcategory: 'Restaurants', confidence: 0.9 },
    { keywords: ['grocery', 'supermarket', 'walmart', 'target', 'safeway', 'kroger', 'whole foods', 'trader joe'], category: 'Food & Dining', subcategory: 'Groceries', confidence: 0.95 },
    { keywords: ['bar', 'brewery', 'liquor', 'wine', 'beer'], category: 'Food & Dining', subcategory: 'Alcohol & Bars', confidence: 0.85 },
    
    // Transportation
    { keywords: ['uber', 'lyft', 'taxi', 'gas', 'shell', 'exxon', 'chevron', 'bp'], category: 'Transportation', subcategory: 'Gas & Fuel', confidence: 0.9 },
    { keywords: ['parking', 'metro', 'subway', 'bus', 'transit'], category: 'Transportation', subcategory: 'Public Transportation', confidence: 0.85 },
    
    // Shopping
    { keywords: ['amazon', 'ebay', 'best buy', 'apple store', 'clothing', 'fashion'], category: 'Shopping', subcategory: 'General', confidence: 0.8 },
    { keywords: ['home depot', 'lowes', 'ikea', 'furniture'], category: 'Shopping', subcategory: 'Home & Garden', confidence: 0.9 },
    
    // Bills & Utilities
    { keywords: ['electric', 'electricity', 'power', 'water', 'sewer', 'internet', 'phone', 'cell'], category: 'Bills & Utilities', subcategory: 'Utilities', confidence: 0.95 },
    { keywords: ['rent', 'mortgage', 'payment'], category: 'Bills & Utilities', subcategory: 'Rent & Mortgage', confidence: 0.9 },
    { keywords: ['insurance', 'premium'], category: 'Bills & Utilities', subcategory: 'Insurance', confidence: 0.9 },
    
    // Healthcare
    { keywords: ['doctor', 'medical', 'hospital', 'pharmacy', 'cvs', 'walgreens'], category: 'Healthcare', subcategory: 'Medical', confidence: 0.9 },
    { keywords: ['dental', 'dentist'], category: 'Healthcare', subcategory: 'Dental', confidence: 0.95 },
    
    // Entertainment
    { keywords: ['netflix', 'spotify', 'movie', 'theater', 'cinema', 'gym', 'fitness'], category: 'Entertainment', subcategory: 'Subscriptions', confidence: 0.9 },
    { keywords: ['concert', 'game', 'sports'], category: 'Entertainment', subcategory: 'Events', confidence: 0.8 },
    
    // Income
    { keywords: ['salary', 'payroll', 'wages', 'direct deposit'], category: 'Income', subcategory: 'Salary', confidence: 0.95 },
    { keywords: ['refund', 'cashback', 'rebate'], category: 'Income', subcategory: 'Refunds', confidence: 0.85 },
  ];

  async categorizeTransaction(description: string, amount: number): Promise<CategoryPrediction> {
    const normalizedDescription = description.toLowerCase();
    
    // Check for income indicators
    const isIncome = amount > 0 && this.hasIncomeKeywords(normalizedDescription);
    
    let bestMatch: CategoryPrediction = {
      category: 'Other',
      subcategory: 'General',
      confidence: 0.1
    };

    // Find the best matching rule
    for (const rule of this.rules) {
      for (const keyword of rule.keywords) {
        if (normalizedDescription.includes(keyword)) {
          if (rule.confidence > bestMatch.confidence) {
            bestMatch = {
              category: rule.category,
              subcategory: rule.subcategory,
              confidence: rule.confidence
            };
          }
        }
      }
    }

    // Override with income if detected
    if (isIncome) {
      const incomeRule = this.rules.find(r => r.category === 'Income');
      if (incomeRule) {
        bestMatch = {
          category: incomeRule.category,
          subcategory: incomeRule.subcategory,
          confidence: incomeRule.confidence
        };
      }
    }

    return bestMatch;
  }

  private hasIncomeKeywords(description: string): boolean {
    const incomeKeywords = ['salary', 'payroll', 'wages', 'direct deposit', 'income', 'payment'];
    return incomeKeywords.some(keyword => description.includes(keyword));
  }

  async batchCategorizeTransactions(userId: string): Promise<void> {
    try {
      // Get all uncategorized transactions (confidence = null)
      const transactions = await storage.getUserTransactions(userId);
      const uncategorizedTransactions = transactions.filter(t => !t.categoryConfidence);

      for (const transaction of uncategorizedTransactions) {
        const prediction = await this.categorizeTransaction(
          transaction.description, 
          parseFloat(transaction.amount)
        );

        // Update transaction with ML prediction
        await storage.updateTransactionCategory(
          transaction.id,
          prediction.category,
          prediction.subcategory,
          prediction.confidence
        );
      }
    } catch (error) {
      console.error('Error in batch categorization:', error);
      throw new Error('Failed to categorize transactions');
    }
  }

  // Anomaly detection - simple rule-based approach
  async detectAnomalies(userId: string): Promise<void> {
    try {
      const transactions = await storage.getUserTransactions(userId, undefined, 30);
      
      // Calculate spending patterns per category
      const categorySpending: Record<string, number[]> = {};
      
      transactions.forEach(t => {
        if (!t.isIncome) {
          const amount = Math.abs(parseFloat(t.amount));
          if (!categorySpending[t.category]) {
            categorySpending[t.category] = [];
          }
          categorySpending[t.category].push(amount);
        }
      });

      // Detect anomalies (transactions > 2 standard deviations from mean)
      for (const transaction of transactions) {
        if (!transaction.isIncome) {
          const amount = Math.abs(parseFloat(transaction.amount));
          const categoryAmounts = categorySpending[transaction.category] || [];
          
          if (categoryAmounts.length > 3) {
            const mean = categoryAmounts.reduce((sum, val) => sum + val, 0) / categoryAmounts.length;
            const variance = categoryAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / categoryAmounts.length;
            const stdDev = Math.sqrt(variance);
            
            const anomalyScore = Math.abs(amount - mean) / (stdDev || 1);
            const isAnomaly = anomalyScore > 2; // 2 standard deviations
            
            if (isAnomaly || anomalyScore > 1.5) {
              await storage.updateTransactionAnomaly(
                transaction.id,
                isAnomaly,
                anomalyScore
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in anomaly detection:', error);
      throw new Error('Failed to detect anomalies');
    }
  }
}

export const mlCategorizationService = new MLCategorizationService();

import { storage } from '../storage';

// Enhanced ML-style transaction categorization with advanced features
interface TransactionPattern {
  keywords: string[];
  category: string;
  subcategory: string;
  confidence: number;
  merchantPatterns?: string[];
  amountRange?: { min?: number; max?: number };
  timePatterns?: string[]; // "weekend", "weekday", "evening", etc.
}

interface CategoryPrediction {
  category: string;
  subcategory: string;
  confidence: number;
  reasoning: string[];
}

interface UserSpendingProfile {
  userId: string;
  categoryFrequency: Record<string, number>;
  averageAmounts: Record<string, number>;
  timePatterns: Record<string, number[]>; // hour of day patterns
  merchantPreferences: Record<string, number>;
  lastUpdated: Date;
}

class AdvancedMLCategorizationService {
  private patterns: TransactionPattern[] = [
    // Enhanced Food & Dining patterns
    { 
      keywords: ['starbucks', 'coffee', 'cafe', 'espresso', 'latte'], 
      category: 'Food & Dining', 
      subcategory: 'Coffee Shops', 
      confidence: 0.95,
      amountRange: { min: 1, max: 20 }
    },
    { 
      keywords: ['restaurant', 'pizza', 'burger', 'sushi', 'diner', 'bistro'], 
      category: 'Food & Dining', 
      subcategory: 'Restaurants', 
      confidence: 0.9,
      amountRange: { min: 10, max: 200 }
    },
    { 
      keywords: ['grocery', 'supermarket', 'walmart', 'target', 'safeway', 'kroger', 'whole foods', 'trader joe'], 
      category: 'Food & Dining', 
      subcategory: 'Groceries', 
      confidence: 0.95,
      amountRange: { min: 20, max: 500 }
    },
    { 
      keywords: ['bar', 'brewery', 'liquor', 'wine', 'beer', 'pub'], 
      category: 'Food & Dining', 
      subcategory: 'Alcohol & Bars', 
      confidence: 0.9,
      timePatterns: ['evening', 'weekend']
    },

    // Enhanced Transportation patterns
    { 
      keywords: ['uber', 'lyft', 'taxi', 'rideshare'], 
      category: 'Transportation', 
      subcategory: 'Rideshare', 
      confidence: 0.95,
      amountRange: { min: 5, max: 100 }
    },
    { 
      keywords: ['gas', 'shell', 'exxon', 'chevron', 'bp', 'mobil', 'fuel'], 
      category: 'Transportation', 
      subcategory: 'Gas & Fuel', 
      confidence: 0.95,
      amountRange: { min: 20, max: 150 }
    },
    { 
      keywords: ['parking', 'meter', 'garage'], 
      category: 'Transportation', 
      subcategory: 'Parking', 
      confidence: 0.9,
      amountRange: { min: 1, max: 50 }
    },

    // Enhanced Shopping patterns
    { 
      keywords: ['amazon', 'amzn'], 
      category: 'Shopping', 
      subcategory: 'Online Shopping', 
      confidence: 0.95 
    },
    { 
      keywords: ['apple store', 'best buy', 'electronics'], 
      category: 'Shopping', 
      subcategory: 'Electronics', 
      confidence: 0.9,
      amountRange: { min: 50, max: 5000 }
    },
    { 
      keywords: ['clothing', 'fashion', 'h&m', 'zara', 'nike', 'adidas'], 
      category: 'Shopping', 
      subcategory: 'Clothing', 
      confidence: 0.85 
    },

    // Enhanced Bills & Utilities
    { 
      keywords: ['electric', 'electricity', 'power', 'pge', 'edison'], 
      category: 'Bills & Utilities', 
      subcategory: 'Electricity', 
      confidence: 0.95,
      amountRange: { min: 50, max: 500 }
    },
    { 
      keywords: ['internet', 'wifi', 'comcast', 'verizon', 'att'], 
      category: 'Bills & Utilities', 
      subcategory: 'Internet', 
      confidence: 0.95 
    },
    { 
      keywords: ['phone', 'cell', 'mobile', 'tmobile', 'sprint'], 
      category: 'Bills & Utilities', 
      subcategory: 'Phone', 
      confidence: 0.9 
    },

    // Enhanced Healthcare
    { 
      keywords: ['doctor', 'medical', 'hospital', 'clinic'], 
      category: 'Healthcare', 
      subcategory: 'Medical Services', 
      confidence: 0.9 
    },
    { 
      keywords: ['pharmacy', 'cvs', 'walgreens', 'prescription'], 
      category: 'Healthcare', 
      subcategory: 'Pharmacy', 
      confidence: 0.95 
    },

    // Income patterns
    { 
      keywords: ['salary', 'payroll', 'wages', 'direct deposit', 'paycheck'], 
      category: 'Income', 
      subcategory: 'Salary', 
      confidence: 0.95 
    },
    { 
      keywords: ['freelance', 'contractor', 'consulting'], 
      category: 'Income', 
      subcategory: 'Freelance', 
      confidence: 0.85 
    }
  ];

  private userProfiles: Map<string, UserSpendingProfile> = new Map();

  async categorizeTransaction(
    description: string, 
    amount: number, 
    userId: string,
    transactionDate: string,
    merchantName?: string
  ): Promise<CategoryPrediction> {
    const normalizedDescription = description.toLowerCase();
    const absAmount = Math.abs(amount);
    const isIncome = amount > 0;
    const reasoning: string[] = [];

    // Get user's spending profile
    const userProfile = await this.getUserProfile(userId);

    let bestMatch: CategoryPrediction = {
      category: 'Other',
      subcategory: 'General',
      confidence: 0.1,
      reasoning: ['Default categorization']
    };

    // Check for income indicators first
    if (isIncome) {
      const incomePattern = this.patterns.find(p => p.category === 'Income');
      if (incomePattern && this.hasIncomeKeywords(normalizedDescription)) {
        return {
          category: incomePattern.category,
          subcategory: incomePattern.subcategory,
          confidence: incomePattern.confidence,
          reasoning: ['Income detected from description keywords']
        };
      }
    }

    // Find the best matching pattern
    for (const pattern of this.patterns) {
      let patternScore = 0;
      const patternReasons: string[] = [];

      // Keyword matching
      for (const keyword of pattern.keywords) {
        if (normalizedDescription.includes(keyword)) {
          patternScore += 0.4;
          patternReasons.push(`Keyword match: "${keyword}"`);
          break; // Only count one keyword match per pattern
        }
      }

      // Amount range matching
      if (pattern.amountRange) {
        const { min = 0, max = Infinity } = pattern.amountRange;
        if (absAmount >= min && absAmount <= max) {
          patternScore += 0.2;
          patternReasons.push(`Amount in expected range ($${min}-$${max})`);
        }
      }

      // User profile matching
      if (userProfile) {
        const categoryFreq = userProfile.categoryFrequency[pattern.category] || 0;
        if (categoryFreq > 0) {
          patternScore += Math.min(categoryFreq / 100, 0.2);
          patternReasons.push(`User frequency for ${pattern.category}: ${categoryFreq}%`);
        }
      }

      // Merchant pattern matching
      if (pattern.merchantPatterns && merchantName) {
        for (const merchantPattern of pattern.merchantPatterns) {
          if (merchantName.toLowerCase().includes(merchantPattern)) {
            patternScore += 0.3;
            patternReasons.push(`Merchant pattern match: "${merchantPattern}"`);
            break;
          }
        }
      }

      // Time pattern matching
      if (pattern.timePatterns) {
        const transactionTime = new Date(transactionDate);
        const hour = transactionTime.getHours();
        const dayOfWeek = transactionTime.getDay();
        
        for (const timePattern of pattern.timePatterns) {
          if (timePattern === 'weekend' && (dayOfWeek === 0 || dayOfWeek === 6)) {
            patternScore += 0.1;
            patternReasons.push('Weekend transaction pattern');
          } else if (timePattern === 'evening' && hour >= 18) {
            patternScore += 0.1;
            patternReasons.push('Evening transaction pattern');
          } else if (timePattern === 'weekday' && dayOfWeek >= 1 && dayOfWeek <= 5) {
            patternScore += 0.1;
            patternReasons.push('Weekday transaction pattern');
          }
        }
      }

      // Calculate final confidence
      const finalConfidence = Math.min(pattern.confidence * patternScore, 0.95);

      if (finalConfidence > bestMatch.confidence) {
        bestMatch = {
          category: pattern.category,
          subcategory: pattern.subcategory,
          confidence: finalConfidence,
          reasoning: patternReasons
        };
      }
    }

    // Update user profile
    await this.updateUserProfile(userId, bestMatch.category, absAmount);

    return bestMatch;
  }

  async getUserProfile(userId: string): Promise<UserSpendingProfile | null> {
    // In a real implementation, this would fetch from database
    // For now, return cached profile or null
    return this.userProfiles.get(userId) || null;
  }

  async updateUserProfile(userId: string, category: string, amount: number): Promise<void> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        categoryFrequency: {},
        averageAmounts: {},
        timePatterns: {},
        merchantPreferences: {},
        lastUpdated: new Date()
      };
    }

    // Update category frequency
    profile.categoryFrequency[category] = (profile.categoryFrequency[category] || 0) + 1;

    // Update average amounts
    const currentAvg = profile.averageAmounts[category] || 0;
    const currentCount = profile.categoryFrequency[category];
    profile.averageAmounts[category] = (currentAvg * (currentCount - 1) + amount) / currentCount;

    profile.lastUpdated = new Date();
    this.userProfiles.set(userId, profile);

    // In a real implementation, save to database
  }

  private hasIncomeKeywords(description: string): boolean {
    const incomeKeywords = [
      'salary', 'payroll', 'wages', 'direct deposit', 'income', 
      'payment', 'refund', 'cashback', 'rebate', 'dividend',
      'interest', 'bonus', 'commission', 'freelance'
    ];
    return incomeKeywords.some(keyword => description.includes(keyword));
  }

  async batchCategorizeTransactions(userId: string): Promise<void> {
    try {
      // Get all uncategorized transactions
      const transactions = await storage.getUserTransactions(userId);
      const uncategorizedTransactions = transactions.filter(t => !t.categoryConfidence);

      console.log(`[ML] Processing ${uncategorizedTransactions.length} transactions for user ${userId}`);

      for (const transaction of uncategorizedTransactions) {
        const prediction = await this.categorizeTransaction(
          transaction.description,
          parseFloat(transaction.amount),
          userId,
          transaction.transactionDate.toString(),
          transaction.description // Using description as merchant name for now
        );

        // Update transaction with ML prediction
        await storage.updateTransactionCategory(
          transaction.id,
          prediction.category,
          prediction.subcategory,
          prediction.confidence
        );

        // Log detailed reasoning for high-confidence predictions
        if (prediction.confidence > 0.8) {
          console.log(`[ML] High confidence categorization: "${transaction.description}" -> ${prediction.category}/${prediction.subcategory} (${prediction.confidence.toFixed(2)})`);
          console.log(`[ML] Reasoning: ${prediction.reasoning.join(', ')}`);
        }
      }

      console.log(`[ML] Completed categorization for user ${userId}`);
    } catch (error) {
      console.error('Error in batch categorization:', error);
      throw new Error('Failed to categorize transactions');
    }
  }

  // Enhanced anomaly detection with user-specific baselines
  async detectAnomalies(userId: string): Promise<void> {
    try {
      const transactions = await storage.getUserTransactions(userId, undefined, 90); // Last 90 days
      const userProfile = await this.getUserProfile(userId);
      
      console.log(`[ML] Running anomaly detection for ${transactions.length} transactions`);

      // Group transactions by category for analysis
      const categoryGroups: Record<string, { amounts: number[]; descriptions: string[] }> = {};
      
      transactions.forEach(t => {
        if (!t.isIncome) {
          const amount = Math.abs(parseFloat(t.amount));
          if (!categoryGroups[t.category]) {
            categoryGroups[t.category] = { amounts: [], descriptions: [] };
          }
          categoryGroups[t.category].amounts.push(amount);
          categoryGroups[t.category].descriptions.push(t.description);
        }
      });

      // Detect anomalies for each category
      for (const transaction of transactions) {
        if (!transaction.isIncome) {
          const amount = Math.abs(parseFloat(transaction.amount));
          const categoryData = categoryGroups[transaction.category];
          
          if (categoryData && categoryData.amounts.length > 3) {
            const amounts = categoryData.amounts;
            const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
            const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
            const stdDev = Math.sqrt(variance);
            
            if (stdDev > 0) {
              const zScore = Math.abs(amount - mean) / stdDev;
              const isAnomaly = zScore > 2.5; // More strict threshold
              
              // Additional checks for anomalies
              let anomalyReasons: string[] = [];
              
              if (zScore > 2.5) {
                anomalyReasons.push(`Amount ${zScore.toFixed(1)} standard deviations from mean`);
              }
              
              // Check if it's unusually large for the category
              if (amount > mean * 3) {
                anomalyReasons.push(`Amount is 3x higher than average for ${transaction.category}`);
              }
              
              // Check against user's historical patterns
              if (userProfile && userProfile.averageAmounts[transaction.category]) {
                const userAvg = userProfile.averageAmounts[transaction.category];
                if (amount > userAvg * 2.5) {
                  anomalyReasons.push(`Amount exceeds user's typical spending by 2.5x`);
                }
              }
              
              if (isAnomaly || anomalyReasons.length > 0) {
                await storage.updateTransactionAnomaly(
                  transaction.id,
                  isAnomaly,
                  zScore
                );
                
                if (isAnomaly) {
                  console.log(`[ML] Anomaly detected: "${transaction.description}" - $${amount} (z-score: ${zScore.toFixed(2)})`);
                  console.log(`[ML] Reasons: ${anomalyReasons.join(', ')}`);
                }
              }
            }
          }
        }
      }

      console.log(`[ML] Anomaly detection completed for user ${userId}`);
    } catch (error) {
      console.error('Error in anomaly detection:', error);
      throw new Error('Failed to detect anomalies');
    }
  }

  // Generate spending insights based on categorized data
  async generateSpendingInsights(userId: string): Promise<any[]> {
    try {
      const transactions = await storage.getUserTransactions(userId, undefined, 30);
      const insights: any[] = [];

      // Category spending analysis
      const categoryTotals: Record<string, number> = {};
      transactions.forEach(t => {
        if (!t.isIncome) {
          const amount = Math.abs(parseFloat(t.amount));
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
        }
      });

      // Find top spending categories
      const sortedCategories = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      sortedCategories.forEach(([category, amount], index) => {
        insights.push({
          type: 'category_spending',
          title: `#${index + 1} Spending Category`,
          description: `You spent $${amount.toFixed(2)} on ${category} this month`,
          category,
          amount,
          rank: index + 1
        });
      });

      return insights;
    } catch (error) {
      console.error('Error generating spending insights:', error);
      return [];
    }
  }
}

export const advancedMLCategorizationService = new AdvancedMLCategorizationService();

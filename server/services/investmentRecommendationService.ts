import { storage } from '../storage';

interface Portfolio {
  stocks: number;
  bonds: number;
  international: number;
  realEstate: number;
  cash: number;
}

interface InvestmentRecommendation {
  symbol: string;
  name: string;
  type: 'ETF' | 'Stock' | 'Bond' | 'REIT';
  allocation: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: string;
  description: string;
  reasonCode: string;
}

interface RiskProfile {
  score: number; // 1-100
  tolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: number; // years
  experience: 'beginner' | 'intermediate' | 'advanced';
}

class InvestmentRecommendationService {
  
  async generateRecommendations(userId: string): Promise<InvestmentRecommendation[]> {
    try {
      const [riskProfile, financialHealth] = await Promise.all([
        this.assessRiskProfile(userId),
        storage.getLatestFinancialHealth(userId)
      ]);

      const portfolio = this.calculateOptimalPortfolio(riskProfile, financialHealth);
      const recommendations = this.generateSpecificRecommendations(portfolio, riskProfile);

      // Store recommendations in database
      for (const rec of recommendations) {
        await storage.createInvestmentRecommendation({
          userId,
          symbol: rec.symbol,
          name: rec.name,
          recommendedAllocation: rec.allocation.toString(),
          riskLevel: rec.riskLevel,
          expectedReturn: rec.expectedReturn,
          description: rec.description,
          isActive: true
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating investment recommendations:', error);
      throw new Error('Failed to generate investment recommendations');
    }
  }

  private async assessRiskProfile(userId: string): Promise<RiskProfile> {
    // In a real implementation, this would be based on a questionnaire
    // For now, we'll use a simplified assessment based on financial health
    
    const financialHealth = await storage.getLatestFinancialHealth(userId);
    if (!financialHealth) {
      return {
        score: 30,
        tolerance: 'conservative',
        timeHorizon: 5,
        experience: 'beginner'
      };
    }

    const savingsRate = parseFloat(financialHealth.savingsRate);
    const emergencyFund = parseFloat(financialHealth.emergencyFundMonths || '0');
    const debtRatio = parseFloat(financialHealth.debtToIncomeRatio);

    let riskScore = 0;

    // Base score on financial stability
    if (emergencyFund >= 6) riskScore += 25;
    else if (emergencyFund >= 3) riskScore += 15;
    else if (emergencyFund >= 1) riskScore += 5;

    if (savingsRate >= 20) riskScore += 25;
    else if (savingsRate >= 15) riskScore += 20;
    else if (savingsRate >= 10) riskScore += 10;

    if (debtRatio < 10) riskScore += 25;
    else if (debtRatio < 20) riskScore += 15;
    else if (debtRatio < 30) riskScore += 5;

    // Age-based time horizon (mock data)
    const timeHorizon = 30; // Assume 30-year investment horizon

    if (timeHorizon > 20) riskScore += 25;
    else if (timeHorizon > 10) riskScore += 15;
    else if (timeHorizon > 5) riskScore += 10;

    let tolerance: 'conservative' | 'moderate' | 'aggressive';
    if (riskScore >= 75) tolerance = 'aggressive';
    else if (riskScore >= 50) tolerance = 'moderate';
    else tolerance = 'conservative';

    return {
      score: riskScore,
      tolerance,
      timeHorizon,
      experience: riskScore > 60 ? 'intermediate' : 'beginner'
    };
  }

  private calculateOptimalPortfolio(riskProfile: RiskProfile, financialHealth: any): Portfolio {
    const basePortfolios = {
      conservative: { stocks: 30, bonds: 50, international: 10, realEstate: 5, cash: 5 },
      moderate: { stocks: 60, bonds: 25, international: 10, realEstate: 5, cash: 0 },
      aggressive: { stocks: 80, bonds: 5, international: 10, realEstate: 5, cash: 0 }
    };

    let portfolio = { ...basePortfolios[riskProfile.tolerance] };

    // Adjust based on age/time horizon
    if (riskProfile.timeHorizon < 10) {
      portfolio.bonds += 10;
      portfolio.stocks -= 10;
    } else if (riskProfile.timeHorizon > 25) {
      portfolio.stocks += 10;
      portfolio.bonds -= 10;
    }

    // Adjust based on emergency fund
    if (financialHealth && parseFloat(financialHealth.emergencyFundMonths || '0') < 3) {
      portfolio.cash += 10;
      portfolio.stocks -= 10;
    }

    return portfolio;
  }

  private generateSpecificRecommendations(portfolio: Portfolio, riskProfile: RiskProfile): InvestmentRecommendation[] {
    const recommendations: InvestmentRecommendation[] = [];

    // Stock recommendations
    if (portfolio.stocks > 0) {
      if (riskProfile.tolerance === 'aggressive') {
        recommendations.push({
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          type: 'ETF',
          allocation: portfolio.stocks * 0.7,
          riskLevel: 'high',
          expectedReturn: '8-10%',
          description: 'Low-cost total market exposure with strong long-term growth potential',
          reasonCode: 'aggressive_growth'
        });
        recommendations.push({
          symbol: 'VXUS',
          name: 'Vanguard Total International Stock ETF',
          type: 'ETF',
          allocation: portfolio.stocks * 0.3,
          riskLevel: 'high',
          expectedReturn: '7-9%',
          description: 'International diversification for global growth exposure',
          reasonCode: 'international_diversification'
        });
      } else {
        recommendations.push({
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          type: 'ETF',
          allocation: portfolio.stocks,
          riskLevel: 'medium',
          expectedReturn: '7-9%',
          description: 'Broad market exposure suitable for moderate risk tolerance',
          reasonCode: 'balanced_growth'
        });
      }
    }

    // Bond recommendations
    if (portfolio.bonds > 0) {
      recommendations.push({
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        type: 'ETF',
        allocation: portfolio.bonds,
        riskLevel: 'low',
        expectedReturn: '3-5%',
        description: 'Stable income and capital preservation through diversified bonds',
        reasonCode: 'stability_income'
      });
    }

    // International exposure
    if (portfolio.international > 0 && riskProfile.tolerance !== 'aggressive') {
      recommendations.push({
        symbol: 'VTIAX',
        name: 'Vanguard Total International Stock Index',
        type: 'ETF',
        allocation: portfolio.international,
        riskLevel: 'medium',
        expectedReturn: '6-8%',
        description: 'International diversification to reduce domestic market risk',
        reasonCode: 'geographic_diversification'
      });
    }

    // Real Estate
    if (portfolio.realEstate > 0) {
      recommendations.push({
        symbol: 'VNQ',
        name: 'Vanguard Real Estate ETF',
        type: 'REIT',
        allocation: portfolio.realEstate,
        riskLevel: 'medium',
        expectedReturn: '5-7%',
        description: 'Real estate exposure for inflation protection and diversification',
        reasonCode: 'inflation_hedge'
      });
    }

    return recommendations;
  }

  async rebalancePortfolio(userId: string): Promise<string[]> {
    try {
      const currentRecommendations = await storage.getUserInvestmentRecommendations(userId);
      const financialHealth = await storage.getLatestFinancialHealth(userId);
      
      if (!financialHealth) {
        return ['Complete your financial profile for rebalancing recommendations'];
      }

      const rebalanceActions: string[] = [];
      const totalValue = parseFloat(financialHealth.netWorth);
      
      // Calculate current allocation vs recommended
      for (const recommendation of currentRecommendations) {
        const currentAllocation = parseFloat(recommendation.recommendedAllocation);
        const targetValue = (currentAllocation / 100) * totalValue;
        
        // Mock current holdings value (in real app, this would come from brokerage API)
        const currentValue = targetValue * (0.8 + Math.random() * 0.4); // ±20% variance
        
        const difference = Math.abs(currentValue - targetValue);
        const percentDifference = (difference / targetValue) * 100;
        
        if (percentDifference > 5) { // Rebalance if >5% off target
          if (currentValue > targetValue) {
            rebalanceActions.push(`Sell $${difference.toFixed(0)} of ${recommendation.symbol} to rebalance`);
          } else {
            rebalanceActions.push(`Buy $${difference.toFixed(0)} of ${recommendation.symbol} to rebalance`);
          }
        }
      }

      if (rebalanceActions.length === 0) {
        rebalanceActions.push('Your portfolio is well-balanced. No rebalancing needed at this time.');
      }

      return rebalanceActions;
    } catch (error) {
      console.error('Error in portfolio rebalancing:', error);
      return ['Unable to generate rebalancing recommendations at this time'];
    }
  }

  async getMarketInsights(): Promise<string[]> {
    // Mock market insights (in production, integrate with financial news APIs)
    const insights = [
      'Current market volatility suggests maintaining diversified positions',
      'Bond yields are rising, consider ladder strategies for fixed income',
      'International markets are showing relative strength vs domestic',
      'REITs may provide inflation protection in current economic environment',
      'Technology sector rotation creating opportunities in value stocks'
    ];

    // Return random subset of insights
    return insights.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
}

export const investmentRecommendationService = new InvestmentRecommendationService();

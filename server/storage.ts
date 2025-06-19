import {
  users,
  accounts,
  transactions,
  goals,
  investmentRecommendations,
  financialHealth,
  type User,
  type UpsertUser,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type Goal,
  type InsertGoal,
  type InvestmentRecommendation,
  type InsertInvestmentRecommendation,
  type FinancialHealth,
  type InsertFinancialHealth,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Account operations
  getUserAccounts(userId: string): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(accountId: number, balance: string): Promise<void>;
  
  // Transaction operations
  getUserTransactions(userId: string, limit?: number, days?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionByPlaidId(plaidTransactionId: string): Promise<Transaction | undefined>;
  updateTransactionCategory(transactionId: number, category: string, subcategory: string, confidence: number): Promise<void>;
  updateTransactionAnomaly(transactionId: number, isAnomaly: boolean, anomalyScore: number): Promise<void>;
  
  // Goal operations
  getUserGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  
  // Investment recommendation operations
  getUserInvestmentRecommendations(userId: string): Promise<InvestmentRecommendation[]>;
  createInvestmentRecommendation(recommendation: InsertInvestmentRecommendation): Promise<InvestmentRecommendation>;
  
  // Financial health operations
  getLatestFinancialHealth(userId: string): Promise<FinancialHealth | undefined>;
  createFinancialHealth(health: InsertFinancialHealth): Promise<FinancialHealth>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Account operations
  async getUserAccounts(userId: string): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [created] = await db.insert(accounts).values(account).returning();
    return created;
  }

  async updateAccountBalance(accountId: number, balance: string): Promise<void> {
    await db
      .update(accounts)
      .set({ balance, updatedAt: new Date() })
      .where(eq(accounts.id, accountId));
  }

  // Transaction operations
  async getUserTransactions(userId: string, limit?: number, days?: number): Promise<Transaction[]> {
    let whereConditions = [eq(accounts.userId, userId)];

    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      whereConditions.push(gte(transactions.transactionDate, cutoffDate.toISOString().split('T')[0]));
    }

    let query = db
      .select({
        id: transactions.id,
        accountId: transactions.accountId,
        amount: transactions.amount,
        description: transactions.description,
        category: transactions.category,
        subcategory: transactions.subcategory,
        transactionDate: transactions.transactionDate,
        isIncome: transactions.isIncome,
        createdAt: transactions.createdAt,
        plaidTransactionId: transactions.plaidTransactionId,
        categoryConfidence: transactions.categoryConfidence,
        isAnomaly: transactions.isAnomaly,
        anomalyScore: transactions.anomalyScore,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(...whereConditions))
      .orderBy(desc(transactions.transactionDate));

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async getTransactionByPlaidId(plaidTransactionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.plaidTransactionId, plaidTransactionId));
    return transaction;
  }

  async updateTransactionCategory(transactionId: number, category: string, subcategory: string, confidence: number): Promise<void> {
    await db
      .update(transactions)
      .set({ 
        category, 
        subcategory, 
        categoryConfidence: confidence.toString() 
      })
      .where(eq(transactions.id, transactionId));
  }

  async updateTransactionAnomaly(transactionId: number, isAnomaly: boolean, anomalyScore: number): Promise<void> {
    await db
      .update(transactions)
      .set({ 
        isAnomaly, 
        anomalyScore: anomalyScore.toString() 
      })
      .where(eq(transactions.id, transactionId));
  }

  // Goal operations
  async getUserGoals(userId: string): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [created] = await db.insert(goals).values(goal).returning();
    return created;
  }

  // Investment recommendation operations
  async getUserInvestmentRecommendations(userId: string): Promise<InvestmentRecommendation[]> {
    return await db
      .select()
      .from(investmentRecommendations)
      .where(eq(investmentRecommendations.userId, userId));
  }

  async createInvestmentRecommendation(recommendation: InsertInvestmentRecommendation): Promise<InvestmentRecommendation> {
    const [created] = await db
      .insert(investmentRecommendations)
      .values(recommendation)
      .returning();
    return created;
  }

  // Financial health operations
  async getLatestFinancialHealth(userId: string): Promise<FinancialHealth | undefined> {
    const [latest] = await db
      .select()
      .from(financialHealth)
      .where(eq(financialHealth.userId, userId))
      .orderBy(desc(financialHealth.calculatedAt))
      .limit(1);
    return latest;
  }

  async createFinancialHealth(health: InsertFinancialHealth): Promise<FinancialHealth> {
    const [created] = await db.insert(financialHealth).values(health).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
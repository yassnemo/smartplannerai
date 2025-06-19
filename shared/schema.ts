import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for authentication)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial accounts linked to users
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountType: varchar("account_type").notNull(), // checking, savings, credit, investment
  accountName: varchar("account_name").notNull(),
  institutionName: varchar("institution_name").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  // Plaid integration fields
  plaidAccountId: varchar("plaid_account_id"),
  plaidAccessToken: varchar("plaid_access_token"),
  plaidItemId: varchar("plaid_item_id"),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions for each account
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  subcategory: varchar("subcategory"),
  transactionDate: date("transaction_date").notNull(),
  isIncome: boolean("is_income").default(false),
  // Plaid integration fields
  plaidTransactionId: varchar("plaid_transaction_id"),
  // ML categorization fields
  categoryConfidence: decimal("category_confidence", { precision: 3, scale: 2 }),
  isAnomaly: boolean("is_anomaly").default(false),
  anomalyScore: decimal("anomaly_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial goals
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0"),
  targetDate: date("target_date"),
  goalType: varchar("goal_type").notNull(), // emergency, house, retirement, vacation, etc.
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investment recommendations
export const investmentRecommendations = pgTable("investment_recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  symbol: varchar("symbol").notNull(),
  name: text("name").notNull(),
  recommendedAllocation: decimal("recommended_allocation", { precision: 5, scale: 2 }).notNull(),
  riskLevel: varchar("risk_level").notNull(), // low, medium, high
  expectedReturn: varchar("expected_return").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial health metrics
export const financialHealth = pgTable("financial_health", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  healthScore: integer("health_score").notNull(),
  netWorth: decimal("net_worth", { precision: 12, scale: 2 }).notNull(),
  monthlyIncome: decimal("monthly_income", { precision: 12, scale: 2 }).notNull(),
  monthlyExpenses: decimal("monthly_expenses", { precision: 12, scale: 2 }).notNull(),
  savingsRate: decimal("savings_rate", { precision: 5, scale: 2 }).notNull(),
  debtToIncomeRatio: decimal("debt_to_income_ratio", { precision: 5, scale: 2 }).notNull(),
  creditScore: integer("credit_score"),
  emergencyFundMonths: decimal("emergency_fund_months", { precision: 4, scale: 1 }),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  goals: many(goals),
  investmentRecommendations: many(investmentRecommendations),
  financialHealth: many(financialHealth),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

export const investmentRecommendationsRelations = relations(investmentRecommendations, ({ one }) => ({
  user: one(users, { fields: [investmentRecommendations.userId], references: [users.id] }),
}));

export const financialHealthRelations = relations(financialHealth, ({ one }) => ({
  user: one(users, { fields: [financialHealth.userId], references: [users.id] }),
}));

// Schemas
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestmentRecommendationSchema = createInsertSchema(investmentRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialHealthSchema = createInsertSchema(financialHealth).omit({
  id: true,
  calculatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InvestmentRecommendation = typeof investmentRecommendations.$inferSelect;
export type InsertInvestmentRecommendation = z.infer<typeof insertInvestmentRecommendationSchema>;
export type FinancialHealth = typeof financialHealth.$inferSelect;
export type InsertFinancialHealth = z.infer<typeof insertFinancialHealthSchema>;

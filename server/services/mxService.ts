import { storage } from '../storage';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

interface MXConfig {
  clientId: string;
  apiKey: string;
  environment: string;
  baseUrl: string;
}

interface MXUser {
  guid: string;
  id: string;
  is_disabled: boolean;
  metadata?: string;
}

interface MXMember {
  guid: string;
  connection_status: string;
  id: string;
  institution_code: string;
  name: string;
  oauth_window_uri?: string;
  user_guid: string;
}

interface MXAccount {
  account_number: string;
  account_type: string;
  available_balance: number;
  balance: number;
  created_at: string;
  currency_code: string;
  guid: string;
  id: string;
  institution_code: string;
  member_guid: string;
  name: string;
  nickname?: string;
  routing_number?: string;
  subtype: string;
  type: string;
  updated_at: string;
  user_guid: string;
}

interface MXTransaction {
  account_guid: string;
  account_id: string;
  amount: number;
  category: string;
  check_number_string?: string;
  created_at: string;
  currency_code: string;
  date: string;
  description: string;
  guid: string;
  id: string;
  is_bill_pay: boolean;
  is_direct_deposit: boolean;
  is_expense: boolean;
  is_fee: boolean;
  is_income: boolean;
  is_international: boolean;
  is_overdraft_fee: boolean;
  is_payroll_advance: boolean;
  latitude?: number;
  longitude?: number;
  member_guid: string;
  memo?: string;
  merchant_category_code?: number;
  merchant_guid?: string;
  original_description: string;
  posted_at?: string;
  status: string;
  top_level_category: string;
  transacted_at: string;
  type: string;
  updated_at: string;
  user_guid: string;
}

class MXService {
  private config: MXConfig;
  private client: AxiosInstance;
  private encryptionKey: string;

  constructor() {
    this.config = {
      clientId: process.env.MX_CLIENT_ID || '',
      apiKey: process.env.MX_API_KEY || '',
      environment: process.env.MX_ENV || 'sandbox',
      baseUrl: process.env.MX_ENV === 'production' 
        ? 'https://api.mx.com' 
        : 'https://int-api.mx.com'
    };

    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

    // Initialize HTTP client with authentication
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      auth: {
        username: this.config.clientId,
        password: this.config.apiKey
      },
      headers: {
        'Accept': 'application/vnd.mx.api.v1+json',
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[MX] API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[MX] Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[MX] API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`[MX] Response Error: ${error.response?.status} ${error.response?.statusText}`);
        return Promise.reject(error);
      }
    );
  }

  // Create or get MX user
  async createUser(userId: string): Promise<MXUser> {
    try {
      if (!this.config.clientId || !this.config.apiKey) {
        console.warn('MX credentials not configured, using mock user');
        return {
          guid: `mock_user_${userId}`,
          id: userId,
          is_disabled: false,
          metadata: 'mock_user'
        };
      }

      // Try to get existing user first
      try {
        const response = await this.client.get(`/users/${userId}`);
        return response.data.user;
      } catch (error) {
        // User doesn't exist, create new one
        console.log(`[MX] Creating new user for ${userId}`);
      }

      const response = await this.client.post('/users', {
        user: {
          id: userId,
          metadata: `SmartPlannerAI_${userId}`
        }
      });

      console.log(`[MX] User created successfully: ${response.data.user.guid}`);
      return response.data.user;
    } catch (error: any) {
      console.error('Error creating MX user:', error.response?.data || error.message);
      
      // Return mock user for development
      return {
        guid: `mock_user_${userId}`,
        id: userId,
        is_disabled: false,
        metadata: 'mock_user'
      };
    }
  }

  // Get widget URL for account connection
  async getConnectWidgetUrl(userId: string): Promise<string> {
    try {
      if (!this.config.clientId || !this.config.apiKey) {
        console.warn('MX credentials not configured, returning mock widget URL');
        return `https://int-widgets.moneydesktop.com/md/connect/${userId}?color_scheme=light`;
      }

      // Ensure user exists
      const user = await this.createUser(userId);

      // Create widget request
      const response = await this.client.post(`/users/${user.guid}/widget_urls`, {
        widget_url: {
          widget_type: 'connect_widget',
          color_scheme: 'light',
          include_transactions: true,
          is_mobile_webview: false,
          mode: 'aggregation',
          ui_message_version: 4,
          wait_for_full_aggregation: false
        }
      });

      const widgetUrl = response.data.widget_url.url;
      console.log(`[MX] Widget URL created for user ${userId}`);
      
      return widgetUrl;
    } catch (error: any) {
      console.error('Error creating widget URL:', error.response?.data || error.message);
      
      // Return mock widget URL for development
      return `https://int-widgets.moneydesktop.com/md/connect/${userId}?color_scheme=light`;
    }
  }

  // Handle widget callback and sync accounts
  async handleWidgetCallback(userId: string, memberGuid?: string): Promise<any> {
    try {
      if (!this.config.clientId || !this.config.apiKey) {
        console.warn('MX credentials not configured, using mock account data');
        return this.createMockAccountData(userId);
      }

      const user = await this.createUser(userId);
      
      // Get all members (connected institutions) for the user
      const membersResponse = await this.client.get(`/users/${user.guid}/members`);
      const members = membersResponse.data.members;

      console.log(`[MX] Found ${members.length} connected institutions for user ${userId}`);

      const syncedAccounts = [];

      for (const member of members) {
        // Get accounts for this member
        const accountsResponse = await this.client.get(`/users/${user.guid}/members/${member.guid}/accounts`);
        const accounts = accountsResponse.data.accounts;

        for (const account of accounts) {
          // Store account in database
          const dbAccount = await storage.createAccount({
            userId,
            accountType: this.mapMXAccountType(account.type, account.subtype),
            accountName: account.name,
            institutionName: member.name,
            balance: account.balance?.toString() || '0',
            isActive: true,
            plaidAccountId: account.guid, // Reusing this field for MX account GUID
            plaidAccessToken: this.encryptAccessToken(member.guid), // Store encrypted member GUID
            plaidItemId: member.guid,
            lastSynced: new Date()
          });

          syncedAccounts.push({
            account_id: account.guid,
            name: account.name,
            type: account.type,
            balance: account.balance,
            available_balance: account.available_balance
          });

          // Sync transactions for this account
          await this.syncAccountTransactions(userId, dbAccount.id, user.guid, member.guid, account.guid);
        }
      }

      console.log(`[MX] Successfully synced ${syncedAccounts.length} accounts for user ${userId}`);
      
      return {
        success: true,
        accounts: syncedAccounts,
        message: `Successfully connected ${syncedAccounts.length} accounts`
      };
    } catch (error: any) {
      console.error('Error handling widget callback:', error.response?.data || error.message);
      
      // Fallback to mock data for development
      return this.createMockAccountData(userId);
    }
  }

  // Sync transactions for a specific account
  async syncAccountTransactions(userId: string, dbAccountId: number, userGuid: string, memberGuid: string, accountGuid: string): Promise<void> {
    try {
      if (!this.config.clientId || !this.config.apiKey) {
        console.warn('MX credentials not configured, creating mock transactions');
        await this.createMockTransactions(dbAccountId);
        return;
      }

      // Get transactions for the last 90 days
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 90);
      
      const response = await this.client.get(`/users/${userGuid}/accounts/${accountGuid}/transactions`, {
        params: {
          from_date: fromDate.toISOString().split('T')[0],
          to_date: new Date().toISOString().split('T')[0],
          page: 1,
          records_per_page: 1000
        }
      });

      const transactions = response.data.transactions || [];
      console.log(`[MX] Found ${transactions.length} transactions for account ${accountGuid}`);

      for (const transaction of transactions) {
        // Check if transaction already exists
        const existingTransaction = await storage.getTransactionByPlaidId(transaction.guid);
        
        if (!existingTransaction) {
          await storage.createTransaction({
            accountId: dbAccountId,
            amount: transaction.is_expense ? (-Math.abs(transaction.amount)).toString() : transaction.amount.toString(),
            description: transaction.description || transaction.original_description,
            category: this.mapMXCategory(transaction.top_level_category, transaction.category),
            subcategory: transaction.category || '',
            transactionDate: transaction.date,
            isIncome: transaction.is_income,
            plaidTransactionId: transaction.guid
          });
        }
      }

      console.log(`[MX] Synced ${transactions.length} transactions for account ${accountGuid}`);
    } catch (error: any) {
      console.error(`Error syncing transactions for account ${accountGuid}:`, error.response?.data || error.message);
      // Create some mock transactions as fallback
      await this.createMockTransactions(dbAccountId);
    }
  }

  // Refresh account balances
  async refreshAccountBalances(userId: string): Promise<void> {
    try {
      const accounts = await storage.getUserAccounts(userId);
      
      for (const account of accounts) {
        if (account.plaidAccessToken && account.plaidAccountId) {
          try {
            if (!this.config.clientId || !this.config.apiKey) {
              // Mock balance update
              const newBalance = (parseFloat(account.balance) + (Math.random() - 0.5) * 100).toFixed(2);
              await storage.updateAccountBalance(account.id, newBalance);
              continue;
            }

            const user = await this.createUser(userId);
            const response = await this.client.get(`/users/${user.guid}/accounts/${account.plaidAccountId}`);
            const mxAccount = response.data.account;
            
            if (mxAccount && mxAccount.balance !== null) {
              await storage.updateAccountBalance(account.id, mxAccount.balance.toString());
            }
          } catch (error) {
            console.warn(`Failed to refresh balance for account ${account.id}:`, error);
            // Continue with other accounts
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing account balances:', error);
      throw new Error('Failed to refresh account balances');
    }
  }

  // Create mock account data for development
  private async createMockAccountData(userId: string) {
    const mockAccounts = [
      {
        account_id: 'mock_account_1',
        name: 'Checking Account',
        type: 'CHECKING',
        balance: 2500.00,
        available_balance: 2500.00
      },
      {
        account_id: 'mock_account_2', 
        name: 'Savings Account',
        type: 'SAVINGS',
        balance: 15000.00,
        available_balance: 15000.00
      },
      {
        account_id: 'mock_account_3',
        name: 'Credit Card',
        type: 'CREDIT_CARD',
        balance: -1250.00,
        available_balance: 3750.00
      }
    ];

    // Store mock accounts in database
    for (const account of mockAccounts) {
      await storage.createAccount({
        userId,
        accountType: this.mapMXAccountType(account.type, ''),
        accountName: account.name,
        institutionName: 'Mock Bank',
        balance: account.balance.toString(),
        isActive: true,
        plaidAccountId: account.account_id,
        plaidAccessToken: `mock-member-guid-${userId}`,
        plaidItemId: `mock-member-${userId}`
      });
    }

    // Create mock transactions for the first account
    const firstAccount = await storage.getUserAccounts(userId);
    if (firstAccount.length > 0) {
      await this.createMockTransactions(firstAccount[0].id);
    }

    return { 
      success: true,
      accounts: mockAccounts,
      message: `Successfully connected ${mockAccounts.length} mock accounts`
    };
  }

  // Create mock transactions
  private async createMockTransactions(accountId: number): Promise<void> {
    const mockTransactions = [
      {
        guid: `mock_tx_${Date.now()}_1`,
        description: 'Starbucks Coffee',
        amount: 5.50,
        date: new Date().toISOString().split('T')[0],
        category: 'Restaurants',
        top_level_category: 'Food & Dining',
        is_expense: true,
        is_income: false
      },
      {
        guid: `mock_tx_${Date.now()}_2`,
        description: 'Whole Foods Market',
        amount: 85.32,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Groceries',
        top_level_category: 'Food & Dining',
        is_expense: true,
        is_income: false
      },
      {
        guid: `mock_tx_${Date.now()}_3`,
        description: 'Shell Gas Station',
        amount: 45.20,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Gas & Fuel',
        top_level_category: 'Transportation',
        is_expense: true,
        is_income: false
      },
      {
        guid: `mock_tx_${Date.now()}_4`,
        description: 'Direct Deposit Salary',
        amount: 3500.00,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Salary',
        top_level_category: 'Income',
        is_expense: false,
        is_income: true
      },
      {
        guid: `mock_tx_${Date.now()}_5`,
        description: 'Netflix Subscription',
        amount: 15.99,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Entertainment',
        top_level_category: 'Entertainment',
        is_expense: true,
        is_income: false
      }
    ];

    // Store mock transactions
    for (const transaction of mockTransactions) {
      const existingTransaction = await storage.getTransactionByPlaidId(transaction.guid);
      
      if (!existingTransaction) {
        await storage.createTransaction({
          accountId,
          amount: transaction.is_expense ? (-Math.abs(transaction.amount)).toString() : transaction.amount.toString(),
          description: transaction.description,
          category: this.mapMXCategory(transaction.top_level_category, transaction.category),
          subcategory: transaction.category,
          transactionDate: transaction.date,
          isIncome: transaction.is_income,
          plaidTransactionId: transaction.guid
        });
      }
    }
  }

  // Utility methods
  private encryptAccessToken(token: string): string {
    try {
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(token, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Error encrypting access token:', error);
      return token; // Fallback for development
    }
  }

  private mapMXAccountType(type: string, subtype: string): string {
    const typeMap: Record<string, string> = {
      'CHECKING': 'checking',
      'SAVINGS': 'savings',
      'CREDIT_CARD': 'credit',
      'INVESTMENT': 'investment',
      'LOAN': 'loan',
      'MORTGAGE': 'mortgage',
      'RETIREMENT': 'investment',
      'BROKERAGE': 'investment'
    };

    return typeMap[type] || 'other';
  }

  private mapMXCategory(topLevelCategory: string, category: string): string {
    const categoryMap: Record<string, string> = {
      'Food & Dining': 'Food & Dining',
      'Shopping': 'Shopping',
      'Transportation': 'Transportation',
      'Healthcare': 'Healthcare',
      'Entertainment': 'Entertainment',
      'Travel': 'Travel',
      'Bills & Utilities': 'Bills & Utilities',
      'Education': 'Education',
      'Professional Services': 'Professional Services',
      'Government': 'Government',
      'Income': 'Income',
      'Transfer': 'Transfer',
      'Cash & ATM': 'Cash & ATM',
      'Fees & Charges': 'Fees & Charges'
    };

    return categoryMap[topLevelCategory] || topLevelCategory || 'Other';
  }
}

export const mxService = new MXService();

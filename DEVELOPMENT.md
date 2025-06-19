# SmartPlannerAI Development Setup

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **Plaid Account** (for financial data integration)

## Quick Start

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd SmartPlannerAI
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- Get Plaid credentials from [Plaid Dashboard](https://dashboard.plaid.com/)
- Set up PostgreSQL database (local or cloud)

### 3. Database Setup
```bash
# Push database schema
npm run db:push
```

### 4. Development Server
```bash
npm run dev
```

## Plaid Integration Setup

### 1. Create Plaid Account
1. Sign up at [Plaid](https://plaid.com/)
2. Create a new application
3. Get your `client_id` and `secret` from the dashboard

### 2. Configure Plaid Environment
- **Sandbox**: For development and testing
- **Development**: For pre-production testing with real bank data
- **Production**: For live application

### 3. Supported Banks
In sandbox mode, use these test credentials:
- **Username**: `user_good`
- **Password**: `pass_good`

## Features Implemented

### ✅ Core Infrastructure
- [x] React + TypeScript frontend
- [x] Express.js + TypeScript backend
- [x] PostgreSQL with Drizzle ORM
- [x] Firebase Auth integration
- [x] Comprehensive UI component library

### ✅ Financial Data Integration
- [x] Plaid API integration
- [x] Secure account linking
- [x] Real-time transaction sync
- [x] Account balance monitoring

### ✅ Machine Learning Features
- [x] ML-powered transaction categorization
- [x] Spending anomaly detection
- [x] Financial health scoring algorithm
- [x] Investment recommendation engine

### ✅ Advanced Analytics
- [x] Detailed financial health breakdown
- [x] Risk profile assessment
- [x] Portfolio optimization recommendations
- [x] Market insights integration

### ✅ User Interface
- [x] Responsive dashboard
- [x] Advanced analytics page
- [x] Plaid Link integration component
- [x] Real-time data visualization

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `POST /api/login` - Login (redirects to Firebase Auth)

### Financial Data
- `GET /api/dashboard` - Dashboard overview
- `GET /api/financial-health` - Basic health metrics
- `GET /api/financial-health/detailed` - Detailed health breakdown
- `GET /api/transactions` - User transactions
- `GET /api/spending-analytics` - Spending breakdown
- `GET /api/net-worth-history` - Net worth trends

### Plaid Integration
- `POST /api/plaid/link-token` - Create Plaid Link token
- `POST /api/plaid/exchange-token` - Exchange public token
- `POST /api/plaid/sync` - Sync account data

### Goals & Investments
- `GET /api/goals` - User financial goals
- `POST /api/goals` - Create new goal
- `GET /api/investment-recommendations` - Investment suggestions
- `GET /api/investment-recommendations/generate` - Generate new recommendations
- `GET /api/investment-recommendations/rebalance` - Portfolio rebalancing

### ML & Analytics
- `POST /api/ml/categorize` - Run ML categorization
- `GET /api/insights/market` - Market insights

## Testing

### Plaid Sandbox Testing
Use these test scenarios in sandbox mode:

1. **Normal Account**: `user_good` / `pass_good`
2. **Account with Issues**: `user_bad` / `pass_bad`
3. **MFA Required**: `user_mfa` / `pass_mfa`

### Test Data
The application automatically generates realistic mock data for new users including:
- Sample bank accounts
- Transaction history (90 days)
- Financial goals
- Investment recommendations
- Health score calculations

## Database Schema

### Core Tables
- `users` - User profiles and auth data
- `accounts` - Linked bank accounts
- `transactions` - Financial transactions
- `goals` - User financial goals
- `financial_health` - Health score history
- `investment_recommendations` - AI-generated recommendations

### ML Enhancement Tables
- `risk_profiles` - User risk tolerance assessments
- `ml_predictions` - Model outputs and confidence scores

## Security Features

### Data Protection
- Bank-level encryption for sensitive data
- Secure Plaid token management
- Environment variable protection
- Input validation and sanitization

### Authentication
- Firebase Auth integration
- Session-based authentication
- CSRF protection
- Secure cookie handling

## Deployment

### Environment Variables
Ensure these are set in production:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=production
```

### Build Commands
```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Plaid Link Issues**
   - Verify credentials in dashboard
   - Check environment (sandbox vs production)
   - Ensure webhook URLs are correct

2. **Database Connection**
   - Verify PostgreSQL is running
   - Check connection string format
   - Ensure database exists

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify environment variables

### Debug Mode
Set `NODE_ENV=development` for detailed logging and error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Add tests for new functionality
5. Submit a pull request

## Support

For issues or questions:
1. Check this documentation
2. Review the codebase comments
3. Test in Plaid sandbox mode first
4. Check environment variable configuration

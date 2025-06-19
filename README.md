# SmartPlannerAI

A comprehensive personal finance management application powered by AI insights and modern web technologies.

## Overview

SmartPlannerAI helps users manage their finances through intelligent analytics, goal tracking, investment recommendations, and real-time financial health monitoring. The application features secure bank account integration via MX (Money Experience) for transaction sync and account management.

## Features

### 🏦 **Financial Account Integration**
- Secure bank account connection via MX platform
- Support for 16,000+ financial institutions
- Real-time account balance and transaction sync
- Automatic transaction categorization

### 📊 **AI-Powered Analytics**
- Intelligent spending analysis and insights
- Financial health scoring
- Personalized investment recommendations
- Category-based expense tracking

### 🎯 **Goal Management**
- Personal financial goal setting
- Progress tracking with visual indicators
- Milestone celebrations and notifications
- Customizable goal categories

### 📈 **Investment Insights**
- Risk-based investment recommendations
- Portfolio analysis and suggestions
- Market data integration
- Performance tracking

### 🔒 **Security & Privacy**
- Bank-level encryption for all financial data
- Secure authentication with Firebase
- Comprehensive audit logging
- Rate limiting and security headers

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui component library
- **TanStack Query** for server state management
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Drizzle ORM
- **Firebase Auth** for authentication
- **MX Integration** for financial data

### Infrastructure
- **PostgreSQL** database
- **Redis** for session storage (optional)
- **Docker** support for containerization

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- MX Developer Account (optional - demo mode available)
- Firebase project for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartPlannerAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Configuration

### Environment Variables

Create a `.env` file with the following configuration:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
# ... other Firebase config

# MX Configuration (optional - demo mode if not provided)
MX_CLIENT_ID=your_mx_client_id
MX_API_KEY=your_mx_api_key
MX_ENV=sandbox  # sandbox or production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/smartplanner

# Security
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key_32_chars

# Development
NODE_ENV=development
```

### MX Integration Setup

1. Sign up at [developer.mx.com](https://developer.mx.com)
2. Create a new application
3. Obtain your Client ID and API Key
4. Add credentials to `.env` file

**Note**: The app works in demo mode with realistic mock data if MX credentials are not provided.

## Project Structure

```
SmartPlannerAI/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   ├── middleware/         # Express middleware
│   └── routes.ts           # API route definitions
├── shared/                 # Shared types and schemas
└── docs/                   # Documentation
```

## API Documentation

### Authentication Endpoints
- `GET /api/auth/user` - Get current user information
- `POST /api/auth/login` - Login with Firebase
- `POST /api/auth/logout` - Logout current user

### Financial Data Endpoints
- `POST /api/mx/widget-url` - Generate MX Connect widget URL
- `POST /api/mx/connect-callback` - Handle account connection
- `POST /api/mx/sync` - Sync account data and transactions

### Dashboard Endpoints
- `GET /api/dashboard` - Get dashboard data
- `GET /api/analytics` - Get analytics data
- `POST /api/goals` - Create financial goal
- `GET /api/goals` - Get user goals

## Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run check      # TypeScript type checking
npm run db:push    # Push database schema changes
```

### Testing

```bash
# Test MX integration
node test-mx-integration.js

# Run type checking
npm run check
```

### Database Management

The project uses Drizzle ORM for database operations:

```bash
# Push schema changes
npm run db:push

# Generate migrations
npx drizzle-kit generate

# View database
npx drizzle-kit studio
```

## Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Configure production Firebase credentials
   - Set production MX credentials
   - Use strong encryption keys

2. **Security**
   - Enable HTTPS
   - Configure secure session settings
   - Set up proper CORS policies
   - Enable security headers

3. **Database**
   - Use production PostgreSQL instance
   - Set up database backups
   - Configure connection pooling

4. **Monitoring**
   - Set up error tracking
   - Configure logging
   - Monitor API usage and performance

### Docker Deployment

```bash
# Build Docker image
docker build -t smartplanner-ai .

# Run container
docker run -p 5000:5000 --env-file .env smartplanner-ai
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Check the [MX Integration Guide](MX_INTEGRATION_GUIDE.md)
- Review the [Development Documentation](DEVELOPMENT.md)
- Open an issue for bug reports or feature requests

## Acknowledgments

- [MX](https://mx.com) for financial data aggregation
- [Firebase](https://firebase.google.com) for authentication
- [shadcn/ui](https://ui.shadcn.com) for the component library
- [Drizzle ORM](https://orm.drizzle.team) for database management

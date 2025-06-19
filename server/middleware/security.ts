import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Rate limiting configuration
export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
export const authRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again in 15 minutes.'
);

export const apiRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per 15 minutes
  'API rate limit exceeded, please slow down.'
);

export const financialIntegrationRateLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 financial integration operations per hour
  'Financial integration rate limit exceeded, please try again later.'
);

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://production.plaid.com", "https://sandbox.plaid.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn(`Validation failed for ${req.method} ${req.path}:`, errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Common validation schemas
export const validateGoal = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('targetAmount').isFloat({ min: 0.01 }).withMessage('Target amount must be positive'),
  body('goalType').isIn(['emergency', 'house', 'retirement', 'vacation', 'other']).withMessage('Invalid goal type'),
  body('targetDate').optional().isISO8601().withMessage('Invalid date format'),
  validateRequest
];

export const validateTransaction = [
  body('amount').isFloat().withMessage('Amount must be a number'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters'),
  body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category is required'),
  body('transactionDate').isISO8601().withMessage('Invalid date format'),
  validateRequest
];

export const validateAccount = [
  body('accountName').trim().isLength({ min: 1, max: 100 }).withMessage('Account name must be 1-100 characters'),
  body('accountType').isIn(['checking', 'savings', 'credit', 'investment']).withMessage('Invalid account type'),
  body('institutionName').trim().isLength({ min: 1, max: 100 }).withMessage('Institution name is required'),
  body('balance').isFloat().withMessage('Balance must be a number'),
  validateRequest
];

// Audit logging middleware
export const auditLog = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Log the request
    console.log(`[AUDIT] ${new Date().toISOString()} - ${action} - User: ${(req as any).user?.uid || 'anonymous'} - IP: ${req.ip} - ${req.method} ${req.path}`);
    
    // Log sensitive operations
    if (['PLAID_LINK', 'ACCOUNT_CREATE', 'TRANSACTION_CREATE', 'GOAL_CREATE'].includes(action)) {
      console.log(`[SECURITY] Sensitive operation ${action} by user ${(req as any).user?.uid} from IP ${req.ip}`);
    }
    
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      console.log(`[AUDIT] ${action} completed in ${duration}ms - Status: ${res.statusCode}`);
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// IP whitelist for admin functions (if needed)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP || '')) {
      console.warn(`[SECURITY] Blocked request from unauthorized IP: ${clientIP}`);
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};

// Sanitize sensitive data from logs
export const sanitizeForLogging = (data: any): any => {
  const sensitiveFields = ['password', 'token', 'accessToken', 'plaidAccessToken', 'secret'];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

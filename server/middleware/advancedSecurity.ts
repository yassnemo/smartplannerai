import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { body, query, param } from 'express-validator';

// Enhanced security monitoring and audit logging
class SecurityMonitor {
  private suspiciousActivity: Map<string, number> = new Map();
  private ipAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private sessionIntegrity: Map<string, string> = new Map();

  // Monitor for suspicious activity patterns
  flagSuspiciousActivity(ip: string, userId?: string, activity?: string): boolean {
    const key = userId || ip;
    const count = this.suspiciousActivity.get(key) || 0;
    this.suspiciousActivity.set(key, count + 1);

    if (count > 10) { // Threshold for suspicious activity
      console.warn(`[SECURITY] Suspicious activity detected for ${key}: ${activity}`);
      return true;
    }
    return false;
  }

  // Enhanced rate limiting with IP tracking
  checkRateLimit(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
    const now = new Date();
    const record = this.ipAttempts.get(ip);

    if (!record) {
      this.ipAttempts.set(ip, { count: 1, lastAttempt: now });
      return true;
    }

    const timeDiff = now.getTime() - record.lastAttempt.getTime();
    
    if (timeDiff > windowMs) {
      // Reset window
      this.ipAttempts.set(ip, { count: 1, lastAttempt: now });
      return true;
    }

    if (record.count >= limit) {
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip}`);
      return false;
    }

    record.count++;
    record.lastAttempt = now;
    return true;
  }

  // Generate session integrity token
  generateSessionToken(userId: string, userAgent: string): string {
    const token = crypto.createHash('sha256')
      .update(`${userId}-${userAgent}-${Date.now()}`)
      .digest('hex');
    this.sessionIntegrity.set(userId, token);
    return token;
  }

  // Validate session integrity
  validateSessionIntegrity(userId: string, token: string): boolean {
    const expectedToken = this.sessionIntegrity.get(userId);
    return expectedToken === token;
  }
}

export const securityMonitor = new SecurityMonitor();

// Enhanced audit logging with structured data
export class AuditLogger {
  private static logSecurityEvent(level: 'INFO' | 'WARN' | 'ERROR', event: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      type: 'SECURITY',
      ...event
    };

    console.log(`[AUDIT-${level}] ${JSON.stringify(logEntry)}`);
    
    // In production, this would be sent to a secure logging service
    // like AWS CloudWatch, Splunk, or ELK stack
  }

  static logAuthentication(userId: string, ip: string, success: boolean, method: string) {
    this.logSecurityEvent(success ? 'INFO' : 'WARN', {
      event: 'AUTHENTICATION',
      userId: success ? userId : '[FAILED]',
      ip,
      success,
      method,
      userAgent: 'not-captured' // Would capture from request
    });
  }

  static logDataAccess(userId: string, ip: string, resource: string, action: string) {
    this.logSecurityEvent('INFO', {
      event: 'DATA_ACCESS',
      userId,
      ip,
      resource,
      action,
      timestamp: new Date().toISOString()
    });
  }

  static logFinancialOperation(userId: string, ip: string, operation: string, amount?: number, account?: string) {
    this.logSecurityEvent('INFO', {
      event: 'FINANCIAL_OPERATION',
      userId,
      ip,
      operation,
      amount: amount ? '[REDACTED]' : undefined,
      account: account ? '[REDACTED]' : undefined,
      severity: amount && amount > 10000 ? 'HIGH' : 'NORMAL'
    });
  }

  static logSecurityAlert(userId: string, ip: string, alertType: string, details: any) {
    this.logSecurityEvent('WARN', {
      event: 'SECURITY_ALERT',
      userId,
      ip,
      alertType,
      details: JSON.stringify(details)
    });
  }

  static logSystemError(error: Error, context: any) {
    this.logSecurityEvent('ERROR', {
      event: 'SYSTEM_ERROR',
      error: error.message,
      stack: error.stack?.split('\n')[0], // Only first line for security
      context: JSON.stringify(context)
    });
  }
}

// Enhanced input validation and sanitization
export const advancedValidation = {
  // Financial amount validation
  validateAmount: body('amount')
    .isFloat({ min: -1000000, max: 1000000 })
    .withMessage('Amount must be between -$1M and $1M')
    .custom((value) => {
      // Check for suspicious patterns in amounts
      const amount = Math.abs(parseFloat(value));
      if (amount > 50000) {
        throw new Error('Large amount requires additional verification');
      }
      return true;
    }),

  // Enhanced description validation
  validateDescription: body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be 1-500 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?@#$%&*()+=\[\]{}|\\:";'<>?/~`]+$/)
    .withMessage('Description contains invalid characters')
    .custom((value) => {
      // Check for potential injection patterns
      const suspiciousPatterns = ['<script', 'javascript:', 'onload=', 'onerror=', 'eval('];
      for (const pattern of suspiciousPatterns) {
        if (value.toLowerCase().includes(pattern)) {
          throw new Error('Description contains suspicious content');
        }
      }
      return true;
    }),

  // Account name validation with business rules
  validateAccountName: body('accountName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Account name must be 2-100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,()]+$/)
    .withMessage('Account name contains invalid characters'),

  // Enhanced goal validation
  validateGoalData: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Goal name must be 2-100 characters')
      .matches(/^[a-zA-Z0-9\s\-_.,()]+$/)
      .withMessage('Goal name contains invalid characters'),
    
    body('targetAmount')
      .isFloat({ min: 1, max: 10000000 })
      .withMessage('Target amount must be between $1 and $10M'),
    
    body('goalType')
      .isIn(['emergency', 'house', 'retirement', 'vacation', 'education', 'car', 'debt', 'other'])
      .withMessage('Invalid goal type'),
    
    body('targetDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        if (value) {
          const targetDate = new Date(value);
          const now = new Date();
          const maxFutureDate = new Date();
          maxFutureDate.setFullYear(now.getFullYear() + 50);
          
          if (targetDate <= now) {
            throw new Error('Target date must be in the future');
          }
          
          if (targetDate > maxFutureDate) {
            throw new Error('Target date cannot be more than 50 years in the future');
          }
        }
        return true;
      })
  ],

  // User ID validation for route parameters
  validateUserId: param('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),

  // Transaction ID validation
  validateTransactionId: param('transactionId')
    .isInt({ min: 1 })
    .withMessage('Invalid transaction ID'),

  // Query parameter validation
  validatePagination: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be non-negative'),
    
    query('period')
      .optional()
      .isIn(['week', 'month', 'quarter', 'year'])
      .withMessage('Invalid period')
  ]
};

// Data sanitization middleware
export const sanitizeData = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove potential XSS and injection attempts
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Enhanced request validation middleware
export const enhancedSecurity = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const userId = (req as any).user?.uid;

  // Check rate limiting
  if (!securityMonitor.checkRateLimit(ip)) {
    AuditLogger.logSecurityAlert(userId, ip, 'RATE_LIMIT_EXCEEDED', {
      endpoint: req.path,
      method: req.method
    });
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.' 
    });
  }

  // Flag suspicious activity patterns
  if (securityMonitor.flagSuspiciousActivity(ip, userId, `${req.method} ${req.path}`)) {
    AuditLogger.logSecurityAlert(userId, ip, 'SUSPICIOUS_ACTIVITY', {
      endpoint: req.path,
      method: req.method,
      userAgent
    });
  }

  // Check for malicious patterns in request
  const requestString = JSON.stringify({
    url: req.url,
    headers: req.headers,
    body: req.body
  });

  const maliciousPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /<script/i,
    /javascript:/i,
    /\.\.\//,
    /etc\/passwd/
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(requestString)) {
      AuditLogger.logSecurityAlert(userId, ip, 'MALICIOUS_PATTERN_DETECTED', {
        pattern: pattern.toString(),
        endpoint: req.path
      });
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Request contains invalid content' 
      });
    }
  }

  next();
};

// Financial operation security middleware
export const financialOperationSecurity = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.uid;
  const ip = req.ip || 'unknown';
  const operation = `${req.method} ${req.path}`;

  // Log all financial operations
  AuditLogger.logFinancialOperation(
    userId, 
    ip, 
    operation, 
    req.body?.amount ? parseFloat(req.body.amount) : undefined,
    req.body?.accountId
  );

  // Additional checks for high-value operations
  if (req.body?.amount && Math.abs(parseFloat(req.body.amount)) > 10000) {
    console.warn(`[SECURITY] High-value transaction attempt: $${req.body.amount} by user ${userId}`);
    
    // In production, this might trigger additional verification steps
    // such as 2FA, email confirmation, or manual review
  }

  next();
};

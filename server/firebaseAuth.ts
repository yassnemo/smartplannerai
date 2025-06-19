import admin from 'firebase-admin';
import type { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else {
    console.warn('Firebase service account not configured. Using development mode.');
  }
}

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for development if no database
  if (!process.env.DATABASE_URL) {
    return session({
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: sessionTtl,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      }
    });
  }

  // Use PostgreSQL store for production
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'sessions',
    ttl: sessionTtl / 1000
  });

  return session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: sessionTtl,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  });
}

// Firebase auth middleware
export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header' });
    }

    const idToken = authHeader.substring(7);
    
    if (admin.apps.length > 0) {
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      (req as any).user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      };      } else {
        // Development mode - decode without verification (for testing)
        console.warn('⚠️ Running in development mode without Firebase verification');
        try {
          const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
          (req as any).user = {
            uid: payload.sub || 'dev-user',
            email: payload.email || 'dev@example.com',
            name: payload.name || 'Development User',
            picture: payload.picture || null
          };
        } catch {
          // Fallback for invalid tokens in development
          (req as any).user = {
            uid: 'dev-user',
            email: 'dev@example.com',
            name: 'Development User',
            picture: null
          };
        }
      }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Session-based auth middleware (for traditional session auth)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).session;
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  (req as any).user = session.user;
  next();
}

// Combined auth middleware that works with both Firebase tokens and sessions
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check for Firebase token first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyFirebaseToken(req, res, next);
  }

  // Fall back to session auth
  return requireAuth(req, res, next);
}

export async function setupAuth(app: Express) {
  // Setup session middleware
  app.use(getSession());

  // Auth routes
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ error: 'ID token required' });
      }

      let user;
      
      if (admin.apps.length > 0) {
        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture
        };
      } else {
        // Development mode
        const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        user = {
          uid: payload.sub || 'dev-user',
          email: payload.email || 'dev@example.com',
          name: payload.name || 'Development User',
          picture: payload.picture || null
        };
      }

      // Store user in session
      (req as any).session.user = user;

      res.json({ 
        success: true, 
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  app.get('/api/auth/user', isAuthenticated, (req: Request, res: Response) => {
    res.json({
      uid: (req as any).user.uid,
      email: (req as any).user.email,
      name: (req as any).user.name,
      picture: (req as any).user.picture
    });
  });
}

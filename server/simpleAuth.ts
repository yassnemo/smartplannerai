import type { Express, RequestHandler } from "express";
import session from "express-session";

// Simple development authentication
export async function setupAuth(app: Express): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Using simplified auth for development');
    
    // Basic session setup for development
    app.use(
      session({
        secret: 'dev-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // Set to true in production with HTTPS
          maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        },
      })
    );

    // Mock login for development
    app.get('/api/login', (req: any, res) => {
      req.session.user = {
        claims: {
          sub: 'dev-user-123',
          email: 'dev@example.com',
          name: 'Developer User'
        }
      };
      res.redirect('/dashboard');
    });

    app.get('/api/logout', (req: any, res) => {
      req.session.destroy(() => {
        res.redirect('/');
      });
    });

    return;
  }
  // Production Firebase Auth would go here
  throw new Error('Production auth not configured. Set up Firebase Auth for production deployment.');
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // Mock authenticated user for development
    if (!req.session?.user) {
      req.session.user = {
        claims: {
          sub: 'dev-user-123',
          email: 'dev@example.com',
          name: 'Developer User'
        }
      };
    }
    
    req.user = req.session.user;
    return next();
  }

  // Production authentication logic would go here
  if (req.user) {
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};

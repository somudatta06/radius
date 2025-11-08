import { Request, Response, NextFunction } from 'express';
import 'express-session';

// Extend Express Session to include userId
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Attach userId to request for convenience
  (req as AuthenticatedRequest).userId = req.session.userId;
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    (req as AuthenticatedRequest).userId = req.session.userId;
  }
  next();
}

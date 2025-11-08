import session from 'express-session';
import { storage } from './storage';

export class DatabaseSessionStore extends session.Store {
  constructor() {
    super();
    
    // Run cleanup every hour
    setInterval(() => {
      storage.clearExpiredSessions().catch(console.error);
    }, 60 * 60 * 1000);
  }

  async get(sid: string, callback: (err: any, session?: session.SessionData | null) => void) {
    try {
      const sessionData = await storage.getSession(sid);
      callback(null, sessionData || null);
    } catch (error) {
      callback(error);
    }
  }

  async set(sid: string, session: session.SessionData, callback?: (err?: any) => void) {
    try {
      const maxAge = session.cookie.maxAge || 24 * 60 * 60 * 1000; // Default 24 hours
      const expiresAt = new Date(Date.now() + maxAge);
      await storage.saveSession(sid, session, expiresAt);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await storage.deleteSession(sid);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  async touch(sid: string, session: session.SessionData, callback?: (err?: any) => void) {
    try {
      // Update session expiration without modifying the session data
      const maxAge = session.cookie.maxAge || 24 * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + maxAge);
      await storage.saveSession(sid, session, expiresAt);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }
}

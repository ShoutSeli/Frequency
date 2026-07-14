import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/auth-tokens';

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token.' });
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/** Attaches userId if a valid token is present, but does not reject the request otherwise. */
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (token) {
    try {
      req.userId = verifyToken(token).userId;
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  next();
}

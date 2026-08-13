import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/tokens';

export const requireAuth = (request: AuthRequest, response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined;

  if (!token) {
    return response.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = verifyAccessToken(token);
    request.user = {
      id: String(payload.id),
      email: String(payload.email),
      username: String(payload.username),
      role: payload.role as 'STUDENT' | 'ADMIN'
    };
    return next();
  } catch (error) {
    return response.status(401).json({ message: 'Invalid or expired token.' });
  }
};

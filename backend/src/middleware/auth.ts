import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { apiError, ERROR_CODES } from '../lib/errors';

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Missing or invalid Authorization header'));
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json(apiError(ERROR_CODES.AUTH.TOKEN_EXPIRED, 'Token expired or invalid'));
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), config.jwt.secret) as JwtPayload;
      req.userId = decoded.userId;
    } catch {
      // ignore
    }
  }
  next();
}

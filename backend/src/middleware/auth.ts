import { Request, Response, NextFunction } from 'express';
import { apiError, ERROR_CODES } from '../lib/errors';
import {
  extractBearerToken,
  validateLogtoToken,
  LogtoTokenPayload,
  AuthorizationError,
} from '../lib/logto-auth';
import { findOrCreateUserByLogtoId } from '../lib/user-sync';

export interface AuthRequest extends Request {
  userId?: string;
  logtoUserId?: string;
  tokenPayload?: LogtoTokenPayload;
}

/**
 * Authentication middleware that validates Logto JWT tokens
 * and syncs users to local database
 */
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = await validateLogtoToken(token);

    // Store Logto user info
    req.logtoUserId = payload.sub;
    req.tokenPayload = payload;

    // Sync user to local database and get local user ID
    const localUserId = await findOrCreateUserByLogtoId({
      sub: payload.sub,
      // Email and other claims may be in the token if requested via scopes
    });

    req.userId = localUserId;
    next();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(error.status).json(
        apiError(
          error.status === 401 ? ERROR_CODES.AUTH.UNAUTHORIZED : ERROR_CODES.AUTH.TOKEN_EXPIRED,
          error.message
        )
      );
    }
    console.error('[Auth] Unexpected error:', error);
    return res.status(401).json(apiError(ERROR_CODES.AUTH.UNAUTHORIZED, 'Authentication failed'));
  }
}

/**
 * Optional authentication middleware - does not fail if no token provided
 */
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = await validateLogtoToken(token);

    req.logtoUserId = payload.sub;
    req.tokenPayload = payload;

    const localUserId = await findOrCreateUserByLogtoId({
      sub: payload.sub,
    });

    req.userId = localUserId;
  } catch {
    // Ignore errors - user is not authenticated but can still proceed
  }
  next();
}

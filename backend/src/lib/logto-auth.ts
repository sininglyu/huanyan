import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { config } from '../config/index';

// Logto OIDC endpoints derived from the tenant endpoint
const JWKS_URI = `${config.logto.endpoint}/oidc/jwks`;
const ISSUER = `${config.logto.endpoint}/oidc`;

// Create a cached JWKS (JSON Web Key Set) fetcher
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    if (!config.logto.endpoint) {
      throw new Error('LOGTO_ENDPOINT is not configured');
    }
    jwks = createRemoteJWKSet(new URL(JWKS_URI));
  }
  return jwks;
}

export interface LogtoTokenPayload extends JWTPayload {
  sub: string; // Logto user ID
  aud: string | string[]; // Audience (API resource indicator)
  scope?: string; // Space-separated scopes
  client_id?: string;
  organization_id?: string;
}

export class AuthorizationError extends Error {
  name = 'AuthorizationError';
  constructor(
    message: string,
    public status: number = 403
  ) {
    super(message);
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string {
  const bearerPrefix = 'Bearer ';
  if (!authHeader) {
    throw new AuthorizationError('Authorization header is missing', 401);
  }
  if (!authHeader.startsWith(bearerPrefix)) {
    throw new AuthorizationError(`Authorization header must start with "${bearerPrefix}"`, 401);
  }
  return authHeader.slice(bearerPrefix.length);
}

/**
 * Validate a Logto-issued JWT access token
 * @param token The JWT access token
 * @returns The validated token payload
 */
export async function validateLogtoToken(token: string): Promise<LogtoTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: ISSUER,
      // Audience validation - the token must be for our API resource
      audience: config.logto.apiResource || undefined,
    });

    // Ensure required claims are present
    if (!payload.sub) {
      throw new AuthorizationError('Token missing sub claim', 401);
    }

    return payload as LogtoTokenPayload;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      throw error;
    }
    // Handle jose errors
    const message = error instanceof Error ? error.message : 'Token validation failed';
    throw new AuthorizationError(message, 401);
  }
}

/**
 * Parse scopes from token payload
 */
export function parseScopes(payload: LogtoTokenPayload): string[] {
  return payload.scope?.split(' ') ?? [];
}

/**
 * Check if token has required scopes
 */
export function hasScopes(payload: LogtoTokenPayload, requiredScopes: string[]): boolean {
  const tokenScopes = parseScopes(payload);
  return requiredScopes.every((scope) => tokenScopes.includes(scope));
}

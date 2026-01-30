export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}

export const ERROR_CODES = {
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_001',
    USER_EXISTS: 'AUTH_002',
    TOKEN_EXPIRED: 'AUTH_003',
    UNAUTHORIZED: 'AUTH_004',
  },
  ANALYSIS: {
    IMAGE_TOO_SMALL: 'ANALYSIS_001',
    NO_FACE_DETECTED: 'ANALYSIS_002',
    PROCESSING_FAILED: 'ANALYSIS_003',
    NOT_FOUND: 'ANALYSIS_004',
  },
  COMMUNITY: {
    CONTENT_REJECTED: 'COMMUNITY_001',
    RATE_LIMITED: 'COMMUNITY_002',
    NOT_FOUND: 'COMMUNITY_003',
  },
  VALIDATION: 'VALIDATION_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
} as const;

export function apiError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  };
}

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLogto } from '@logto/rn';
import { setAuthToken, getAuthToken } from '@/constants/api';

// API Resource indicator - must match Logto Console configuration
const API_RESOURCE = process.env.EXPO_PUBLIC_LOGTO_API_RESOURCE ?? 'https://api.huanyan.com';

interface AuthContextType {
  isReady: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isReady: false,
  isAuthenticated: false,
  isLoading: true,
  refreshToken: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isLoading, getAccessToken } = useLogto();
  const [isReady, setIsReady] = useState(false);

  // Fetch and set access token when authenticated
  const refreshToken = useCallback(async () => {
    if (!isAuthenticated) {
      setAuthToken(null);
      return;
    }

    try {
      // Get access token for the API resource
      const token = await getAccessToken(API_RESOURCE);
      if (token) {
        setAuthToken(token);
        console.log('[Auth] Access token set for API resource');
      } else {
        console.warn('[Auth] No access token received');
        setAuthToken(null);
      }
    } catch (error) {
      console.error('[Auth] Failed to get access token:', error);
      setAuthToken(null);
    }
  }, [isAuthenticated, getAccessToken]);

  // Sync token when auth state changes
  useEffect(() => {
    if (isLoading) {
      return;
    }

    (async () => {
      await refreshToken();
      setIsReady(true);
    })();
  }, [isAuthenticated, isLoading, refreshToken]);

  // Clear token on sign out
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setAuthToken(null);
    }
  }, [isAuthenticated, isLoading]);

  const value: AuthContextType = {
    isReady,
    isAuthenticated,
    isLoading,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

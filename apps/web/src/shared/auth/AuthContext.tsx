'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // localStorage에서 accessToken 초기화
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setAccessToken(storedToken);
    }
    setIsHydrated(true);
  }, []);

  const handleSetAccessToken = useCallback((token: string | null) => {
    setAccessToken(token);
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem('accessToken');
  }, []);

  const isAuthenticated = !!accessToken;

  const value: AuthContextType = {
    accessToken,
    setAccessToken: handleSetAccessToken,
    clearAuth,
    isAuthenticated,
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

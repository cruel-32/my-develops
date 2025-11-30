'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { postApiAuthLogout } from '@repo/api';
import type { GetApiUsersMeQueryResponse as User } from '@repo/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const router = useRouter();

  // 서버에서 받은 초기값으로 상태 동기화 (필요한 경우)
  // 보통 useState(initialUser)로 충분하지만, prop이 변경될 때를 대비
  useEffect(() => {
    if (initialUser !== user) {
      setUser(initialUser);
    }
  }, [initialUser]);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await postApiAuthLogout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh(); // 서버 컴포넌트 데이터 갱신을 위해 리프레시
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

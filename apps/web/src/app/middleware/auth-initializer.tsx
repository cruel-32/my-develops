'use client';

import { useEffect } from 'react';
import { useAuth } from '@/web/shared/model';
import { apiClient } from '@/web/shared/api';

export function AuthInitializer() {
  const { logout } = useAuth();

  useEffect(() => {
    // API 클라이언트에 전역 401 핸들러 설정
    apiClient.setConfig({
      on401: () => {
        console.log('Global 401 handler triggered');
        logout();
      },
    });
  }, [logout]);

  return null; // This component does not render anything.
}

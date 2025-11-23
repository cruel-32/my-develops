'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/web/shared/model';
import { apiClient } from '@/web/shared/api';

export function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // 앱 로드 시 인증 상태 확인
    checkAuth();

    // API 클라이언트에 전역 401 핸들러 설정
    apiClient.setConfig({
      on401: () => {
        console.log('Global 401 handler triggered');
        // 클라이언트 상태만 안전하게 초기화하는 함수 호출
        useAuthStore.getState().clearAuthState();
        // 로그인 페이지로 리디렉션
        // 이미 /login 페이지에 있으면 리디렉션하지 않음
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      },
    });
  }, [checkAuth]);

  return null; // This component does not render anything.
}

import { create } from 'zustand';
import { getApiUsersMe, postApiAuthLogout } from '@repo/api';
import type { GetApiUsersMeQueryResponse as User } from '@repo/api';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthState: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  checkAuth: async () => {
    try {
      const user = await getApiUsersMe();
      set({ isAuthenticated: true, user });
    } catch (error) {
      console.error('Authentication check failed', error);
      get().clearAuthState(); // 인증 실패 시 클라이언트 상태만 초기화
    }
  },
  clearAuthState: () => {
    set({ isAuthenticated: false, user: null });
  },
  logout: async () => {
    try {
      await postApiAuthLogout();
    } catch (error) {
      console.error('Logout API call failed', error);
    } finally {
      // API 호출 성공 여부와 관계없이 클라이언트 상태는 항상 초기화
      get().clearAuthState();
    }
  },
}));

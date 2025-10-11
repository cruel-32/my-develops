'use client';

import { trpc } from '@/web/shared/api/index';
import type { LoginFormData } from '../model/schema';

/**
 * Login mutation hook
 * Handles user authentication via tRPC with HttpOnly Cookie strategy
 *
 * Note: Tokens are automatically stored in HttpOnly cookies by the backend
 * and automatically included in subsequent requests via credentials: 'include'
 */
export const useLoginMutation = () => {
  return trpc.trpc.user.login.useMutation({
    onSuccess: (data) => {
      console.log('Login successful:', data);
      // ✅ Tokens are automatically stored in HttpOnly cookies
      // No manual token storage needed - cookies are handled by browser

      // TODO: Redirect to dashboard
      // window.location.href = '/dashboard';
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // TODO: Show error notification to user
    },
  });
};

/**
 * Type-safe login function
 */
export type LoginMutationFn = (data: LoginFormData) => Promise<void>;

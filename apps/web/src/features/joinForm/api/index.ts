'use client';

import { trpc } from '@/web/shared/api/index';
import type { JoinFormData } from '../model/schema';

/**
 * SignUp mutation hook
 * Handles user creation via tRPC.
 */
export const useSignUpMutation = () => {
  return trpc.trpc.user.signUp.useMutation({
    onSuccess: (data: unknown) => {
      console.log('SignUp successful:', data);
      // On successful sign-up, redirect to the login page.
      window.location.href = '/login';
    },
    onError: (error: unknown) => {
      console.error('SignUp failed:', error);
      // TODO: Show error notification to user
      alert('회원가입에 실패했습니다. 이메일이 이미 사용 중일 수 있습니다.');
    },
  });
};

/**
 * Type-safe signUp function
 */
export type SignUpMutationFn = (data: JoinFormData) => Promise<void>;

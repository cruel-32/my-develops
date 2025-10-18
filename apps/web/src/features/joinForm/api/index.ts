'use client';

import { clientTrpc } from '@/web/shared/api/index';
import { toast } from '@/web/shared/ui';
import type { JoinFormData } from '../model/schema';

/**
 * SignUp mutation hook
 * Handles user creation via tRPC.
 */
export const useSignUpMutation = () => {
  return clientTrpc.users.signUp.useMutation({
    onSuccess: (data: unknown) => {
      console.log('SignUp successful:', data);
      // On successful sign-up, redirect to the login page.
      window.location.href = '/';
    },
    onError: (error: unknown) => {
      console.error('SignUp failed:', error);
      toast.error('회원가입에 실패했습니다. 이메일이 이미 사용 중일 수 있습니다.');
    },
  });
};

/**
 * Type-safe signUp function
 */
export type SignUpMutationFn = (data: JoinFormData) => Promise<void>;

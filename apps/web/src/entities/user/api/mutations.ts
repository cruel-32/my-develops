'use client';

import { clientTrpc } from '@/web/shared/api';
import { toast } from '@/web/shared/ui';
import { useRouter } from 'next/navigation';

/**
 * Login Mutation Hook
 */
export const useLoginMutation = () => {
  const router = useRouter();
  return clientTrpc.users.login.useMutation({
    onSuccess: () => {
      // Tokens are stored via httpOnly cookies by the backend.
      // Redirect to dashboard on successful login.
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    },
  });
};

/**
 * SignUp Mutation Hook
 */
export const useSignUpMutation = () => {
  return clientTrpc.users.signUp.useMutation({
    onSuccess: () => {
      toast.success('Sign-up successful! Please log in.');
      // On successful sign-up, redirect to the login page.
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('SignUp failed:', error);
      toast.error('Sign-up failed. The email might already be in use.');
    },
  });
};

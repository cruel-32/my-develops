'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  loginFormDefaultValues,
  loginFormSchema,
  type LoginFormData,
} from './schema';
// TODO: Implement useLoginMutation using fetch + React Query
// import { useLoginMutation } from '@/web/entities/user';

export const useLoginForm = () => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: loginFormDefaultValues,
  });

  // TODO: Replace with fetch + React Query mutation
  // const { mutate, isPending } = useLoginMutation();
  const mutate = (data: any) => {};
  const isPending = false;

  const onSubmit = async (data: LoginFormData) => {
    try {
      mutate(data);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};

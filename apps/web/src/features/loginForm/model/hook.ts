'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  loginFormDefaultValues,
  loginFormSchema,
  type LoginFormData,
} from './schema';
import { useLoginMutation } from '../api';

export const useLoginForm = () => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: loginFormDefaultValues,
  });

  const { mutate, isPending } = useLoginMutation();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await mutate(data);
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

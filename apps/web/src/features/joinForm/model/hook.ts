'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { joinFormSchema, JoinFormData } from './schema';
import { useSignUpMutation } from '../api';

export const useJoinForm = () => {
  const form = useForm<JoinFormData>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate, isPending } = useSignUpMutation();

  const onSubmit = (data: JoinFormData) => {
    mutate(data);
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};

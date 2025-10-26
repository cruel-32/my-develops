'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { joinFormSchema, JoinFormData } from './schema';
// TODO: Implement useSignUpMutation using fetch + React Query
// import { useSignUpMutation } from '@/web/entities/user';

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

  // TODO: Replace with fetch + React Query mutation
  // const { mutate, isPending } = useSignUpMutation();
  const mutate = (data: any) => {};
  const isPending = false;

  const onSubmit = (data: JoinFormData) => {
    mutate(data);
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};

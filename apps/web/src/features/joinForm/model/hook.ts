'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { JOIN_FORM_SCHEMA, JoinFormType } from './schema';
import { useSignUpMutation } from '../api';

export const useJoinForm = () => {
  const form = useForm<JoinFormType>({
    resolver: zodResolver(JOIN_FORM_SCHEMA),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate: signUp, isPending } = useSignUpMutation();

  const onSubmit = (data: JoinFormType) => {
    signUp(data);
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};

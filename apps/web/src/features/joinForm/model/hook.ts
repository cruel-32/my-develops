'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { usePostApiAuthSignup } from '@repo/api';
import { useAuth } from '@/web/shared/auth/AuthContext';
import { toast } from '@/web/shared/ui';
import { joinFormSchema, JoinFormData } from './schema';

export const useJoinForm = () => {
  const router = useRouter();
  const { setAccessToken } = useAuth();

  const form = useForm<JoinFormData>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate, isPending } = usePostApiAuthSignup({
    mutation: {
      onSuccess: (data: any) => {
        // accessToken을 context에 저장
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          toast.success('회원가입되었습니다');
          router.push('/project');
        }
      },
      onError: (error: any) => {
        console.error('Signup error:', error);
        toast.error('회원가입에 실패했습니다');
      },
    },
  });

  const onSubmit = (data: JoinFormData) => {
    // confirmPassword는 API에 보내지 않음
    const { confirmPassword, ...signupData } = data;
    mutate({ data: signupData });
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};

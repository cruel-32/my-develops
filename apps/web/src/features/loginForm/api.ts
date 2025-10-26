'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/web/shared/auth/AuthContext';
import { toast } from '@/web/shared/ui';
import { usePostApiAuthLogin } from '@/web/shared/api';
import { loginFormSchema, LoginFormData } from './model';

export const useLoginForm = () => {
  const router = useRouter();
  const { setAccessToken } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = usePostApiAuthLogin({
    mutation: {
      onSuccess: (data) => {
        // accessToken을 context에 저장
        // dataReturnType: 'full' 설정으로 인해 { status, statusText, data, headers } 구조
        const accessToken = data.accessToken;
        if (accessToken) {
          setAccessToken(accessToken);
          toast.success('로그인되었습니다');
          // params중에 backUrl이 있으면 그 페이지로 이동
          const backUrl = new URLSearchParams(window.location.search).get(
            'backUrl'
          );
          if (backUrl) {
            router.push(backUrl);
          } else {
            router.push('/project');
          }
        }
      },
      onError: (error) => {
        console.error('Login error:', error);
        toast.error((error as any).error || '로그인 실패');
      },
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutate({ data });
  };

  const onInvalid = (errors: Record<string, any>) => {
    // validation 에러가 있을 때 첫 번째 에러를 toast로 표시
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey && errors[firstErrorKey]) {
      const errorMessage =
        errors[firstErrorKey]?.message || '입력값을 확인해주세요';
      toast.error(errorMessage);
    }
  };

  return {
    form,
    onSubmit,
    onInvalid,
    isPending,
  };
};

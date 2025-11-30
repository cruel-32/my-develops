'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/web/shared/ui';
import { usePostApiAuthLogin } from '@/web/shared/api';
import { loginFormSchema, LoginFormData } from './model';

import { useAuth } from '@/web/shared/model';

export const useLoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = usePostApiAuthLogin({
    mutation: {
      onSuccess: async () => {
        toast.success('로그인되었습니다');
        
        try {
          // 로그인 성공 후 사용자 정보 가져오기
          const { getApiUsersMe } = await import('@repo/api');
          const user = await getApiUsersMe();
          login(user);
        } catch (error) {
          console.error('Failed to fetch user after login', error);
        }

        // params중에 backUrl이 있으면 그 페이지로 이동
        const backUrl = new URLSearchParams(window.location.search).get(
          'backUrl'
        );
        if (backUrl) {
          router.push(backUrl);
        } else {
          router.push('/project');
        }
        router.refresh(); // 서버 컴포넌트 데이터 갱신
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

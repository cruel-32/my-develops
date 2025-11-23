import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { revalidateApi } from './revalidate';

/**
 * Unified Mutation Hook Factory
 * 클라이언트 상태(React Query)와 서버 상태(Next.js Cache)를 동시에 갱신합니다.
 *
 * @param mutationFn - 실제 API 호출 함수 (Kubb generated hook의 mutate 함수 등)
 * @param revalidateTag - 서버에서 무효화할 캐시 태그 (옵션)
 * @param queryKey - 클라이언트에서 무효화할 쿼리 키 (옵션)
 */
export function useUnifiedMutation<TData, TError, TVariables, TContext>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext> & {
    revalidateTag?: string;
    invalidateQueryKey?: unknown[];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context) => {
      // 1. 서버 캐시 무효화 (Server Action 호출)
      if (options?.revalidateTag) {
        await revalidateApi(options.revalidateTag, 'tag');
      }

      // 2. 클라이언트 캐시 무효화
      if (options?.invalidateQueryKey) {
        await queryClient.invalidateQueries({
          queryKey: options.invalidateQueryKey,
        });
      }

      // 3. 사용자 정의 onSuccess 실행
      if (options?.onSuccess) {
        // @ts-ignore - React Query version mismatch workaround
        options.onSuccess(data, variables, context);
      }
    },
  });
}

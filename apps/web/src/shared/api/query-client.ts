import { QueryClient } from '@tanstack/react-query';

/**
 * 서버 사이드 렌더링용 QueryClient
 * 각 요청마다 새로운 인스턴스 생성
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 서버에서 prefetch한 데이터는 1분간 fresh 상태 유지
        staleTime: 1000 * 60,
        // 5분 동안 캐시 유지 후 가비지 컬렉션
        gcTime: 1000 * 60 * 5,
      },
    },
  });
}

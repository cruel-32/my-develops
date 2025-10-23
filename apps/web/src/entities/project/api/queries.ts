import { clientTrpc } from '@/web/shared/api';

// 프로젝트 목록 조회
export const useProjectsQuery = () => {
  return clientTrpc.projects.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// 특정 프로젝트 상세 조회
export const useProjectQuery = (projectId: number) => {
  return clientTrpc.projects.get.useQuery(
    { id: projectId },
    {
      enabled: !!projectId, // projectId가 있을 때만 쿼리 실행
    }
  );
};

import { clientTrpc } from '@/web/shared/api';

export const useProjectsListQuery = () => {
  return clientTrpc.projects.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// 프로젝트 삭제
export const useDeleteProjectMutation = () => {
  return clientTrpc.projects.delete.useMutation({
    onError: (error) => {
      console.error('Failed to delete project:', error);
    },
  });
};

// 프로젝트 업데이트
export const useUpdateProjectMutation = () => {
  return clientTrpc.projects.update.useMutation({
    onError: (error) => {
      console.error('Failed to update project:', error);
    },
  });
};

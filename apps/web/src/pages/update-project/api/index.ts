import { clientTrpc } from '@/web/shared/api';

export const useGetProjectQuery = (projectId: number) => {
  return clientTrpc.projects.get.useQuery({ id: projectId });
};

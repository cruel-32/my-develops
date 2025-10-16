'use client';

import { clientTrpc } from '@/web/shared/api';

export const useProjectsQuery = () => {
  const { data, isPending, error } = clientTrpc.projects.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    projects: data,
    isPending,
    error,
  };
};

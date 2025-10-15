'use client';

import { trpc } from '@/web/shared/api';

export const useProjectsQuery = () => {
  const { data, isPending, error } = trpc.trpc.projects.list.useQuery();

  return {
    projects: data,
    isPending,
    error,
  };
};

'use client';

import { trpc } from '@/web/shared/api';

export const useProjectsQuery = () => {
  const { data, isLoading, error } = trpc.trpc.projects.list.useQuery();

  return {
    projects: data,
    isLoading,
    error,
  };
};

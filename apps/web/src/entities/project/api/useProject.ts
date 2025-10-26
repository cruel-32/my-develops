'use client';
import { useGetApiProjects, useGetApiProjectsId } from '@/web/shared/api';
import { projectKeys } from './keys';
import { type ProjectList } from '../model/schema';

export const useGetProjects = () => {
  const { isPending, data } = useGetApiProjects<ProjectList>({
    query: {
      queryKey: [{ url: '/api/projects' }],
    },
  });
  return {
    isPending,
    data,
  };
};

export const useGetProjectById = (id: number) => {
  const { isPending, data } = useGetApiProjectsId(id, {
    query: {
      queryKey: projectKeys.detail(id),
    },
  });
  return {
    isPending,
    data,
  };
};

'use client';

import { useDeleteProjectMutation } from '../api';

export const useProjectItem = (projectId: number) => {
  const { mutate: deleteProject, isPending } = useDeleteProjectMutation();

  const handleDelete = () => {
    deleteProject({ id: projectId });
  };

  return {
    handleDelete,
    isPending,
  };
};

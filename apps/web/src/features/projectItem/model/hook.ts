'use client';

import { useDeleteProjectMutation } from '../api';

export const useProjectItem = (projectId: number) => {
  const { mutate: deleteProject, isPending } = useDeleteProjectMutation();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject({ id: projectId });
    }
  };

  return {
    handleDelete,
    isPending,
  };
};

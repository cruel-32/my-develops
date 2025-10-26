'use client';

// TODO: Implement useDeleteProjectMutation using fetch + React Query
// import { useDeleteProjectMutation } from '@/web/entities/project';

export const useProjectItem = (projectId: number) => {
  // TODO: Replace with fetch + React Query mutation
  // const { mutate: deleteProject, isPending } = useDeleteProjectMutation();
  const deleteProject = (data: any) => {};
  const isPending = false;

  const handleDelete = () => {
    deleteProject({ id: projectId });
  };

  return {
    handleDelete,
    isPending,
  };
};

'use client';

import { trpc } from '@/web/shared/api';

export const useDeleteProjectMutation = () => {
  const utils = trpc.useUtils();

  return trpc.projects.delete.useMutation({
    onSuccess: () => {
      // On successful deletion, invalidate the projects list to refetch
      utils.projects.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to delete project:', error);
      // TODO: Implement user-facing error notification
      alert('Failed to delete project.');
    },
  });
};

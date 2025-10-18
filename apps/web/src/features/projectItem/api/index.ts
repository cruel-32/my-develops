'use client';

import { clientTrpc } from '@/web/shared/api';
import { toast } from '@/web/shared/ui';

export const useDeleteProjectMutation = () => {
  const utils = clientTrpc.useUtils();

  return clientTrpc.projects.delete.useMutation({
    onSuccess: () => {
      // On successful deletion, invalidate the projects list to refetch
      utils.projects.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project.');
    },
  });
};

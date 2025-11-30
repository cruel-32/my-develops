'use client';

import { useRouter } from 'next/navigation';
import { useUnifiedMutation } from '@/web/shared/api/useUnifiedMutation';
import { deleteApiProjectsId } from '@repo/api';

export const useProjectItem = (projectId: number) => {
  const router = useRouter();

  const { mutate: deleteProject, isPending } = useUnifiedMutation(
    (vars: { id: number }) => deleteApiProjectsId(vars.id),
    {
      invalidateQueryKey: ['projects'],
      onSuccess: () => {
        router.refresh();
      },
    }
  );

  const handleDelete = () => {
    deleteProject({ id: projectId });
  };

  return {
    handleDelete,
    isPending,
  };
};

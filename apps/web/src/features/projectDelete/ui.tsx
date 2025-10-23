'use client';

import { useTransition } from 'react';
import { Button } from '@/web/shared/ui';
import { deleteProjectAction } from '@/web/shared/actions/projects';
import { toast } from '@/web/shared/ui';

interface DeleteProjectButtonProps {
  projectId: number;
}

export const DeleteProjectButton = ({
  projectId,
}: DeleteProjectButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteProjectAction(projectId);
        toast.success('Project deleted successfully!');
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to delete project'
        );
      }
    });
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isPending}
      className="cursor-pointer"
    >
      {isPending ? 'Deleting...' : 'Delete Project'}
    </Button>
  );
};

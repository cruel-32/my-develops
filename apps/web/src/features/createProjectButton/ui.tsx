'use client';

import { Card, Plus } from '@/web/shared/ui';
import { useRouter } from 'next/navigation';

export const CreateProjectButton = () => {
  const router = useRouter();
  const handleClick = () => {
    // TODO: Implement navigation to create project page or open a modal
    router.push('/dashboard/create');
  };

  return (
    <Card
      className="flex h-full min-h-[220px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Plus className="h-8 w-8" />
        <span className="font-semibold">Create New Project</span>
      </div>
    </Card>
  );
};

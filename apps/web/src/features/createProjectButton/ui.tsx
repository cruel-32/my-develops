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
    // Card의 최소 높이는 120px, 최소 너비는 140px 인데 패딩값 10px를 포함한 값으로 설정. 패딩값을 줘라.
    <Card
      className="flex h-full min-w-[300px] min-h-[200px] p-4 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Plus className="h-8 w-8" />
        <span className="font-semibold">Create New Project</span>
      </div>
    </Card>
  );
};

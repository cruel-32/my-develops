'use client';

import { ProjectList } from '@/web/widgets/projectList';

export const DashboardPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <ProjectList />
    </main>
  );
};

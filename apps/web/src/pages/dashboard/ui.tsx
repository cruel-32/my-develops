import { Suspense } from 'react';
import { HydrationBoundary } from '@tanstack/react-query';
import { ProjectList } from '@/web/widgets/projectList';
import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';
import { prefetchAndDehydrate } from '@/web/shared/api/hydration';
import { notFound } from 'next/navigation';
import { getProjects } from '@/web/entities/project/api/server';

export const DashboardPage = async () => {
  try {
    const dehydrated = await prefetchAndDehydrate({
      // todo: trpc가 자동으로 생성하는 queryKey를 어떻게 내야 하는지?
      key: [['projects', 'list'], { type: 'query' }],
      fn: getProjects,
    });

    return (
      <HydrationBoundary state={dehydrated}>
        <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
          <Header />
          <main className="flex flex-col items-center justify-center p-8">
            <Suspense fallback={<div>Loading projects...</div>}>
              <ProjectList />
            </Suspense>
          </main>
          <Footer />
        </div>
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('Failed to prefetch projects:', error);
    return notFound();
  }
};

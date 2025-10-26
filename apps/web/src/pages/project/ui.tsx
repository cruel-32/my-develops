import { ProjectList } from '@/web/widgets/projectList';
import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';
// TODO: Implement server-side data fetching and hydration for projects
// import { prefetchAndDehydrate } from '@/web/shared/api/hydration';
// import { getProjects } from '@/web/entities/project/api/server';

export const ProjectPage = () => {
  // TODO: Implement server-side data fetching for projects
  // try {
  //   const dehydrated = await prefetchAndDehydrate({
  //     key: [['projects', 'list'], { type: 'query' }],
  //     fn: getProjects,
  //   });
  //
  //   return (
  //     <HydrationBoundary state={dehydrated}>
  //       ...
  //     </HydrationBoundary>
  //   );
  // } catch (error) {
  //   console.error('Failed to prefetch projects:', error);
  //   return notFound();
  // }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center p-8">
        {/* <Suspense fallback={<div>Loading projects...</div>}> */}
        <ProjectList />
        {/* </Suspense> */}
      </main>
      <Footer />
    </div>
  );
};

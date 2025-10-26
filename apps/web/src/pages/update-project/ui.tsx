import { ProjectForm } from '@/web/features/projectForm';
import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';
import { Suspense } from 'react';
// TODO: Implement server-side project fetching
// import { getProjectById } from '@/web/entities/project/api/server';
import { notFound } from 'next/navigation';

type UpdateProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export const UpdateProjectPage = async ({ params }: UpdateProjectPageProps) => {
  // TODO: Implement server-side project fetching
  // const { projectId } = await params;
  // const id = Number(projectId);
  // const project = await getProjectById(id);
  // if (!project) {
  //   return notFound();
  // }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center p-8">
        <Suspense fallback={<div>Loading project...</div>}>
          <ProjectForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

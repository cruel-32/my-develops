import { ProjectForm } from '@/web/features/projectForm';
import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';
import { Suspense } from 'react';
import { getProjectById } from '@/web/entities/project/api/server';
import { notFound } from 'next/navigation';

type UpdateProjectPageProps = {
  params: { projectId: string };
};

export const UpdateProjectPage = async ({ params }: UpdateProjectPageProps) => {
  const { projectId } = params;
  const id = Number(projectId);

  if (isNaN(id)) {
    return notFound();
  }

  const project = await getProjectById(id);

  if (!project) {
    return notFound();
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center p-8">
        <Suspense fallback={<div>Loading project...</div>}>
          <ProjectForm initialData={project} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

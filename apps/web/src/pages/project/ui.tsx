import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProjectById } from '@/web/entities/project/api/server';

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export const ProjectPage = async ({ params }: ProjectPageProps) => {
  const { projectId } = await params;
  const id = Number(projectId);
  const project = await getProjectById(id, {
    tags: [`project-${id}`],
    revalidate: 60 * 5,
  });

  if (!project) {
    return notFound();
  }
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center p-8">
        <Suspense fallback={<div>Loading project...</div>}>
          {project.name}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

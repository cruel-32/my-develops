import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';
import { notFound } from 'next/navigation';

import { getApiProjects } from '@repo/api';

export const ProjectDetailPage = async () => {
  try {
    const projects = await getApiProjects();
    return (
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
        <Header />
        <main className="flex flex-col items-center justify-center p-8">
          사이드바와 프로젝트 디테일이 포함되어야함
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Failed to prefetch projects:', error);
    // In a real app, you might want to show a dedicated error page
    return notFound();
  }
};

import { ProjectList } from '@/web/widgets/projectList';
import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';
import { notFound } from 'next/navigation';

export const ProjectPage = async () => {
  try {
    return (
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
        <Header />
        <main className="flex flex-col items-center justify-center p-8">
          <ProjectList />
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

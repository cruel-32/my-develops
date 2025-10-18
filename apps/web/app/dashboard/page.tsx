import { Suspense } from 'react';
import { ProjectList } from '@/web/widgets/projectList';
import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';

export default function Page() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center p-8">
        <Suspense fallback={<div>Loading projects...</div>}>
          <ProjectList />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

import { ProjectList } from '@/web/widgets/projectList';
import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';

// Main Content Component
const MainContent = () => (
  <main className="flex flex-grow flex-col items-center p-8">
    <ProjectList />
  </main>
);

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen space-between">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}

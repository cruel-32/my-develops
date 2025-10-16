import { LoginPage, metadata } from '@/web/pages/login';
import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';

export { metadata };

export default function Page() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center p-8">
        <LoginPage />
      </main>
      <Footer />
    </div>
  );
}

import { LoginForm } from '@/web/features/loginForm';
import { Header } from '@/web/widgets/header';
import { Footer } from '@/web/widgets/footer';

export const LoginPage = () => {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center p-8">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
};

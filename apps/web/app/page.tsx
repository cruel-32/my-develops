import { LoginPage, metadata } from '@/web/pages/login';

export { metadata };

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <LoginPage />
    </main>
  );
}

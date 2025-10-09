import { JoinPage, metadata } from '@/views/join';

export { metadata };

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <JoinPage />
    </main>
  );
}

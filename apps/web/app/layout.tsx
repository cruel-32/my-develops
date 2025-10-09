import DefaultApp, { metadata } from '@/app';

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultApp>{children}</DefaultApp>;
}

import DefaultApp, { metadata } from '@/web/app';

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DefaultApp>{children}</DefaultApp>;
}

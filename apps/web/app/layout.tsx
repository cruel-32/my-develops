import DefaultApp, { metadata } from '@/web/app';
import { getApiUsersMe } from '@repo/api';

export { metadata };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getApiUsersMe().catch(() => null);
  console.log('RootLayout ::::::: ', user ? 'Authenticated' : 'Guest');
  return <DefaultApp user={user}>{children}</DefaultApp>;
}

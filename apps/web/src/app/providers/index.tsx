import ClientQueryProvider from './ClientQueryProvider';
import ToastProvider from './ToastProvider';
import ThemeProvider from './ThemeProvider';
import { AuthProvider } from '@/web/shared/auth/AuthContext';

export default function WithProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <ClientQueryProvider>{children}</ClientQueryProvider>
          <ToastProvider />
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

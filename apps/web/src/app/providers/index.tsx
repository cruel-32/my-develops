import ClientTRPCProvider from './ClientTRPCProvider';
import ToastProvider from './ToastProvider';
import ThemeProvider from './ThemeProvider';

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
        <ClientTRPCProvider>{children}</ClientTRPCProvider>
        <ToastProvider />
      </ThemeProvider>
    </>
  );
}

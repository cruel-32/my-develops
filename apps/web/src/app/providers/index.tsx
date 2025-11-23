import ClientQueryProvider from './ClientQueryProvider';
import ToastProvider from './ToastProvider';
import ThemeProvider from './ThemeProvider';

export default function WithProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('WithProviders ::::::: ');
  return (
    <>
      <ClientQueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastProvider />
        </ThemeProvider>
      </ClientQueryProvider>
    </>
  );
}

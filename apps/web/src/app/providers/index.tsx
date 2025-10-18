import ClientTRPCProvider from './ClientTRPCProvider';
import ToastProvider from './ToastProvider';

export default function WithProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientTRPCProvider>{children}</ClientTRPCProvider>
      <ToastProvider />
    </>
  );
}

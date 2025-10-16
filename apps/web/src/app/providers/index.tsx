import ClientTRPCProvider from './ClientTRPCProvider';

export default function WithProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientTRPCProvider>{children}</ClientTRPCProvider>
    </>
  );
}

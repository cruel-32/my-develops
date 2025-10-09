import TRPCProviderApp from './TRPCProvider';

export default function WithProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TRPCProviderApp>{children}</TRPCProviderApp>
    </>
  );
}

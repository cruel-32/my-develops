import { BaseLayout } from '@/widgets/base-layout';
import { LoginForm } from '@/features/loginForm';

export const LoginPage = () => {
  return (
    <>
      <BaseLayout>
        <LoginForm />
      </BaseLayout>
    </>
  );
};

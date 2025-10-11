import { BaseLayout } from '@/web/widgets/base-layout';
import { LoginForm } from '@/web/features/loginForm';

export const LoginPage = () => {
  return (
    <>
      <BaseLayout>
        <LoginForm />
      </BaseLayout>
    </>
  );
};

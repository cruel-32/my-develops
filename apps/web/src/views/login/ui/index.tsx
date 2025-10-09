import { BaseLayout } from '@/widgets/layouts';
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

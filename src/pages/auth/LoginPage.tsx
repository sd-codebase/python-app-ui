import { AuthLayout } from '@components/layout';
import { LoginForm } from '@components/auth';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <LoginForm />
    </AuthLayout>
  );
};

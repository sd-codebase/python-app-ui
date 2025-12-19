import { AuthLayout } from '@components/layout';
import { SignupForm } from '@components/auth';

export const SignupPage: React.FC = () => {
  return (
    <AuthLayout title="Create Account" subtitle="Sign up for a new account">
      <SignupForm />
    </AuthLayout>
  );
};

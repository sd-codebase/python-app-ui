import { AuthLayout } from '@components/layout';
import { ForgotPasswordForm } from '@components/auth';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout title="Forgot Password" subtitle="Reset your password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

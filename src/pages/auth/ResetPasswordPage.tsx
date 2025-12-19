import { AuthLayout } from '@components/layout';
import { ResetPasswordForm } from '@components/auth';

export const ResetPasswordPage: React.FC = () => {
  return (
    <AuthLayout title="Reset Password" subtitle="Enter the code and set a new password">
      <ResetPasswordForm />
    </AuthLayout>
  );
};

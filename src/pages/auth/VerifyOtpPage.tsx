import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@components/layout';
import { VerifyOtpForm } from '@components/auth';
import { LoadingSpinner } from '@components/common';
import { useAuthStore } from '@stores/authStore';
import { ROUTES } from '@utils/constants';

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to allow Zustand state to hydrate
    const timer = setTimeout(() => {
      const currentState = useAuthStore.getState().signupFlow;
      if (!currentState.email || currentState.step !== 'verify-otp') {
        navigate(ROUTES.SIGNUP, { replace: true });
      } else {
        setIsReady(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (!isReady) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <AuthLayout title="Verify Email" subtitle="Enter the code sent to your email">
      <VerifyOtpForm />
    </AuthLayout>
  );
};

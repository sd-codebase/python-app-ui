import { useState } from 'react';
import { Form, Button, Alert, Typography } from 'antd';
import { useAuth } from '@hooks/useAuth';
import { useNotification } from '@hooks/useNotification';
import { OtpInput } from './OtpInput';

const { Text } = Typography;

export const VerifyOtpForm: React.FC = () => {
  const [otp, setOtp] = useState('');
  const { verifyOtp, isVerifyingOtp, verifyOtpError, signupFlow } = useAuth();
  const { error } = useNotification();

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      error('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      await verifyOtp({ email: signupFlow.email, otp });
    } catch (err) {
      error('OTP verification failed');
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit} size="large">
      {verifyOtpError && (
        <Alert
          message={verifyOtpError}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <Text type="secondary">
          We&apos;ve sent a verification code to <strong>{signupFlow.email}</strong>
        </Text>
      </div>

      <Form.Item label="Verification Code">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <OtpInput value={otp} onChange={setOtp} disabled={isVerifyingOtp} />
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isVerifyingOtp}
          disabled={otp.length !== 6}
          block
        >
          Verify OTP
        </Button>
      </Form.Item>
    </Form>
  );
};

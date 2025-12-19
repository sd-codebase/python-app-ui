import { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useNotification } from '@hooks/useNotification';
import { ROUTES, VALIDATION } from '@utils/constants';
import { OtpInput } from './OtpInput';

const { Text } = Typography;

interface FormValues {
  email: string;
  new_password: string;
  confirmPassword: string;
}

export const ResetPasswordForm: React.FC = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const { resetPassword, isResettingPassword, resetPasswordError } = useAuth();
  const { success, error } = useNotification();

  const emailFromState = (location.state as { email?: string })?.email || '';

  const handleSubmit = async (values: FormValues) => {
    if (otp.length !== 6) {
      error('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      await resetPassword({
        email: values.email,
        otp,
        new_password: values.new_password,
      });
      success('Password reset successfully! Please sign in.');
    } catch (err) {
      error('Failed to reset password');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
      size="large"
      initialValues={{ email: emailFromState }}
    >
      {resetPasswordError && (
        <Alert
          message={resetPasswordError}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <Text type="secondary">
          Enter the verification code sent to your email and set a new password.
        </Text>
      </div>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Enter your email" />
      </Form.Item>

      <Form.Item label="Verification Code">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <OtpInput value={otp} onChange={setOtp} disabled={isResettingPassword} />
        </div>
      </Form.Item>

      <Form.Item
        name="new_password"
        label="New Password"
        rules={[
          { required: true, message: 'Please enter your new password' },
          { min: VALIDATION.PASSWORD_MIN, message: `Password must be at least ${VALIDATION.PASSWORD_MIN} characters` },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm New Password"
        dependencies={['new_password']}
        rules={[
          { required: true, message: 'Please confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('new_password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isResettingPassword}
          disabled={otp.length !== 6}
          block
        >
          Reset Password
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        <Link to={ROUTES.LOGIN}>Back to Sign In</Link>
      </div>
    </Form>
  );
};

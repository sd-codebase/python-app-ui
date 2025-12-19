import { Form, Input, Button, Alert, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useNotification } from '@hooks/useNotification';
import { ROUTES } from '@utils/constants';
import type { ForgotPasswordRequest } from '@app-types/index';

const { Text } = Typography;

export const ForgotPasswordForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { forgotPassword, isForgettingPassword, forgotPasswordError } = useAuth();
  const { success, error } = useNotification();

  const handleSubmit = async (values: ForgotPasswordRequest) => {
    try {
      await forgotPassword(values);
      success('If the email exists, a reset code has been sent');
      navigate(ROUTES.RESET_PASSWORD, { state: { email: values.email } });
    } catch (err) {
      error('Failed to send reset code');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
      size="large"
    >
      {forgotPasswordError && (
        <Alert
          message={forgotPasswordError}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <Text type="secondary">
          Enter your email address and we&apos;ll send you a code to reset your password.
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

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isForgettingPassword} block>
          Send Reset Code
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        <Link to={ROUTES.LOGIN}>Back to Sign In</Link>
      </div>
    </Form>
  );
};

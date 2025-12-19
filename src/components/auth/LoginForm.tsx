import { Form, Input, Button, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useNotification } from '@hooks/useNotification';
import { ROUTES, VALIDATION } from '@utils/constants';
import type { LoginRequest } from '@app-types/index';

export const LoginForm: React.FC = () => {
  const [form] = Form.useForm();
  const { login, isLoggingIn, loginError } = useAuth();
  const { error } = useNotification();

  const handleSubmit = async (values: LoginRequest) => {
    try {
      await login(values);
    } catch (err) {
      error('Login failed');
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
      {loginError && (
        <Alert
          message={loginError}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

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

      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: 'Please enter your password' },
          { min: VALIDATION.PASSWORD_MIN, message: `Password must be at least ${VALIDATION.PASSWORD_MIN} characters` },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
      </Form.Item>

      <Form.Item>
        <Link to={ROUTES.FORGOT_PASSWORD} style={{ float: 'right' }}>
          Forgot password?
        </Link>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoggingIn} block>
          Sign In
        </Button>
      </Form.Item>
    </Form>
  );
};

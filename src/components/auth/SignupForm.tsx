import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useNotification } from '@hooks/useNotification';
import { ROUTES, VALIDATION } from '@utils/constants';
import type { SignupRequest } from '@app-types/index';

export const SignupForm: React.FC = () => {
  const [form] = Form.useForm();
  const { signup, isSigningUp, signupError } = useAuth();
  const { error } = useNotification();

  const handleSubmit = async (values: SignupRequest) => {
    try {
      await signup(values);
    } catch (err) {
      error('Signup failed');
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
      {signupError && (
        <Alert
          message={signupError}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form.Item
        name="full_name"
        label="Full Name"
        rules={[
          { required: true, message: 'Please enter your full name' },
          { min: VALIDATION.FULL_NAME_MIN, message: `Name must be at least ${VALIDATION.FULL_NAME_MIN} characters` },
          { max: VALIDATION.FULL_NAME_MAX, message: `Name must be less than ${VALIDATION.FULL_NAME_MAX} characters` },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
      </Form.Item>

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
        <Button type="primary" htmlType="submit" loading={isSigningUp} block>
          Sign Up
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
      </div>
    </Form>
  );
};

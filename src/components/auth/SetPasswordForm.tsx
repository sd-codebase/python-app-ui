import { Form, Input, Button, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '@hooks/useAuth';
import { useNotification } from '@hooks/useNotification';
import { VALIDATION } from '@utils/constants';

interface FormValues {
  password: string;
  confirmPassword: string;
}

export const SetPasswordForm: React.FC = () => {
  const [form] = Form.useForm();
  const { setPassword, isSettingPassword, setPasswordError, signupFlow } = useAuth();
  const { error, success } = useNotification();

  const handleSubmit = async (values: FormValues) => {
    try {
      await setPassword({ email: signupFlow.email, password: values.password });
      success('Password set successfully! Please sign in.');
    } catch (err) {
      error('Failed to set password');
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
      {setPasswordError && (
        <Alert
          message={setPasswordError}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

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

      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isSettingPassword} block>
          Set Password
        </Button>
      </Form.Item>
    </Form>
  );
};

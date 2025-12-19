import { Form, Input, Button, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '@hooks/useAuth';
import { useNotification } from '@hooks/useNotification';
import { VALIDATION } from '@utils/constants';

interface FormValues {
  current_password: string;
  new_password: string;
  confirmPassword: string;
}

export const ChangePasswordForm: React.FC = () => {
  const [form] = Form.useForm();
  const { changePassword, isChangingPassword, changePasswordError } = useAuth();
  const { success, error } = useNotification();

  const handleSubmit = async (values: FormValues) => {
    try {
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      success('Password changed successfully!');
      form.resetFields();
    } catch (err) {
      error('Failed to change password');
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
      {changePasswordError && (
        <Alert
          message={changePasswordError}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form.Item
        name="current_password"
        label="Current Password"
        rules={[{ required: true, message: 'Please enter your current password' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
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
          { required: true, message: 'Please confirm your new password' },
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
        <Button type="primary" htmlType="submit" loading={isChangingPassword}>
          Change Password
        </Button>
      </Form.Item>
    </Form>
  );
};

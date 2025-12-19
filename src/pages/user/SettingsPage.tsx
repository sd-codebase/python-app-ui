import { Typography, Card, Tabs } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { AppLayout } from '@components/layout';
import { ChangePasswordForm } from '@components/auth';
import { useAuth } from '@hooks/useAuth';

const { Title, Text } = Typography;

export const UserSettingsPage: React.FC = () => {
  const { user } = useAuth();

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> Profile
        </span>
      ),
      children: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Full Name</Text>
            <div style={{ fontSize: 16 }}>{user?.full_name}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Email</Text>
            <div style={{ fontSize: 16 }}>{user?.email}</div>
          </div>
          <div>
            <Text type="secondary">Role</Text>
            <div style={{ fontSize: 16, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined /> Security
        </span>
      ),
      children: (
        <Card title="Change Password">
          <ChangePasswordForm />
        </Card>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Settings</Title>
        <Text type="secondary">Manage your account settings</Text>
      </div>

      <Tabs items={tabItems} />
    </AppLayout>
  );
};

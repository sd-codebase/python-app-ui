import { Typography, Card, Row, Col, Statistic } from 'antd';
import { TeamOutlined, UserOutlined, SafetyOutlined } from '@ant-design/icons';
import { AppLayout } from '@components/layout';
import { useAuth } from '@hooks/useAuth';
import { useUsers } from '@hooks/useUser';

const { Title, Text } = Typography;

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { users, isLoadingUsers } = useUsers();

  const activeUsers = users.filter((u) => u.is_active).length;
  const verifiedUsers = users.filter((u) => u.is_verified).length;

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Admin Dashboard</Title>
        <Text type="secondary">Welcome back, {user?.full_name}!</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={isLoadingUsers}>
            <Statistic
              title="Total Users"
              value={users.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={isLoadingUsers}>
            <Statistic
              title="Active Users"
              value={activeUsers}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={isLoadingUsers}>
            <Statistic
              title="Verified Users"
              value={verifiedUsers}
              prefix={<SafetyOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
};

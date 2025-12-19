import { Typography, Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { AppLayout } from '@components/layout';
import { useAuth } from '@hooks/useAuth';
import { formatDate } from '@utils/helpers';

const { Title, Text } = Typography;

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Welcome back, {user?.full_name}!</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Account Status"
              value={user?.is_active ? 'Active' : 'Inactive'}
              prefix={<CheckCircleOutlined style={{ color: user?.is_active ? '#52c41a' : '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Role"
              value={user?.role || 'User'}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Member Since"
              value={user?.created_at ? formatDate(user.created_at) : '-'}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Profile Information</Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text type="secondary">Full Name</Text>
            <div>{user?.full_name}</div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Email</Text>
            <div>{user?.email}</div>
          </Col>
        </Row>
      </Card>
    </AppLayout>
  );
};

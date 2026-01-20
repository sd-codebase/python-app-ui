import { Typography, Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, CalendarOutlined, CheckCircleOutlined, TagOutlined } from '@ant-design/icons';
import { AppLayout } from '@components/layout';
import { useAuth } from '@hooks/useAuth';
import { formatDateTime } from '@utils/helpers';

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
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Account Status"
              value={user?.is_active ? 'Active' : 'Inactive'}
              prefix={<CheckCircleOutlined style={{ color: user?.is_active ? '#52c41a' : '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Role"
              value={user?.role || 'User'}
              prefix={<UserOutlined />}
              valueStyle={{ textTransform: 'capitalize' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="User Type"
              value={user?.user_type || '-'}
              prefix={<TagOutlined />}
              valueStyle={{ textTransform: 'capitalize' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Member Since"
              value={user?.created_at ? formatDateTime(user.created_at) : '-'}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Profile Information</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Text type="secondary">Full Name</Text>
            <div>{user?.full_name}</div>
          </Col>
          <Col xs={24} sm={12}>
            <Text type="secondary">Email</Text>
            <div>{user?.email}</div>
          </Col>
          <Col xs={24} sm={12}>
            <Text type="secondary">User Type</Text>
            <div style={{ textTransform: 'capitalize' }}>{user?.user_type || '-'}</div>
          </Col>
          <Col xs={24} sm={12}>
            <Text type="secondary">Created At</Text>
            <div>{user?.created_at ? formatDateTime(user.created_at) : '-'}</div>
          </Col>
        </Row>
      </Card>
    </AppLayout>
  );
};

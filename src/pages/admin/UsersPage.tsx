import { useState } from 'react';
import {
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Popconfirm,
  Input,
  Select,
  Card,
  Row,
  Col,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  DeleteOutlined,
  UserOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AppLayout } from '@components/layout';
import { useUsers } from '@hooks/useUser';
import { formatDateTime } from '@utils/helpers';
import type { User, UserRole, UserFilters } from '@app-types/index';

const { Title, Text } = Typography;

export const AdminUsersPage: React.FC = () => {
  const [filters, setFilters] = useState<UserFilters>({});

  const {
    users,
    isLoadingUsers,
    deleteUser,
    isDeletingUser,
  } = useUsers(filters);

  const handleFilterChange = (key: keyof UserFilters, value: string | boolean | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('User deleted successfully');
    } catch (err) {
      message.error('Failed to delete user');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={role === 'admin' ? 'purple' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'User Type',
      dataIndex: 'user_type',
      key: 'user_type',
      render: (userType: string) => (
        <Tag color={userType === 'temp' ? 'orange' : 'green'}>
          {userType?.toUpperCase() || 'REGULAR'}
        </Tag>
      ),
    },
    {
      title: 'OTP',
      dataIndex: 'otp_code',
      key: 'otp_code',
      render: (otpCode: string | null) => (
        otpCode ? <Tag color="cyan">{otpCode}</Tag> : <Text type="secondary">-</Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Tag
            icon={record.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={record.is_active ? 'success' : 'error'}
          >
            {record.is_active ? 'Active' : 'Inactive'}
          </Tag>
          {record.is_verified && <Tag color="blue">Verified</Tag>}
        </Space>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        record.user_type === 'temp' || !record.is_active ? (
          <Popconfirm
            title="Delete user?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={isDeletingUser}
            >
              Delete
            </Button>
          </Popconfirm>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <UserOutlined style={{ marginRight: 12 }} />
          Users Management
        </Title>
        <Text type="secondary">Manage all users in the system</Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <FilterOutlined style={{ marginRight: 8 }} />
            <Text strong>Filters:</Text>
          </Col>
          <Col flex="200px">
            <Input
              placeholder="Search name or email"
              prefix={<SearchOutlined />}
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col flex="150px">
            <Select
              placeholder="Role"
              value={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'User', value: 'user' },
              ]}
            />
          </Col>
          <Col flex="150px">
            <Select
              placeholder="Status"
              value={filters.is_active}
              onChange={(value) => handleFilterChange('is_active', value)}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
              ]}
            />
          </Col>
          <Col flex="150px">
            <Select
              placeholder="Verified"
              value={filters.is_verified}
              onChange={(value) => handleFilterChange('is_verified', value)}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: 'Verified', value: true },
                { label: 'Unverified', value: false },
              ]}
            />
          </Col>
          <Col>
            <Button icon={<ClearOutlined />} onClick={clearFilters}>
              Clear
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={isLoadingUsers}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} users`,
        }}
      />
    </AppLayout>
  );
};

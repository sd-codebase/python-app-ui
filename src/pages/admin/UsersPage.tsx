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
  Modal,
  Form,
  Card,
  Row,
  Col,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  UserOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AppLayout } from '@components/layout';
import { useUsers } from '@hooks/useUser';
import { formatDateTime } from '@utils/helpers';
import type { User, UserRole, UserFilters, UserCreate, UserUpdate } from '@app-types/index';

const { Title, Text } = Typography;

export const AdminUsersPage: React.FC = () => {
  const [filters, setFilters] = useState<UserFilters>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const {
    users,
    isLoadingUsers,
    createUser,
    isCreatingUser,
    updateUser,
    isUpdatingUser,
    deleteUser,
    isDeletingUser,
    toggleActive,
    isTogglingActive,
    resetPassword,
    isResettingPassword,
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

  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      await createUser(values as UserCreate);
      message.success('User created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
    } catch (err) {
      message.error('Failed to create user');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    try {
      const values = await editForm.validateFields();
      await updateUser({ id: editingUser.id, data: values as UserUpdate });
      message.success('User updated successfully');
      setIsEditModalOpen(false);
      setEditingUser(null);
      editForm.resetFields();
    } catch (err) {
      message.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('User deleted successfully');
    } catch (err) {
      message.error('Failed to delete user');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActive(id);
      message.success('User status updated');
    } catch (err) {
      message.error('Failed to update user status');
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      const response = await resetPassword(id);
      if (response.data?.new_password) {
        setNewPassword(response.data.new_password);
      } else {
        message.success('Password reset successfully');
      }
    } catch (err) {
      message.error('Failed to reset password');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    });
    setIsEditModalOpen(true);
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
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title={record.is_active ? 'Deactivate user?' : 'Activate user?'}
            description={`This will ${record.is_active ? 'deactivate' : 'activate'} the user.`}
            onConfirm={() => handleToggleActive(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              type={record.is_active ? 'default' : 'primary'}
              loading={isTogglingActive}
            >
              {record.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Reset password?"
            description="This will generate a new password for the user."
            onConfirm={() => handleResetPassword(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              icon={<KeyOutlined />}
              loading={isResettingPassword}
            >
              Reset
            </Button>
          </Popconfirm>
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
            />
          </Popconfirm>
        </Space>
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
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create User
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

      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={isCreateModalOpen}
        onOk={handleCreateUser}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        confirmLoading={isCreatingUser}
        okText="Create"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            initialValue="user"
          >
            <Select
              options={[
                { label: 'User', value: 'user' },
                { label: 'Admin', value: 'admin' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={isEditModalOpen}
        onOk={handleEditUser}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        confirmLoading={isUpdatingUser}
        okText="Save"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
          >
            <Select
              options={[
                { label: 'User', value: 'user' },
                { label: 'Admin', value: 'admin' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="Status"
          >
            <Select
              options={[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* New Password Modal */}
      <Modal
        title="Password Reset Successful"
        open={!!newPassword}
        onOk={() => setNewPassword(null)}
        onCancel={() => setNewPassword(null)}
        footer={[
          <Button
            key="copy"
            onClick={() => {
              navigator.clipboard.writeText(newPassword || '');
              message.success('Password copied to clipboard');
            }}
          >
            Copy Password
          </Button>,
          <Button key="ok" type="primary" onClick={() => setNewPassword(null)}>
            OK
          </Button>,
        ]}
      >
        <Text>The new password for the user is:</Text>
        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
          <Text code copyable style={{ fontSize: 16 }}>{newPassword}</Text>
        </div>
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          Please share this password securely with the user.
        </Text>
      </Modal>
    </AppLayout>
  );
};

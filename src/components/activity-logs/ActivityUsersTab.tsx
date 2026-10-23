import { useState } from 'react';
import { Table, Input, Space, Tag, Typography, Button, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { activityLogService } from '@services/activityLog.service';
import type { ActivityUserSummary } from '@app-types/index';
import { formatTs } from './activityLogFormat';

const { Text } = Typography;

const PAGE_SIZE = 20;

interface Props {
  onOpenTimeline: (userId: string) => void;
}

export const ActivityUsersTab: React.FC<Props> = ({ onOpenTimeline }) => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery({
    queryKey: ['activityUsers', search, page],
    queryFn: () => activityLogService.getUsers(search, (page - 1) * PAGE_SIZE, PAGE_SIZE),
    placeholderData: (previous) => previous,
  });

  const applySearch = () => {
    setSearch(searchInput.trim() || undefined);
    setPage(1);
  };

  const columns: ColumnsType<ActivityUserSummary> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Button type="link" style={{ padding: 0 }} onClick={() => onOpenTimeline(record.user_id)}>
            {record.full_name || record.user_id.slice(0, 8)}
          </Button>
          {record.whatsapp_number && <Text type="secondary">{record.whatsapp_number}</Text>}
          {record.user_type === 'temp' && <Tag color="orange">Guest</Tag>}
        </Space>
      ),
    },
    {
      title: 'Last active',
      dataIndex: 'last_ts',
      key: 'last_ts',
      render: (ts: string, record) => (
        <Space direction="vertical" size={0}>
          <Text>{formatTs(ts)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {[record.last_event, record.last_screen].filter(Boolean).join(' on ')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'First seen',
      dataIndex: 'first_ts',
      key: 'first_ts',
      render: (ts: string) => <Text type="secondary">{formatTs(ts)}</Text>,
    },
    {
      title: 'Events',
      dataIndex: 'events',
      key: 'events',
      align: 'right',
    },
    {
      title: 'Sessions',
      dataIndex: 'sessions',
      key: 'sessions',
      align: 'right',
    },
    {
      title: 'Devices',
      dataIndex: 'devices',
      key: 'devices',
      align: 'right',
    },
    {
      title: 'Tests submitted',
      dataIndex: 'tests_submitted',
      key: 'tests_submitted',
      align: 'right',
    },
    {
      title: (
        <Tooltip title="Events recorded before the user logged in, linked to them at login">Pre-login</Tooltip>
      ),
      dataIndex: 'pre_login_events',
      key: 'pre_login_events',
      align: 'right',
    },
    {
      title: 'Errors',
      dataIndex: 'errors',
      key: 'errors',
      align: 'right',
      render: (errors: number) => (errors > 0 ? <Text type="danger">{errors}</Text> : errors),
    },
    {
      title: 'App',
      key: 'app',
      render: (_, record) => (
        <Text type="secondary">{[record.app_variant, record.app_version].filter(Boolean).join(' · ')}</Text>
      ),
    },
    {
      title: '',
      key: 'timeline',
      render: (_, record) => (
        <Button size="small" onClick={() => onOpenTimeline(record.user_id)}>
          Timeline
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Space>
        <Input
          placeholder="Search by name or WhatsApp number"
          allowClear
          style={{ width: 320 }}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={applySearch}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={applySearch}>
          Search
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={data?.data?.items || []}
        rowKey="user_id"
        loading={isFetching}
        size="small"
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: data?.data?.total || 0,
          showSizeChanger: false,
          showTotal: (total) => `${total} users`,
          onChange: setPage,
        }}
      />
    </Space>
  );
};

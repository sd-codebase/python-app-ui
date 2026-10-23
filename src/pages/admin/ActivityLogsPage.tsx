import { useState } from 'react';
import {
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Card,
  Row,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Tooltip,
} from 'antd';
import { SearchOutlined, ClearOutlined, ReloadOutlined, MobileOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@components/layout';
import { activityLogService } from '@services/activityLog.service';
import type { ActivityLog, ActivityLogFilters, ActivityCategory } from '@app-types/index';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PAGE_SIZE = 50;

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  screen: 'blue',
  action: 'green',
  api: 'default',
  error: 'red',
  lifecycle: 'purple',
};

const formatTs = (ts: string) =>
  new Date(ts.endsWith('Z') ? ts : `${ts}Z`).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const formatDuration = (ms?: number | null) => {
  if (ms === null || ms === undefined) return null;
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
};

const summarizeProps = (props: Record<string, unknown>) =>
  Object.entries(props)
    .filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object')
    .slice(0, 6)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(' · ');

export const AdminActivityLogsPage: React.FC = () => {
  // Draft filters are edited in the form; applied filters drive the query
  const [draft, setDraft] = useState<ActivityLogFilters>({});
  const [filters, setFilters] = useState<ActivityLogFilters>({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ActivityLog | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['activityLogs', filters, page],
    queryFn: () =>
      activityLogService.getLogs({ ...filters, skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }),
    placeholderData: (previous) => previous,
  });

  const { data: device } = useQuery({
    queryKey: ['activityDevice', deviceId],
    queryFn: () => activityLogService.getDevice(deviceId!),
    enabled: !!deviceId,
  });

  const applyFilters = (next: ActivityLogFilters = draft) => {
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== undefined && v !== ''),
    ) as ActivityLogFilters;
    setDraft(cleaned);
    setFilters(cleaned);
    setPage(1);
  };

  // Clicking a user/device/session in the table narrows the search to it
  const filterBy = (key: keyof ActivityLogFilters, value: string) => applyFilters({ [key]: value });

  const columns: ColumnsType<ActivityLog> = [
    {
      title: 'Time',
      dataIndex: 'client_ts',
      key: 'client_ts',
      width: 150,
      render: (ts: string) => <Text style={{ whiteSpace: 'nowrap' }}>{formatTs(ts)}</Text>,
    },
    {
      title: 'User',
      key: 'user',
      width: 190,
      render: (_, record) => {
        if (!record.user_id) {
          return <Tag>Anonymous</Tag>;
        }
        const label = record.user?.full_name || record.user_id.slice(0, 8);
        return (
          <Space direction="vertical" size={0}>
            <Button type="link" size="small" style={{ padding: 0 }} onClick={() => filterBy('user_id', record.user_id!)}>
              {label}
            </Button>
            {record.user?.whatsapp_number && <Text type="secondary">{record.user.whatsapp_number}</Text>}
            <Space size={4}>
              {record.user_type === 'temp' && <Tag color="orange">Guest</Tag>}
              {record.pre_login && (
                <Tooltip title="Recorded before login, linked to this user after they logged in">
                  <Tag color="gold">Pre-login</Tag>
                </Tooltip>
              )}
            </Space>
          </Space>
        );
      },
    },
    {
      title: 'Event',
      key: 'event',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <Tag color={CATEGORY_COLORS[record.category]}>{record.category}</Tag>
            <Text strong>{record.name}</Text>
            {record.duration_ms !== null && record.duration_ms !== undefined && (
              <Text type="secondary">({formatDuration(record.duration_ms)})</Text>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {summarizeProps(record.props)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Screen',
      dataIndex: 'screen',
      key: 'screen',
      width: 140,
      render: (screen?: string | null) => screen || <Text type="secondary">-</Text>,
    },
    {
      title: 'Device / Session',
      key: 'device',
      width: 170,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Button
            type="link"
            size="small"
            icon={<MobileOutlined />}
            style={{ padding: 0 }}
            onClick={() => filterBy('device_id', record.device_id)}
          >
            {record.device_id.slice(0, 8)}
          </Button>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => filterBy('session_id', record.session_id)}>
            session {record.session_id.slice(0, 6)} #{record.seq}
          </Button>
        </Space>
      ),
    },
    {
      title: 'App',
      key: 'app',
      width: 120,
      render: (_, record) => (
        <Text type="secondary">
          {[record.app_variant, record.app_version, record.platform].filter(Boolean).join(' · ')}
        </Text>
      ),
    },
    {
      title: '',
      key: 'details',
      width: 80,
      render: (_, record) => (
        <Button size="small" onClick={() => setSelected(record)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Activity Logs</Title>
        <Text type="secondary">
          Everything users do in the app. Activity before login is linked to the user once they log in.
        </Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="WhatsApp number"
              allowClear
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              onPressEnter={() => applyFilters()}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="User ID"
              allowClear
              value={draft.user_id}
              onChange={(e) => setDraft({ ...draft, user_id: e.target.value })}
              onPressEnter={() => applyFilters()}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Device ID"
              allowClear
              value={draft.device_id}
              onChange={(e) => setDraft({ ...draft, device_id: e.target.value })}
              onPressEnter={() => applyFilters()}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Session ID"
              allowClear
              value={draft.session_id}
              onChange={(e) => setDraft({ ...draft, session_id: e.target.value })}
              onPressEnter={() => applyFilters()}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Category"
              allowClear
              style={{ width: '100%' }}
              value={draft.category}
              onChange={(value) => setDraft({ ...draft, category: value })}
              options={(Object.keys(CATEGORY_COLORS) as ActivityCategory[]).map((c) => ({ label: c, value: c }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Event name (e.g. test_submitted or otp_*)"
              allowClear
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onPressEnter={() => applyFilters()}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              showTime
              style={{ width: '100%' }}
              onChange={(range) =>
                setDraft({
                  ...draft,
                  from_ts: range?.[0]?.toISOString(),
                  to_ts: range?.[1]?.toISOString(),
                })
              }
            />
          </Col>
          <Col xs={24} md={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={() => applyFilters()}>
                Search
              </Button>
              <Button icon={<ClearOutlined />} onClick={() => applyFilters({})}>
                Clear
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.data?.items || []}
          rowKey="event_id"
          loading={isFetching}
          size="small"
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: data?.data?.total || 0,
            showSizeChanger: false,
            showTotal: (total) => `${total} events`,
            onChange: setPage,
          }}
        />
      </Card>

      <Drawer
        title={selected ? selected.name : ''}
        width={560}
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Time (device)">{formatTs(selected.client_ts)}</Descriptions.Item>
              <Descriptions.Item label="Received">{formatTs(selected.received_at)}</Descriptions.Item>
              <Descriptions.Item label="Category">{selected.category}</Descriptions.Item>
              <Descriptions.Item label="Screen">{selected.screen || '-'}</Descriptions.Item>
              <Descriptions.Item label="Duration">{formatDuration(selected.duration_ms) || '-'}</Descriptions.Item>
              <Descriptions.Item label="User">
                {selected.user_id
                  ? `${selected.user?.full_name ?? ''} ${selected.user?.whatsapp_number ?? ''} (${selected.user_id})`
                  : 'Anonymous'}
              </Descriptions.Item>
              <Descriptions.Item label="Pre-login">
                {selected.pre_login ? `Yes${selected.linked_at ? `, linked ${formatTs(selected.linked_at)}` : ''}` : 'No'}
              </Descriptions.Item>
              <Descriptions.Item label="Device">
                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setDeviceId(selected.device_id)}>
                  {selected.device_id}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="Session">{`${selected.session_id} #${selected.seq}`}</Descriptions.Item>
              <Descriptions.Item label="App">
                {[selected.app_variant, selected.app_version, selected.platform].filter(Boolean).join(' · ')}
              </Descriptions.Item>
              <Descriptions.Item label="IP">{selected.ip || '-'}</Descriptions.Item>
            </Descriptions>
            <div>
              <Text strong>Details</Text>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(selected.props, null, 2)}
              </pre>
            </div>
          </Space>
        )}
      </Drawer>

      <Drawer
        title="Device"
        width={480}
        open={!!deviceId}
        onClose={() => setDeviceId(null)}
      >
        {device?.data && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Device ID">{device.data.device_id}</Descriptions.Item>
            {Object.entries(device.data.info).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {value === null || value === undefined ? '-' : String(value)}
              </Descriptions.Item>
            ))}
            <Descriptions.Item label="Users on this device">
              <Space direction="vertical" size={0}>
                {device.data.user_ids.map((id) => (
                  <Button
                    key={id}
                    type="link"
                    size="small"
                    style={{ padding: 0 }}
                    onClick={() => {
                      setDeviceId(null);
                      setSelected(null);
                      filterBy('user_id', id);
                    }}
                  >
                    {id}
                  </Button>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="First seen">{formatTs(device.data.first_seen)}</Descriptions.Item>
            <Descriptions.Item label="Last seen">{formatTs(device.data.last_seen)}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </AppLayout>
  );
};

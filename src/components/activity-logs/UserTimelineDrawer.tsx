import { useMemo, useRef, useState } from 'react';
import { Drawer, Timeline, Typography, Space, Tag, Switch, Button, Empty, Spin, Card, Popover } from 'antd';
import { useInfiniteQuery } from '@tanstack/react-query';
import { activityLogService } from '@services/activityLog.service';
import type { ActivityLog } from '@app-types/index';
import { CATEGORY_COLORS, describeEvent, formatDay, formatDuration, formatTime, tsMillis } from './activityLogFormat';

const { Text, Title } = Typography;

const PAGE_SIZE = 200;

const DOT_COLORS: Record<string, string> = {
  screen: 'blue',
  action: 'green',
  api: 'gray',
  error: 'red',
  lifecycle: 'purple',
};

interface Session {
  id: string;
  events: ActivityLog[];
}

interface Props {
  userId: string | null;
  onClose: () => void;
  onShowInSearch?: (userId: string) => void;
}

export const UserTimelineDrawer: React.FC<Props> = ({ userId, onClose, onShowInSearch }) => {
  const [showApiCalls, setShowApiCalls] = useState(false);
  // Keep rendering the last user while the drawer animates closed
  const lastUserIdRef = useRef<string | null>(null);
  if (userId) lastUserIdRef.current = userId;
  const shownUserId = lastUserIdRef.current;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['activityTimeline', shownUserId, showApiCalls],
    queryFn: ({ pageParam }) =>
      activityLogService.getLogs({
        user_id: shownUserId!,
        exclude_category: showApiCalls ? undefined : ['api'],
        skip: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + (page.data?.items.length ?? 0), 0);
      return loaded < (lastPage.data?.total ?? 0) ? loaded : undefined;
    },
    enabled: !!shownUserId,
  });

  const logs = useMemo(() => data?.pages.flatMap((page) => page.data?.items ?? []) ?? [], [data]);
  const total = data?.pages[0]?.data?.total ?? 0;
  const user = logs.find((log) => log.user)?.user;

  // Logs arrive newest first: keep sessions newest first, show each session's events in order
  const sessions = useMemo(() => {
    const byId = new Map<string, Session>();
    for (const log of logs) {
      if (!byId.has(log.session_id)) byId.set(log.session_id, { id: log.session_id, events: [] });
      byId.get(log.session_id)!.events.push(log);
    }
    return Array.from(byId.values()).map((session) => ({
      ...session,
      events: [...session.events].sort((a, b) => tsMillis(a.client_ts) - tsMillis(b.client_ts) || a.seq - b.seq),
    }));
  }, [logs]);

  return (
    <Drawer
      title={
        <Space direction="vertical" size={0}>
          <Title level={5} style={{ margin: 0 }}>
            {user?.full_name || 'User'} timeline
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {[user?.whatsapp_number, shownUserId].filter(Boolean).join(' · ')}
          </Text>
        </Space>
      }
      width={680}
      open={!!userId}
      onClose={onClose}
      extra={
        <Space>
          <Text type="secondary">API calls</Text>
          <Switch size="small" checked={showApiCalls} onChange={setShowApiCalls} />
          {onShowInSearch && shownUserId && (
            <Button size="small" onClick={() => onShowInSearch(shownUserId)}>
              Show in event search
            </Button>
          )}
        </Space>
      }
    >
      {isLoading ? (
        <Spin />
      ) : sessions.length === 0 ? (
        <Empty description="No activity" />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Text type="secondary">
            Showing {logs.length} of {total} events{showApiCalls ? '' : ' (API calls hidden)'}, newest session first
          </Text>
          {sessions.map((session) => {
            const first = session.events[0];
            const last = session.events[session.events.length - 1];
            const spanMs = tsMillis(last.client_ts) - tsMillis(first.client_ts);
            const preLogin = session.events.every((e) => e.pre_login);
            return (
              <Card
                key={session.id}
                size="small"
                title={
                  <Space wrap size={4}>
                    <Text strong>{formatDay(first.client_ts)}</Text>
                    <Text type="secondary">
                      {formatTime(first.client_ts)} – {formatTime(last.client_ts)}
                      {spanMs > 0 ? ` (${formatDuration(spanMs)})` : ''}
                    </Text>
                    {preLogin && <Tag color="gold">Before login</Tag>}
                    {first.user_type === 'temp' && <Tag color="orange">Guest</Tag>}
                  </Space>
                }
                extra={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {[first.app_variant, first.app_version, `device ${first.device_id.slice(0, 8)}`].filter(Boolean).join(' · ')}
                  </Text>
                }
              >
                <Timeline
                  style={{ marginTop: 8 }}
                  items={session.events.map((log) => ({
                    key: log.event_id,
                    color: DOT_COLORS[log.category] ?? 'gray',
                    children: (
                      <Popover
                        trigger="click"
                        title={log.name}
                        content={
                          <pre style={{ maxWidth: 420, maxHeight: 300, overflow: 'auto', margin: 0 }}>
                            {JSON.stringify(log.props, null, 2)}
                          </pre>
                        }
                      >
                        <Space size={6} style={{ cursor: 'pointer' }} wrap>
                          <Text type="secondary" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {formatTime(log.client_ts)}
                          </Text>
                          <Tag color={CATEGORY_COLORS[log.category]} style={{ marginInlineEnd: 0 }}>
                            {log.category}
                          </Tag>
                          <Text type={log.category === 'error' ? 'danger' : undefined}>{describeEvent(log)}</Text>
                          {log.pre_login && !preLogin && <Tag color="gold">pre-login</Tag>}
                        </Space>
                      </Popover>
                    ),
                  }))}
                />
              </Card>
            );
          })}
          {hasNextPage && (
            <Button block loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
              Load older activity
            </Button>
          )}
        </Space>
      )}
    </Drawer>
  );
};

import { useState } from 'react';
import { Card, DatePicker, Space, Typography, Button, Alert, Modal, message } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { activityLogService } from '@services/activityLog.service';
import { getErrorMessage } from '@utils/helpers';
import { formatTs } from './activityLogFormat';

const { Text, Paragraph } = Typography;

// Must match RETENTION_MIN_DAYS on the backend, which enforces it too
const MIN_AGE_DAYS = 10;

// Dates are IST calendar days, whatever the admin's browser timezone is
const todayInIst = () => dayjs(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));

export const ActivityPurgePanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const latestAllowed = todayInIst().subtract(MIN_AGE_DAYS, 'day');
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const endDateStr = endDate?.format('YYYY-MM-DD');

  const { data: summary, isFetching: isLoadingSummary } = useQuery({
    queryKey: ['activityRangeSummary', endDateStr],
    queryFn: () => activityLogService.getRangeSummary(endDateStr!),
    enabled: !!endDateStr,
  });
  const count = summary?.data?.count ?? 0;

  const handleDownload = async () => {
    if (!endDateStr) return;
    setIsDownloading(true);
    try {
      await activityLogService.downloadLogs(endDateStr);
    } catch (err) {
      messageApi.error(getErrorMessage(err));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    if (!endDateStr) return;
    modal.confirm({
      title: `Delete ${count} activity logs?`,
      content: `All logs up to ${endDate!.format('DD MMM YYYY')} (end of day, IST) will be permanently deleted. This can't be undone, so download them first if you need them.`,
      okText: 'Delete permanently',
      okButtonProps: { danger: true },
      onOk: async () => {
        setIsDeleting(true);
        try {
          const result = await activityLogService.deleteLogs(endDateStr);
          messageApi.success(`Deleted ${result.data?.deleted ?? 0} activity logs`);
          queryClient.invalidateQueries({ queryKey: ['activityRangeSummary'] });
          queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
          queryClient.invalidateQueries({ queryKey: ['activityUsers'] });
          queryClient.invalidateQueries({ queryKey: ['activityTimeline'] });
        } catch (err) {
          messageApi.error(getErrorMessage(err));
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return (
    <Card>
      {modalContextHolder}
      {messageContextHolder}
      <Space direction="vertical" size="middle" style={{ maxWidth: 640 }}>
        <Paragraph style={{ margin: 0 }}>
          Download or delete all activity logs up to an end date. The end date must be at least{' '}
          {MIN_AGE_DAYS} days ago, so the latest you can pick today is{' '}
          <Text strong>{latestAllowed.format('DD MMM YYYY')}</Text>.
        </Paragraph>
        <Space wrap>
          <Text>Up to and including</Text>
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            format="DD MMM YYYY"
            disabledDate={(day) => day.isAfter(latestAllowed, 'day')}
            placeholder="Select end date"
          />
        </Space>
        {endDateStr && (
          <Alert
            type={count > 0 ? 'info' : 'warning'}
            showIcon
            message={
              isLoadingSummary
                ? 'Counting logs...'
                : count > 0
                  ? `${count} logs from ${formatTs(summary!.data!.oldest_ts!)} to ${endDate!.format('DD MMM YYYY')} 23:59 IST`
                  : `No logs up to ${endDate!.format('DD MMM YYYY')}`
            }
          />
        )}
        <Space>
          <Button
            icon={<DownloadOutlined />}
            disabled={!endDateStr || count === 0 || isLoadingSummary}
            loading={isDownloading}
            onClick={handleDownload}
          >
            Download CSV
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={!endDateStr || count === 0 || isLoadingSummary}
            loading={isDeleting}
            onClick={handleDelete}
          >
            Delete logs
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

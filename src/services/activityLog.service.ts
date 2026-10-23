import apiClient from '@config/axios';
import { ApiService } from './api.service';
import type {
  ApiResponse,
  ActivityLogList,
  ActivityLogFilters,
  ActivityDevice,
  ActivityLogRangeSummary,
  ActivityLogPurgeResult,
  ActivityUserSummaryList,
} from '@app-types/index';

class ActivityLogServiceClass extends ApiService {
  async getLogs(filters: ActivityLogFilters): Promise<ApiResponse<ActivityLogList>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === '') return;
      if (Array.isArray(value)) value.forEach((v) => params.append(key, String(v)));
      else params.append(key, String(value));
    });
    return this.get<ActivityLogList>(`/api/admin/activity-logs?${params.toString()}`);
  }

  async getUsers(search: string | undefined, skip: number, limit: number): Promise<ApiResponse<ActivityUserSummaryList>> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (search) params.append('search', search);
    return this.get<ActivityUserSummaryList>(`/api/admin/activity-logs/users?${params.toString()}`);
  }

  async getDevice(deviceId: string): Promise<ApiResponse<ActivityDevice>> {
    return this.get<ActivityDevice>(`/api/admin/activity-logs/devices/${encodeURIComponent(deviceId)}`);
  }

  // endDate is an IST calendar date (YYYY-MM-DD), inclusive, at least 10 days ago
  async getRangeSummary(endDate: string): Promise<ApiResponse<ActivityLogRangeSummary>> {
    return this.get<ActivityLogRangeSummary>(`/api/admin/activity-logs/range-summary?end_date=${endDate}`);
  }

  async downloadLogs(endDate: string): Promise<void> {
    const response = await apiClient.get<Blob>(`/api/admin/activity-logs/export?end_date=${endDate}`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-until-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async deleteLogs(endDate: string): Promise<ApiResponse<ActivityLogPurgeResult>> {
    return this.delete<ActivityLogPurgeResult>(`/api/admin/activity-logs?end_date=${endDate}`);
  }
}

export const activityLogService = new ActivityLogServiceClass();

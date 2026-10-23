import { ApiService } from './api.service';
import type {
  ApiResponse,
  ActivityLogList,
  ActivityLogFilters,
  ActivityDevice,
} from '@app-types/index';

class ActivityLogServiceClass extends ApiService {
  async getLogs(filters: ActivityLogFilters): Promise<ApiResponse<ActivityLogList>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.append(key, String(value));
    });
    return this.get<ActivityLogList>(`/api/admin/activity-logs?${params.toString()}`);
  }

  async getDevice(deviceId: string): Promise<ApiResponse<ActivityDevice>> {
    return this.get<ActivityDevice>(`/api/admin/activity-logs/devices/${encodeURIComponent(deviceId)}`);
  }
}

export const activityLogService = new ActivityLogServiceClass();

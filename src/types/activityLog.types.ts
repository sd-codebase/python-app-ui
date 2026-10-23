export type ActivityCategory = 'screen' | 'action' | 'api' | 'error' | 'lifecycle';

export interface ActivityLogUser {
  id: string;
  full_name?: string | null;
  whatsapp_number?: string | null;
  user_type?: string | null;
}

export interface ActivityLog {
  event_id: string;
  name: string;
  category: ActivityCategory;
  client_ts: string;
  received_at: string;
  device_id: string;
  session_id: string;
  seq: number;
  screen?: string | null;
  duration_ms?: number | null;
  user_id?: string | null;
  user_type?: string | null;
  pre_login: boolean;
  linked_at?: string | null;
  props: Record<string, unknown>;
  app_variant?: string | null;
  app_version?: string | null;
  platform?: string | null;
  ip?: string | null;
  user?: ActivityLogUser | null;
}

export interface ActivityLogList {
  items: ActivityLog[];
  total: number;
}

export interface ActivityLogFilters {
  user_id?: string;
  phone?: string;
  device_id?: string;
  session_id?: string;
  category?: ActivityCategory;
  name?: string;
  from_ts?: string;
  to_ts?: string;
  skip?: number;
  limit?: number;
}

export interface ActivityDevice {
  device_id: string;
  info: Record<string, unknown>;
  user_ids: string[];
  last_user_id?: string | null;
  first_seen: string;
  last_seen: string;
}

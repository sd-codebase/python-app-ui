import type { ActivityCategory, ActivityLog } from '@app-types/index';

export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  screen: 'blue',
  action: 'green',
  api: 'default',
  error: 'red',
  lifecycle: 'purple',
};

// Backend timestamps are UTC without a zone suffix
const toDate = (ts: string) => new Date(ts.endsWith('Z') ? ts : `${ts}Z`);

export const formatTs = (ts: string) =>
  toDate(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export const formatTime = (ts: string) =>
  toDate(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatDay = (ts: string) =>
  toDate(ts).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

export const tsMillis = (ts: string) => toDate(ts).getTime();

export const formatDuration = (ms?: number | null) => {
  if (ms === null || ms === undefined) return null;
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
  return `${Math.floor(ms / 3_600_000)}h ${Math.round((ms % 3_600_000) / 60_000)}m`;
};

export const summarizeProps = (props: Record<string, unknown>) =>
  Object.entries(props)
    .filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object')
    .slice(0, 6)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(' · ');

// One readable line per event for the user timeline
export const describeEvent = (log: ActivityLog): string => {
  const p = log.props as Record<string, any>;
  switch (log.name) {
    case 'screen_visit':
      return `Viewed ${log.screen ?? 'screen'} for ${formatDuration(log.duration_ms) ?? '?'}${p.ended_by === 'background' ? ' (then left the app)' : ''}`;
    case 'screen_view':
      return `Opened ${log.screen ?? 'screen'}`;
    case 'screen_leave':
      return `Left ${log.screen ?? 'screen'} after ${formatDuration(log.duration_ms) ?? '?'}`;
    case 'api_slow':
      return `Slow request: ${p.method} ${p.url} → ${p.status} (${formatDuration(log.duration_ms)})`;
    case 'ad_no_fill':
      return `No ${p.ad_type} ad available${p.label ? ` for "${p.label}"` : ''}`;
    case 'api_call':
      return `${p.method} ${p.url} → ${p.status} (${formatDuration(log.duration_ms)})`;
    case 'api_error':
      return `${p.method} ${p.url} failed${p.status ? ` (${p.status})` : ''}: ${p.error_message ?? ''}`;
    case 'test_submitted':
    case 'test_auto_submitted':
      return `${log.name === 'test_auto_submitted' ? 'Time up, test auto-submitted' : 'Submitted test'} "${p.test_name}": score ${p.score}/${p.max_score}, ${p.correct} correct, ${p.wrong} wrong, ${p.unanswered} unanswered`;
    case 'test_started':
      return `${p.resumed ? 'Resumed' : 'Started'} test "${p.test_name}" (${p.total_questions} questions)`;
    case 'app_background':
      return `App went to background (session ${formatDuration(log.duration_ms)})`;
    case 'app_foreground':
      return `App reopened after ${formatDuration(p.away_ms)}`;
    default: {
      const details = summarizeProps(log.props);
      return details ? `${log.name} · ${details}` : log.name;
    }
  }
};

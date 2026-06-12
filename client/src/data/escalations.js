// Shared escalation config + helpers (mirrors the prototype's escalation subsystem)

export const ESC_PRI_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

export const ESC_PRI_CFG = {
  critical: { label: 'Critical', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444' },
  high:     { label: 'High',     color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', dot: '#F97316' },
  medium:   { label: 'Medium',   color: '#CA8A04', bg: '#FEFCE8', border: '#FDE68A', dot: '#EAB308' },
  low:      { label: 'Low',      color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
};

export const ESC_STATUSES = ['Open', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
export const ESC_OPEN_STATUSES = ['Open', 'Under Review', 'In Progress'];
export const ESC_STATUS_BADGE = {
  'Open': 'danger', 'Under Review': 'warning', 'In Progress': 'info',
  'Resolved': 'success', 'Closed': 'neutral',
};

export const ESC_CATEGORIES = ['Deadline Risk', 'Blocker', 'Resource Issue', 'Client Issue', 'Technical Issue', 'Other'];

export const PRIORITY_OPTIONS = [
  { value: 'critical', label: '🔴 Critical' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🔵 Low' },
];

export const isOpenEsc = (e) => ESC_OPEN_STATUSES.includes(e.status);

export const escTimeAgo = (ts) => {
  const d = Date.now() - new Date(ts).getTime();
  const hr = 3600 * 1000, day = 24 * hr;
  if (d < 60000) return 'just now';
  if (d < hr) return Math.floor(d / 60000) + 'm ago';
  if (d < day) return Math.floor(d / hr) + 'h ago';
  return Math.floor(d / day) + 'd ago';
};

export const escFmt = (ts) => {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// counts used across overview + center
export const escCounts = (list) => {
  let open = 0, critical = 0, high = 0, inprogress = 0, underReview = 0, resolved = 0;
  list.forEach((e) => {
    if (isOpenEsc(e)) open++;
    if (e.priority === 'critical' && isOpenEsc(e)) critical++;
    if (e.priority === 'high' && isOpenEsc(e)) high++;
    if (e.status === 'In Progress') inprogress++;
    if (e.status === 'Under Review') underReview++;
    if (e.status === 'Resolved' || e.status === 'Closed') resolved++;
  });
  return { open, critical, high, inprogress, underReview, resolved, total: list.length };
};

// 7-day trend buckets (oldest → newest)
export const escTrend = (list) => {
  const day = 24 * 3600 * 1000;
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base.getTime() - i * day);
    days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), start: d.getTime(), end: d.getTime() + day, count: 0 });
  }
  list.forEach((e) => {
    const t = new Date(e.createdAt).getTime();
    days.forEach((dd) => { if (t >= dd.start && t < dd.end) dd.count++; });
  });
  return days;
};

import './statusBadge.css';

const COLOR_MAP = {
  Open: 'badge-amber',
  Reviewed: 'badge-blue',
  Resolved: 'badge-green',
  Active: 'badge-green',
  Completed: 'badge-slate',
  Discontinued: 'badge-red',
  Scheduled: 'badge-blue',
  Due: 'badge-amber',
  Cancelled: 'badge-slate',
  High: 'badge-red',
  Moderate: 'badge-amber',
  Low: 'badge-slate',
  Pending: 'badge-amber',
  Inactive: 'badge-slate',
};

export default function StatusBadge({ value }) {
  const cls = COLOR_MAP[value] || 'badge-slate';
  return <span className={`status-badge ${cls}`}>{value}</span>;
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listFollowUps, updateFollowUp } from '../api/followUps';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '—';
}

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    const data = await listFollowUps({ status: status || undefined });
    setFollowUps(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function markCompleted(followUp) {
    await updateFollowUp(followUp._id, { status: 'Completed' });
    load();
  }

  async function markCancelled(followUp) {
    await updateFollowUp(followUp._id, { status: 'Cancelled' });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Follow-ups</h1>
      </div>

      <div className="toolbar">
        <select style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13.5 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Due">Due</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="muted">Loading follow-ups...</div>
      ) : (
        <DataTable
          emptyMessage="No follow-ups match these filters."
          columns={[
            { key: 'patient', header: 'Patient', render: (r) => `${r.patient.firstName} ${r.patient.lastName} (${r.patient.patientId})` },
            { key: 'reason', header: 'Reason' },
            { key: 'dueDate', header: 'Due date', render: (r) => formatDate(r.dueDate) },
            { key: 'assignedClinician', header: 'Assigned to', render: (r) => r.assignedClinician?.name },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
            {
              key: 'actions',
              header: '',
              render: (r) =>
                ['Scheduled', 'Due'].includes(r.status) ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); markCompleted(r); }}>Complete</button>
                    <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); markCancelled(r); }}>Cancel</button>
                  </div>
                ) : null,
            },
          ]}
          rows={followUps}
          onRowClick={(row) => navigate(`/patients/${row.patient._id}`)}
        />
      )}
    </div>
  );
}

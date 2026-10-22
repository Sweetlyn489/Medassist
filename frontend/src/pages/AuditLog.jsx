import { useEffect, useState } from 'react';
import { listAuditLogs } from '../api/audit';
import DataTable from '../components/common/DataTable';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await listAuditLogs({ page, limit: 30 });
    setLogs(res.data);
    setMeta(res.meta);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <div className="page-header">
        <h1>Audit Log</h1>
      </div>
      <p className="muted small" style={{ marginTop: -10, marginBottom: 14 }}>
        Every patient access and clinical write action is recorded here for compliance and traceability. Administrator view only.
      </p>

      {loading ? (
        <div className="muted">Loading audit log...</div>
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'timestamp', header: 'Timestamp', render: (r) => new Date(r.timestamp).toLocaleString() },
              { key: 'user', header: 'User', render: (r) => r.user?.name || '—' },
              { key: 'action', header: 'Action' },
              { key: 'entity', header: 'Entity' },
              { key: 'entityId', header: 'Entity ID', render: (r) => <span className="mono small">{String(r.entityId).slice(-8)}</span> },
            ]}
            rows={logs}
          />
          <div className="toolbar" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span className="small muted">Page {meta.page} of {meta.pages || 1}</span>
            <button className="btn btn-sm" disabled={page >= (meta.pages || 1)} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

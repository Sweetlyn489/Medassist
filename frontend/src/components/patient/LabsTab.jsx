import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '—';
}

function isOutOfRange(lab) {
  return lab.result < lab.referenceLow || lab.result > lab.referenceHigh;
}

export default function LabsTab({ labs }) {
  return (
    <div className="panel">
      <div className="panel-title-row"><h2>Laboratory Results</h2></div>
      <DataTable
        emptyMessage="No lab results recorded yet. Use “Add Lab Result” above to add one."
        columns={[
          { key: 'test', header: 'Test' },
          { key: 'result', header: 'Result', render: (r) => (
              <span style={isOutOfRange(r) ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>
                {r.result} {r.unit}
              </span>
            ) },
          { key: 'referenceRange', header: 'Reference range', render: (r) => `${r.referenceLow}–${r.referenceHigh} ${r.unit}` },
          { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
        ]}
        rows={labs}
      />
    </div>
  );
}

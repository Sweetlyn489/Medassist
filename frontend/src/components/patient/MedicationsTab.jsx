import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '—';
}

export default function MedicationsTab({ medications, onDiscontinue }) {
  return (
    <div className="panel">
      <div className="panel-title-row"><h2>Medications</h2></div>
      <DataTable
        emptyMessage="No medications recorded yet. Use “Add Medication” above to add one."
        columns={[
          { key: 'medication', header: 'Medication' },
          { key: 'dosage', header: 'Dosage' },
          { key: 'frequency', header: 'Frequency' },
          { key: 'route', header: 'Route' },
          { key: 'startDate', header: 'Start date', render: (r) => formatDate(r.startDate) },
          { key: 'endDate', header: 'End date', render: (r) => formatDate(r.endDate) },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
          {
            key: 'actions',
            header: '',
            render: (r) => (r.status === 'Active' ? <button className="btn btn-sm" onClick={() => onDiscontinue(r)}>Discontinue</button> : null),
          },
        ]}
        rows={medications}
      />
    </div>
  );
}

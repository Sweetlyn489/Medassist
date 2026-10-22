import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';

function formatDateTime(d) {
  return d ? new Date(d).toLocaleString() : '—';
}

export default function AssessmentTab({ assessments }) {
  return (
    <div className="panel">
      <div className="panel-title-row"><h2>Clinical Assessments</h2></div>
      <DataTable
        emptyMessage="No assessments recorded yet. Use “New Assessment” above to add one."
        columns={[
          { key: 'createdAt', header: 'Date', render: (r) => formatDateTime(r.createdAt) },
          { key: 'clinician', header: 'Clinician', render: (r) => r.clinician?.name },
          { key: 'chiefComplaint', header: 'Chief complaint' },
          { key: 'vitals', header: 'Vitals', render: (r) => (
              <span className="small mono">
                T {r.vitals?.temperatureC ?? '—'}°C · HR {r.vitals?.heartRate ?? '—'} · RR {r.vitals?.respiratoryRate ?? '—'} · BP {r.vitals?.systolicBP ?? '—'}/{r.vitals?.diastolicBP ?? '—'} · SpO2 {r.vitals?.oxygenSaturation ?? '—'}%
              </span>
            ) },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
        ]}
        rows={assessments}
      />
    </div>
  );
}

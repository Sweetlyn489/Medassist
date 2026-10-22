function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '—';
}

/**
 * Simple, print-friendly clinical summary generated from data already
 * held on the client — no separate backend endpoint required.
 */
export default function ReportsTab({ patient, assessments, labs, medications, findings }) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="panel" id="patient-report">
      <div className="panel-title-row">
        <h2>Patient Summary Report</h2>
        <button className="btn btn-sm" onClick={handlePrint}>Print / Save PDF</button>
      </div>

      <div className="kv-grid" style={{ marginBottom: 16 }}>
        <div><div className="kv-label">Patient</div><div className="kv-value">{patient.firstName} {patient.lastName} ({patient.patientId})</div></div>
        <div><div className="kv-label">Date of birth</div><div className="kv-value">{formatDate(patient.dateOfBirth)}</div></div>
        <div><div className="kv-label">Gender</div><div className="kv-value">{patient.gender}</div></div>
        <div><div className="kv-label">Blood group</div><div className="kv-value">{patient.bloodGroup || 'Unknown'}</div></div>
        <div><div className="kv-label">Report generated</div><div className="kv-value">{new Date().toLocaleString()}</div></div>
      </div>

      <h3>Allergies</h3>
      <p className="small">{patient.allergies.length ? patient.allergies.map((a) => `${a.substance} (${a.severity})`).join(', ') : 'None recorded.'}</p>

      <h3>Medical History</h3>
      <p className="small">{patient.medicalHistory.length ? patient.medicalHistory.map((h) => h.condition).join(', ') : 'None recorded.'}</p>

      <h3>Assessments ({assessments.length})</h3>
      <ul className="small">
        {assessments.slice(0, 5).map((a) => (
          <li key={a._id}>{formatDate(a.createdAt)} — {a.chiefComplaint}</li>
        ))}
      </ul>

      <h3>Active Medications</h3>
      <ul className="small">
        {medications.filter((m) => m.status === 'Active').map((m) => (
          <li key={m._id}>{m.medication} {m.dosage}, {m.frequency}</li>
        ))}
        {medications.filter((m) => m.status === 'Active').length === 0 && <li>None</li>}
      </ul>

      <h3>Recent Labs</h3>
      <ul className="small">
        {labs.slice(0, 5).map((l) => (
          <li key={l._id}>{formatDate(l.date)} — {l.test}: {l.result} {l.unit} (ref {l.referenceLow}–{l.referenceHigh})</li>
        ))}
      </ul>

      <h3>Clinical Findings Requiring Review</h3>
      <ul className="small">
        {findings.filter((f) => f.status === 'Open').map((f) => (
          <li key={f._id}>{f.finding} — {f.reason}</li>
        ))}
        {findings.filter((f) => f.status === 'Open').length === 0 && <li>No open findings.</li>}
      </ul>

      <p className="muted small" style={{ marginTop: 14 }}>
        This report reflects configured demonstration decision-support rules and does not constitute a diagnosis.
      </p>
    </div>
  );
}

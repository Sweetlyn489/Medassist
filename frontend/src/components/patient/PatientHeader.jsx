import StatusBadge from '../common/StatusBadge';

function age(dob) {
  if (!dob) return '—';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PatientHeader({
  patient,
  overview,
  onNewAssessment,
  onAddLab,
  onAddMedication,
  onScheduleFollowUp,
  onEditPatient,
  onPrintReport,
}) {
  const severeAllergies = (patient.allergies || []).filter((a) => a.severity === 'Severe');
  const recentVitals = overview?.recentAssessment?.vitals;
  const activeMedsCount = (overview?.activeMedications || []).length;

  return (
    <div className="patient-banner">
      <div className="patient-banner-top">
        <div className="patient-identity">
          <img
            src={
              patient.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                patient.firstName + ' ' + patient.lastName
              )}&background=1e293b&color=ffffff&size=128`
            }
            alt={`${patient.firstName} ${patient.lastName}`}
            className="patient-avatar"
          />
          <div>
            <div className="patient-name-row">
              <span className="patient-name">
                {patient.firstName} {patient.lastName}
              </span>
              <span className="patient-id-badge">{patient.patientId}</span>
              <span className="blood-badge">{patient.bloodGroup || 'Blood: Unknown'}</span>
              <StatusBadge value={patient.status} />
            </div>

            <div className="patient-meta-row">
              <span className="patient-meta-item">
                <strong>Age / Sex:</strong> {age(patient.dateOfBirth)} yrs ({patient.gender})
              </span>
              <span>·</span>
              <span className="patient-meta-item">
                <strong>DOB:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}
              </span>
              <span>·</span>
              <span className="patient-meta-item">
                <strong>Active Meds:</strong> {activeMedsCount}
              </span>
              <span>·</span>
              <span className="patient-meta-item">
                <strong>Last Reviewed:</strong>{' '}
                {patient.lastReviewed
                  ? new Date(patient.lastReviewed).toLocaleDateString()
                  : 'Requires review'}
              </span>
            </div>
          </div>
        </div>

        <div className="patient-header-actions">
          <button className="btn btn-primary btn-sm" onClick={onNewAssessment}>
            + New Assessment
          </button>
          <button className="btn btn-sm" onClick={onAddLab}>
            + Add Lab
          </button>
          <button className="btn btn-sm" onClick={onAddMedication}>
            + Add Medication
          </button>
          <button className="btn btn-sm" onClick={onScheduleFollowUp}>
            + Schedule Follow-up
          </button>
          <button className="btn btn-sm" onClick={onEditPatient}>
            ✏️ Edit Patient
          </button>
          <button className="btn btn-sm btn-ghost" onClick={onPrintReport}>
            🖨️ Summary
          </button>
        </div>
      </div>

      {/* Vitals Strip */}
      {recentVitals && (
        <div className="vitals-strip">
          <span className="vitals-strip-title">Latest Vitals:</span>
          <div
            className={`vital-pill ${
              recentVitals.systolicBP > 140 || recentVitals.systolicBP < 90 ? 'vital-alert' : ''
            }`}
          >
            <span className="vital-pill-label">BP:</span>
            <span className="vital-pill-val">
              {recentVitals.systolicBP ?? '—'}/{recentVitals.diastolicBP ?? '—'}
            </span>
            <span className="small muted">mmHg</span>
          </div>

          <div
            className={`vital-pill ${
              recentVitals.heartRate > 100 || recentVitals.heartRate < 55 ? 'vital-alert' : ''
            }`}
          >
            <span className="vital-pill-label">HR:</span>
            <span className="vital-pill-val">{recentVitals.heartRate ?? '—'}</span>
            <span className="small muted">bpm</span>
          </div>

          <div
            className={`vital-pill ${
              recentVitals.oxygenSaturation && recentVitals.oxygenSaturation < 94 ? 'vital-alert' : ''
            }`}
          >
            <span className="vital-pill-label">SpO2:</span>
            <span className="vital-pill-val">{recentVitals.oxygenSaturation ?? '—'}</span>
            <span className="small muted">%</span>
          </div>

          <div
            className={`vital-pill ${
              recentVitals.temperatureC && recentVitals.temperatureC > 38.0 ? 'vital-alert' : ''
            }`}
          >
            <span className="vital-pill-label">Temp:</span>
            <span className="vital-pill-val">{recentVitals.temperatureC ?? '—'}</span>
            <span className="small muted">°C</span>
          </div>

          <div className="vital-pill">
            <span className="vital-pill-label">RR:</span>
            <span className="vital-pill-val">{recentVitals.respiratoryRate ?? '—'}</span>
            <span className="small muted">/min</span>
          </div>
        </div>
      )}

      {/* Allergies Warning Bar if present */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="allergy-alert-bar">
          <strong style={{ color: severeAllergies.length > 0 ? '#b91c1c' : '#b45309' }}>
            ⚠️ ALLERGIES RECORDED ({patient.allergies.length}):
          </strong>
          <span>
            {patient.allergies
              .map(
                (a) =>
                  `${a.substance} [${a.severity}${a.reaction ? ` — ${a.reaction}` : ''}]`
              )
              .join(' · ')}
          </span>
        </div>
      )}

      {/* Chronic Conditions Bar */}
      {patient.medicalHistory && patient.medicalHistory.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 12.5, flexWrap: 'wrap' }}>
          <strong style={{ color: '#475569' }}>Chronic Conditions:</strong>
          {patient.medicalHistory.map((h, i) => (
            <span
              key={i}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '2px 8px',
                borderRadius: 4,
                color: '#1e293b',
              }}
            >
              {h.condition} {h.diagnosedYear && <span className="muted">({h.diagnosedYear})</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

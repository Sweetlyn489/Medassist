import StatusBadge from '../common/StatusBadge';
import DataTable from '../common/DataTable';

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '—';
}

export default function OverviewTab({ patient, overview, onReviewFinding }) {
  const { recentAssessment, activeMedications, recentLabs, openFindings } = overview;

  // Derive explainable clinical insights from patient data
  const clinicalAlerts = [];
  const trendInsights = [];

  // Vitals insights
  if (recentAssessment?.vitals) {
    const v = recentAssessment.vitals;
    if (v.systolicBP && v.systolicBP > 140) {
      trendInsights.push({
        type: 'Blood Pressure',
        text: `Systolic BP elevated (${v.systolicBP} mmHg) at latest encounter on ${formatDate(recentAssessment.createdAt)}.`,
        severity: 'Moderate',
      });
    }
    if (v.heartRate && v.heartRate > 100) {
      trendInsights.push({
        type: 'Heart Rate',
        text: `Tachycardia observed (${v.heartRate} bpm) during recent assessment.`,
        severity: 'Moderate',
      });
    }
    if (v.oxygenSaturation && v.oxygenSaturation < 94) {
      trendInsights.push({
        type: 'Oxygenation',
        text: `Subnormal SpO2 (${v.oxygenSaturation}%) noted on recent intake. Requires clinical evaluation.`,
        severity: 'High',
      });
    }
  }

  // Lab insights
  (recentLabs || []).forEach((lab) => {
    if (lab.result < lab.referenceLow) {
      clinicalAlerts.push({
        title: `Low ${lab.test} (${lab.result} ${lab.unit})`,
        detail: `Below reference limit (${lab.referenceLow}–${lab.referenceHigh} ${lab.unit}) recorded on ${formatDate(lab.date)}.`,
        severity: 'Moderate',
      });
    } else if (lab.result > lab.referenceHigh) {
      clinicalAlerts.push({
        title: `Elevated ${lab.test} (${lab.result} ${lab.unit})`,
        detail: `Above reference limit (${lab.referenceLow}–${lab.referenceHigh} ${lab.unit}) recorded on ${formatDate(lab.date)}.`,
        severity: 'Moderate',
      });
    }
  });

  return (
    <div>
      {/* MediAssist Clinical Summary Header Panel */}
      <div className="panel" style={{ background: '#f8fafc', borderLeft: '5px solid #205081', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ color: '#0f172a', fontSize: 16, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚡</span> MediAssist Clinical Decision-Support Summary
          </h2>
          <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
            GROUNDED IN ACTIVE EHR RECORDS
          </span>
        </div>
        <p className="small muted" style={{ marginBottom: 14 }}>
          Algorithmic synthesis of open findings, abnormal trajectory markers, and safety considerations. Decision-support cues only; not an automated diagnosis.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: openFindings?.length > 0 ? '1.2fr 1fr' : '1fr', gap: 16 }}>
          {/* Active Findings Queue */}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 8 }}>
              Open Findings Requiring Clinician Review ({openFindings?.length || 0})
            </div>
            {openFindings && openFindings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {openFindings.map((f) => (
                  <div
                    key={f._id}
                    style={{
                      background: '#ffffff',
                      border: `1px solid ${f.severity === 'High' ? '#fca5a5' : '#fed7aa'}`,
                      borderRadius: 6,
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <StatusBadge value={f.severity} />
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{f.finding}</span>
                      </div>
                      <div className="muted small">{f.reason}</div>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => onReviewFinding(f)}>
                      Review
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '12px 14px', fontSize: 13, color: '#059669' }}>
                ✓ No active unresolved clinical findings on file for this patient.
              </div>
            )}
          </div>

          {/* Longitudinal Trajectory Highlights */}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 8 }}>
              Clinical Trends & Trajectory Signals
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trendInsights.length > 0 ? (
                trendInsights.map((t, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 12.5 }}>
                    <strong style={{ color: '#0f172a' }}>{t.type}:</strong> {t.text}
                  </div>
                ))
              ) : (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 12.5, color: '#64748b' }}>
                  Vital signs within expected baseline parameters.
                </div>
              )}

              {clinicalAlerts.slice(0, 2).map((a, idx) => (
                <div key={idx} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 12px', fontSize: 12.5, color: '#92400e' }}>
                  <strong>{a.title}:</strong> {a.detail}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Information & Demographics Panel */}
      <div className="panel">
        <div className="panel-title-row">
          <h2>Demographics & Primary Details</h2>
        </div>
        <div className="kv-grid">
          <div><div className="kv-label">Date of Birth</div><div className="kv-value">{formatDate(patient.dateOfBirth)}</div></div>
          <div><div className="kv-label">Gender</div><div className="kv-value">{patient.gender}</div></div>
          <div><div className="kv-label">Blood Group</div><div className="kv-value"><span className="blood-badge">{patient.bloodGroup || 'Unknown'}</span></div></div>
          <div><div className="kv-label">Phone</div><div className="kv-value">{patient.contact?.phone || '—'}</div></div>
          <div><div className="kv-label">Email</div><div className="kv-value">{patient.contact?.email || '—'}</div></div>
          <div><div className="kv-label">Account Status</div><div className="kv-value"><StatusBadge value={patient.status} /></div></div>
          <div><div className="kv-label">Last Reviewed</div><div className="kv-value">{formatDate(patient.lastReviewed)}</div></div>
        </div>
      </div>

      {/* Allergies & Chronic Conditions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel">
          <div className="panel-title-row"><h2>Documented Allergies</h2></div>
          <DataTable
            emptyMessage="No known allergies recorded."
            columns={[
              { key: 'substance', header: 'Substance' },
              { key: 'reaction', header: 'Reaction' },
              { key: 'severity', header: 'Severity', render: (r) => <StatusBadge value={r.severity} /> },
            ]}
            rows={patient.allergies}
          />
        </div>

        <div className="panel">
          <div className="panel-title-row"><h2>Chronic Medical History</h2></div>
          <DataTable
            emptyMessage="No medical history recorded."
            columns={[
              { key: 'condition', header: 'Condition' },
              { key: 'diagnosedYear', header: 'Diagnosed', render: (r) => r.diagnosedYear || '—' },
              { key: 'notes', header: 'Notes', render: (r) => r.notes || '—' },
            ]}
            rows={patient.medicalHistory}
          />
        </div>
      </div>

      {/* Current Observations (latest assessment) */}
      <div className="panel">
        <div className="panel-title-row">
          <h2>Latest Recorded Observations & Vitals</h2>
        </div>
        {recentAssessment ? (
          <div>
            <div style={{ marginBottom: 12 }}>
              <span className="muted small">Chief complaint:</span> <strong>{recentAssessment.chiefComplaint}</strong>
              {recentAssessment.symptoms?.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {recentAssessment.symptoms.map((s) => (
                    <span key={s} style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 12, fontSize: 11.5 }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="kv-grid">
              <div><div className="kv-label">Temperature</div><div className="kv-value">{recentAssessment.vitals?.temperatureC ?? '—'} °C</div></div>
              <div><div className="kv-label">Heart Rate</div><div className="kv-value">{recentAssessment.vitals?.heartRate ?? '—'} bpm</div></div>
              <div><div className="kv-label">Resp Rate</div><div className="kv-value">{recentAssessment.vitals?.respiratoryRate ?? '—'} /min</div></div>
              <div><div className="kv-label">Blood Pressure</div><div className="kv-value">{recentAssessment.vitals?.systolicBP ?? '—'}/{recentAssessment.vitals?.diastolicBP ?? '—'} mmHg</div></div>
              <div><div className="kv-label">Oxygen Saturation</div><div className="kv-value">{recentAssessment.vitals?.oxygenSaturation ?? '—'} %</div></div>
              <div><div className="kv-label">Recorded Date</div><div className="kv-value">{formatDate(recentAssessment.createdAt)}</div></div>
            </div>
          </div>
        ) : (
          <div className="muted small">No assessments recorded yet.</div>
        )}
      </div>

      {/* Active Medications & Recent Labs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel">
          <div className="panel-title-row"><h2>Active Medications</h2></div>
          <DataTable
            emptyMessage="No active medications."
            columns={[
              { key: 'medication', header: 'Medication' },
              { key: 'dosage', header: 'Dosage' },
              { key: 'frequency', header: 'Frequency' },
              { key: 'startDate', header: 'Start Date', render: (r) => formatDate(r.startDate) },
            ]}
            rows={activeMedications}
          />
        </div>

        <div className="panel">
          <div className="panel-title-row"><h2>Recent Lab Results</h2></div>
          <DataTable
            emptyMessage="No lab results recorded."
            columns={[
              { key: 'test', header: 'Test' },
              {
                key: 'result',
                header: 'Result',
                render: (r) => {
                  const outOfRange = r.result < r.referenceLow || r.result > r.referenceHigh;
                  return (
                    <span style={outOfRange ? { color: '#dc2626', fontWeight: 700 } : {}}>
                      {r.result} {r.unit} {outOfRange ? (r.result < r.referenceLow ? '▼' : '▲') : ''}
                    </span>
                  );
                },
              },
              { key: 'referenceRange', header: 'Reference', render: (r) => `${r.referenceLow}–${r.referenceHigh}` },
              { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
            ]}
            rows={recentLabs}
          />
        </div>
      </div>
    </div>
  );
}

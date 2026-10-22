import { useState } from 'react';
import Modal from '../common/Modal';

function formatDateTime(d) {
  return d ? new Date(d).toLocaleString() : '—';
}

function getBadgeClass(cat) {
  switch (cat) {
    case 'Laboratory':
      return 'doc-badge doc-badge-lab';
    case 'Prescription':
      return 'doc-badge doc-badge-rx';
    case 'Radiology':
      return 'doc-badge doc-badge-rad';
    case 'Clinical Note':
    default:
      return 'doc-badge doc-badge-note';
  }
}

export default function MedicalDocumentsTab({ documents, patient }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filter, setFilter] = useState('All');

  const filteredDocs = (documents || []).filter((doc) => {
    if (filter === 'All') return true;
    return doc.category === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0 }}>Medical Documents & Clinical Records</h2>
          <p className="muted small" style={{ margin: 0 }}>
            Structured diagnostic lab reports, electronic prescription orders, and clinical consultation records.
          </p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          {['All', 'Laboratory', 'Prescription', 'Clinical Note', 'Radiology'].map((c) => (
            <button
              key={c}
              className={`btn btn-sm ${filter === c ? 'btn-primary' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
          <h3>No documents match this filter</h3>
          <p className="muted small">Select another category or view all records.</p>
        </div>
      ) : (
        <div className="document-list">
          {filteredDocs.map((doc) => (
            <div key={doc._id} className="document-item-card" onClick={() => setSelectedDoc(doc)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className={getBadgeClass(doc.category)}>{doc.category}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{doc.title}</div>
                  <div className="muted small" style={{ marginTop: 2 }}>
                    {doc.summary || 'Clinical record on file'} · {formatDateTime(doc.date)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="small muted">Authored by {doc.authorName || doc.author?.name || 'Attending Physician'}</span>
                <button className="btn btn-sm">View Document →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoc && (
        <Modal
          title={`Document Viewer: ${selectedDoc.title}`}
          onClose={() => setSelectedDoc(null)}
          width={750}
        >
          <div style={{ padding: '4px 0' }} id="printable-clinical-doc">
            {/* Clinical Header */}
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>MEDIASSIST CLINICAL SYSTEMS</h2>
                  <div className="muted small">Regional Health Network · Electronic Record Archive</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={getBadgeClass(selectedDoc.category)}>{selectedDoc.category}</span>
                  <div className="small muted" style={{ marginTop: 4 }}>Date: {formatDateTime(selectedDoc.date)}</div>
                </div>
              </div>

              {/* Patient Banner in Document */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#f8fafc', padding: '10px 14px', borderRadius: 6, marginTop: 12, fontSize: 12.5 }}>
                <div><strong>Patient:</strong> {patient.firstName} {patient.lastName} ({patient.patientId})</div>
                <div><strong>DOB:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()} (Blood: {patient.bloodGroup || 'O+'})</div>
                <div><strong>Provider:</strong> {selectedDoc.authorName || 'Attending Physician'}</div>
              </div>
            </div>

            {/* Document Specific Contents */}
            {selectedDoc.category === 'Laboratory' && selectedDoc.content?.findings && (
              <div>
                <div style={{ marginBottom: 12, fontSize: 13 }}>
                  <strong>Laboratory:</strong> {selectedDoc.content.facility || 'Metropolitan Diagnostic Lab'} <br />
                  <strong>Specimen:</strong> {selectedDoc.content.specimen}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px' }}>Analyte / Test</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px' }}>Result</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px' }}>Reference Range</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDoc.content.findings.map((f, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{f.test}</td>
                        <td style={{ padding: '8px 10px', color: f.status === 'High' ? '#dc2626' : '#0f172a' }}>{f.result}</td>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>{f.reference}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            background: f.status === 'High' ? '#fee2e2' : '#ecfdf5',
                            color: f.status === 'High' ? '#991b1b' : '#065f46',
                          }}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedDoc.content.clinicalRemarks && (
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 5, fontSize: 12.5, color: '#475569' }}>
                    <strong>Remarks:</strong> {selectedDoc.content.clinicalRemarks}
                  </div>
                )}
              </div>
            )}

            {selectedDoc.category === 'Prescription' && selectedDoc.content && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, marginBottom: 14 }}>
                  <div><strong>Rx Number:</strong> <span className="mono">{selectedDoc.content.rxNumber}</span></div>
                  <div><strong>Prescriber:</strong> {selectedDoc.content.prescriber}</div>
                  <div><strong>DEA / NPI:</strong> <span className="mono">{selectedDoc.content.deaRegistration} / {selectedDoc.content.prescriberNPI}</span></div>
                  <div><strong>Dispense Pharmacy:</strong> {selectedDoc.content.pharmacy}</div>
                </div>

                <h4 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: 4, marginTop: 16 }}>Prescribed Medications</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedDoc.content.medications?.map((m, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{m.name} — {m.strength}</div>
                      <div style={{ fontSize: 13, color: '#334155', marginTop: 2 }}><strong>Sig:</strong> {m.directions}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Qty: {m.quantity} · Refills: {m.refills}</div>
                    </div>
                  ))}
                </div>

                {selectedDoc.content.safetyCheckResult && (
                  <div style={{ marginTop: 14, padding: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 5, fontSize: 12, color: '#065f46' }}>
                    ✓ {selectedDoc.content.safetyCheckResult}
                  </div>
                )}
              </div>
            )}

            {selectedDoc.category === 'Clinical Note' && selectedDoc.content && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5, lineHeight: 1.5 }}>
                <div>
                  <strong style={{ color: '#0369a1' }}>Subjective (History of Present Illness):</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{selectedDoc.content.subjective}</p>
                </div>
                <div>
                  <strong style={{ color: '#0369a1' }}>Objective (Physical Exam & Observations):</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{selectedDoc.content.objective}</p>
                </div>
                <div>
                  <strong style={{ color: '#0369a1' }}>Assessment:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{selectedDoc.content.assessment}</p>
                </div>
                <div>
                  <strong style={{ color: '#0369a1' }}>Clinical Plan:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{selectedDoc.content.plan}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              <span className="small muted">Electronic verification signature on file. Synthetic clinical test record.</span>
              <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                Print / Save Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { useState } from 'react';
import './timelineTab.css';

function formatDateTime(d) {
  return d ? new Date(d).toLocaleString() : '—';
}

function getCategoryColor(cat) {
  switch (cat) {
    case 'Assessment':
      return { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' };
    case 'Lab':
      return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
    case 'Medication':
      return { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' };
    case 'Imaging':
      return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' };
    case 'FollowUp':
      return { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' };
    case 'Finding':
      return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
    case 'Document':
      return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    default:
      return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  }
}

export default function TimelineTab({ events }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredEvents = (events || []).filter((e) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Assessments') return e.category === 'Assessment';
    if (activeFilter === 'Labs') return e.category === 'Lab';
    if (activeFilter === 'Medications') return e.category === 'Medication';
    if (activeFilter === 'Imaging') return e.category === 'Imaging' || e.category === 'Document';
    if (activeFilter === 'Follow-ups') return e.category === 'FollowUp';
    if (activeFilter === 'Findings') return e.category === 'Finding';
    return true;
  });

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Comprehensive Clinical Timeline</h2>
          <p className="muted small" style={{ margin: 0 }}>
            Chronological log of clinical encounters, diagnostic evaluations, orders, and decision reviews.
          </p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          {['All', 'Assessments', 'Labs', 'Medications', 'Imaging', 'Follow-ups', 'Findings'].map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${activeFilter === cat ? 'btn-primary' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="muted small" style={{ padding: 20, textAlign: 'center' }}>
          No events recorded matching this filter.
        </div>
      ) : (
        <div className="timeline">
          {filteredEvents.map((e, i) => {
            const style = getCategoryColor(e.category);
            return (
              <div className="timeline-item" key={`${e.type}-${e.refId}-${i}`}>
                <div
                  className="timeline-dot"
                  style={{ background: style.text, borderColor: style.border }}
                />
                <div className="timeline-content" style={{ borderLeft: `3px solid ${style.border}`, paddingLeft: 12 }}>
                  <div className="timeline-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: style.bg,
                          color: style.text,
                          padding: '2px 7px',
                          borderRadius: 4,
                        }}
                      >
                        {e.category || e.type}
                      </span>
                      <span className="timeline-type" style={{ fontWeight: 600, fontSize: 13.5 }}>
                        {e.type}
                      </span>
                    </div>
                    <span className="muted small">{formatDateTime(e.date)}</span>
                  </div>

                  <div className="timeline-summary" style={{ marginTop: 6, fontSize: 13.5, color: '#1e293b' }}>
                    {e.summary}
                  </div>

                  {/* Vitals breakdown if available */}
                  {e.details && typeof e.details === 'object' && e.details.heartRate && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11.5, background: '#f8fafc', padding: '4px 8px', borderRadius: 4 }}>
                      <span><strong>BP:</strong> {e.details.systolicBP}/{e.details.diastolicBP} mmHg</span>
                      <span><strong>HR:</strong> {e.details.heartRate} bpm</span>
                      <span><strong>SpO2:</strong> {e.details.oxygenSaturation}%</span>
                      <span><strong>Temp:</strong> {e.details.temperatureC}°C</span>
                    </div>
                  )}

                  {e.notes && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
                      Note: {e.notes}
                    </div>
                  )}

                  {e.by && (
                    <div className="muted small" style={{ marginTop: 4 }}>
                      Recorded by: {e.by}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import ReviewFindingModal from '../components/patient/ReviewFindingModal';
import { Icon } from '../components/common/Icons';

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '—';
}

function formatDateTime(d) {
  return d ? new Date(d).toLocaleString() : '—';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const navigate = useNavigate();

  function loadDashboardData() {
    setLoading(true);
    getDashboard()
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.error('Dashboard load failed:', err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="muted" style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="clock" size={18} />
        <span>Loading dashboard telemetry...</span>
      </div>
    );
  }

  // Branch based on user role or returned payload role
  if (user?.role === 'admin' || data.role === 'admin') {
    return <AdminDashboardView data={data} navigate={navigate} />;
  }

  return (
    <ClinicianDashboardView
      data={data}
      navigate={navigate}
      setReviewTarget={setReviewTarget}
      reviewTarget={reviewTarget}
      onReload={loadDashboardData}
    />
  );
}

/**
 * ADMINISTRATOR DASHBOARD VIEW
 * Clean hospital system overview, user governance, compliance telemetry, active rules
 */
function AdminDashboardView({ data, navigate }) {
  const { stats = {}, cliniciansList = [], recentAudit = [], systemHealth = {} } = data;

  return (
    <div>
      {/* Admin Governance Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          borderRadius: 8,
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="shield-check" size={20} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Hospital Administration & Operations Console
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            Platform governance, user credentialing, clinical decision rule policy, and HIPAA compliance audit trail.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 4,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
            {systemHealth.status || 'Systems Operational'}
          </span>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/admin/users')}>
            <Icon name="user-plus" size={14} style={{ marginRight: 6 }} />
            Manage Staff
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="stat-row" style={{ marginBottom: 20 }}>
        <div className="stat-box">
          <div className="stat-number">{stats.totalPatients || 0}</div>
          <div className="stat-label">Registered Patients</div>
        </div>
        <div className="stat-box">
          <div className="stat-number" style={{ color: '#0d9488' }}>{stats.activeClinicians || 0}</div>
          <div className="stat-label">Licensed Clinicians</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{stats.totalUsers || 0}</div>
          <div className="stat-label">Total System Accounts</div>
        </div>
        <div className="stat-box">
          <div className="stat-number" style={{ color: '#4f46e5' }}>{stats.activeRules || 0}</div>
          <div className="stat-label">Active CDS Rules ({stats.totalRules || 0} Total)</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{stats.auditLogsCount || 0}</div>
          <div className="stat-label">Compliance Audit Events</div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/admin/users')}
          style={{ justifyContent: 'flex-start', padding: '12px 16px', background: '#ffffff', border: '1px solid #e2e8f0' }}
        >
          <Icon name="users" size={18} color="#0d9488" style={{ marginRight: 10 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>User Management</div>
            <div className="muted small" style={{ fontSize: 11 }}>Manage doctor accounts & roles</div>
          </div>
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => navigate('/admin/rules')}
          style={{ justifyContent: 'flex-start', padding: '12px 16px', background: '#ffffff', border: '1px solid #e2e8f0' }}
        >
          <Icon name="sliders" size={18} color="#4f46e5" style={{ marginRight: 10 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>CDS Rule Governance</div>
            <div className="muted small" style={{ fontSize: 11 }}>Configure thresholds & alerts</div>
          </div>
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => navigate('/audit-log')}
          style={{ justifyContent: 'flex-start', padding: '12px 16px', background: '#ffffff', border: '1px solid #e2e8f0' }}
        >
          <Icon name="file-text" size={18} color="#0284c7" style={{ marginRight: 10 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Security & Audit Trail</div>
            <div className="muted small" style={{ fontSize: 11 }}>HIPAA compliance logs</div>
          </div>
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => navigate('/patients')}
          style={{ justifyContent: 'flex-start', padding: '12px 16px', background: '#ffffff', border: '1px solid #e2e8f0' }}
        >
          <Icon name="folder" size={18} color="#ca8a04" style={{ marginRight: 10 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Patient Accounts</div>
            <div className="muted small" style={{ fontSize: 11 }}>Administrative demographics</div>
          </div>
        </button>
      </div>

      {/* 2-Column Admin Grid */}
      <div className="dashboard-attention-grid">
        {/* Active Clinicians Roster */}
        <div className="attention-card">
          <div className="attention-card-header">
            <div className="attention-card-title">
              <Icon name="users" size={16} color="#0d9488" />
              <span>Active Medical Provider Roster</span>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/admin/users')}>
              Manage All Staff →
            </button>
          </div>
          <DataTable
            emptyMessage="No clinicians registered."
            columns={[
              {
                key: 'name',
                header: 'Practitioner',
                render: (u) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div className="muted small">{u.title || 'Staff Clinician'}</div>
                  </div>
                ),
              },
              { key: 'email', header: 'Email', render: (u) => <span className="mono small">{u.email}</span> },
              {
                key: 'active',
                header: 'EHR Access',
                render: (u) => <StatusBadge value={u.active ? 'Active' : 'Inactive'} />,
              },
            ]}
            rows={cliniciansList}
          />
        </div>

        {/* Recent System & Compliance Audit Trail */}
        <div className="attention-card">
          <div className="attention-card-header">
            <div className="attention-card-title">
              <Icon name="file-text" size={16} color="#475569" />
              <span>Live Security & Compliance Audit Log</span>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/audit-log')}>
              Full Audit Trail →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentAudit.slice(0, 8).map((log) => (
              <div
                key={log._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 12.5,
                  padding: '8px 10px',
                  borderRadius: 4,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <strong style={{ color: '#0f172a' }}>{log.action}</strong>
                  <span className="muted" style={{ marginLeft: 6 }}>({log.entity})</span>
                  <span className="muted small" style={{ marginLeft: 8 }}>by {log.user?.name || 'System'}</span>
                </div>
                <span className="muted small mono">{formatDateTime(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CLINICIAN DASHBOARD VIEW
 * Clinical triage center, abnormal findings, out-of-range vitals/labs, follow-ups
 */
function ClinicianDashboardView({ data, navigate, setReviewTarget, reviewTarget, onReload }) {
  const {
    stats = {},
    patientsRequiringReview = [],
    openFindingsList = [],
    abnormalRecentLabs = [],
    abnormalVitalsAssessments = [],
    dueFollowUps = [],
    upcomingFollowUps = [],
    recentPatients = [],
    recentAudit = [],
  } = data;

  return (
    <div>
      {/* Triage Banner */}
      <div className="clinical-triage-banner">
        <div>
          <div className="clinical-triage-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="alert-octagon" size={18} color="#b91c1c" />
            <span>
              CLINICAL ATTENTION QUEUE: {stats.openFindingsCount} Open Finding{stats.openFindingsCount !== 1 ? 's' : ''} & {stats.dueFollowUpsCount} Due Follow-up{stats.dueFollowUpsCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="clinical-triage-sub">
            Review prioritized alerts across your active clinical patient roster. Decision-support cues require professional evaluation.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/findings')}>
            View All Findings ({stats.openFindingsCount})
          </button>
        </div>
      </div>

      {/* KPI Stat Row */}
      <div className="stat-row">
        <div className="stat-box">
          <div className="stat-number">{stats.totalPatients}</div>
          <div className="stat-label">Total Active Patients</div>
        </div>
        <div className={`stat-box ${stats.openFindingsCount > 0 ? 'stat-alert' : ''}`}>
          <div className="stat-number">{stats.openFindingsCount}</div>
          <div className="stat-label">Open CDS Findings</div>
        </div>
        <div className={`stat-box ${stats.highSeverityOpenCount > 0 ? 'stat-alert' : ''}`}>
          <div className="stat-number" style={{ color: stats.highSeverityOpenCount > 0 ? '#b91c1c' : undefined }}>
            {stats.highSeverityOpenCount}
          </div>
          <div className="stat-label">High-Severity Findings</div>
        </div>
        <div className={`stat-box ${stats.dueFollowUpsCount > 0 ? 'stat-alert' : ''}`}>
          <div className="stat-number">{stats.dueFollowUpsCount}</div>
          <div className="stat-label">Follow-ups Due Now</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{stats.abnormalLabsCount || 0}</div>
          <div className="stat-label">Abnormal Recent Labs</div>
        </div>
      </div>

      {/* 2-Column Attention Grid */}
      <div className="dashboard-attention-grid">
        {/* Left Column: Clinical Queues */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Patients Requiring Review */}
          <div className="attention-card">
            <div className="attention-card-header">
              <div className="attention-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="alert-triangle" size={16} color="#d97706" />
                <span>Patients Requiring Clinical Review</span>
              </div>
              <span className="attention-badge-count">{patientsRequiringReview.length} Patients</span>
            </div>
            <DataTable
              emptyMessage="No patients currently require urgent review."
              onRowClick={(row) => navigate(`/patients/${row.patient._id}`)}
              columns={[
                {
                  key: 'patient',
                  header: 'Patient',
                  render: (r) => (
                    <div>
                      <strong>{r.patient?.firstName} {r.patient?.lastName}</strong>
                      <span className="mono small muted" style={{ marginLeft: 6 }}>({r.patient?.patientId})</span>
                    </div>
                  ),
                },
                {
                  key: 'severity',
                  header: 'Priority',
                  render: (r) => <StatusBadge value={r.highestSeverity} />,
                },
                {
                  key: 'primaryReason',
                  header: 'Primary Cue',
                  render: (r) => <span className="small">{r.primaryReason}</span>,
                },
                {
                  key: 'action',
                  header: '',
                  render: (r) => (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/patients/${r.patient._id}`);
                      }}
                    >
                      Open Workspace →
                    </button>
                  ),
                },
              ]}
              rows={patientsRequiringReview}
            />
          </div>

          {/* Abnormal Recent Labs */}
          <div className="attention-card">
            <div className="attention-card-header">
              <div className="attention-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="flask" size={16} color="#0284c7" />
                <span>Abnormal Recent Laboratory Results</span>
              </div>
              <span className="small muted">Out-of-range analytes</span>
            </div>
            <DataTable
              emptyMessage="All recent lab results are within reference limits."
              onRowClick={(row) => navigate(`/patients/${row.patient?._id}`)}
              columns={[
                {
                  key: 'patient',
                  header: 'Patient',
                  render: (r) => `${r.patient?.firstName} ${r.patient?.lastName}`,
                },
                { key: 'test', header: 'Analyte' },
                {
                  key: 'result',
                  header: 'Result',
                  render: (r) => {
                    const isLow = r.result < r.referenceLow;
                    return (
                      <span style={{ color: '#dc2626', fontWeight: 700 }}>
                        {r.result} {r.unit} {isLow ? '▼ (Low)' : '▲ (High)'}
                      </span>
                    );
                  },
                },
                {
                  key: 'reference',
                  header: 'Reference',
                  render: (r) => `${r.referenceLow}–${r.referenceHigh} ${r.unit}`,
                },
                {
                  key: 'date',
                  header: 'Date',
                  render: (r) => formatDate(r.date),
                },
              ]}
              rows={abnormalRecentLabs}
            />
          </div>

          {/* Abnormal Vitals Stream */}
          <div className="attention-card">
            <div className="attention-card-header">
              <div className="attention-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="heart" size={16} color="#e11d48" />
                <span>Vital Sign Anomalies from Recent Visits</span>
              </div>
              <span className="small muted">Intake flags</span>
            </div>
            <DataTable
              emptyMessage="No acute vital sign abnormalities recorded recently."
              onRowClick={(row) => navigate(`/patients/${row.patient?._id}`)}
              columns={[
                {
                  key: 'patient',
                  header: 'Patient',
                  render: (r) => `${r.patient?.firstName} ${r.patient?.lastName}`,
                },
                {
                  key: 'chiefComplaint',
                  header: 'Chief Complaint',
                  render: (r) => <span className="small">{r.chiefComplaint}</span>,
                },
                {
                  key: 'vitals',
                  header: 'Vitals Breakdown',
                  render: (r) => (
                    <div style={{ fontSize: 11.5 }}>
                      {r.vitals?.systolicBP > 140 && <span style={{ color: '#dc2626', fontWeight: 600, marginRight: 6 }}>BP: {r.vitals.systolicBP}/{r.vitals.diastolicBP}</span>}
                      {r.vitals?.heartRate > 100 && <span style={{ color: '#dc2626', fontWeight: 600, marginRight: 6 }}>HR: {r.vitals.heartRate} bpm</span>}
                      {r.vitals?.oxygenSaturation < 94 && <span style={{ color: '#dc2626', fontWeight: 600, marginRight: 6 }}>SpO2: {r.vitals.oxygenSaturation}%</span>}
                      {r.vitals?.temperatureC > 38.0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>T: {r.vitals.temperatureC}°C</span>}
                    </div>
                  ),
                },
                {
                  key: 'date',
                  header: 'Encounter',
                  render: (r) => formatDate(r.createdAt),
                },
              ]}
              rows={abnormalVitalsAssessments}
            />
          </div>
        </div>

        {/* Right Column: Follow-ups, Activity, & Recent Patients */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Overdue / Due Follow-ups */}
          <div className="attention-card">
            <div className="attention-card-header">
              <div className="attention-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="calendar" size={16} color="#b91c1c" />
                <span>Follow-ups Requiring Immediate Attention</span>
              </div>
              <span className="attention-badge-count">{dueFollowUps.length} Due</span>
            </div>
            <DataTable
              emptyMessage="No follow-ups are currently overdue."
              onRowClick={(row) => navigate(`/patients/${row.patient?._id}`)}
              columns={[
                {
                  key: 'patient',
                  header: 'Patient',
                  render: (r) => `${r.patient?.firstName} ${r.patient?.lastName} (${r.patient?.patientId})`,
                },
                { key: 'reason', header: 'Reason' },
                {
                  key: 'dueDate',
                  header: 'Due Date',
                  render: (r) => <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatDate(r.dueDate)}</span>,
                },
                {
                  key: 'assignedClinician',
                  header: 'Assigned Provider',
                  render: (r) => r.assignedClinician?.name || 'Unassigned',
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusBadge value={r.status} />,
                },
              ]}
              rows={dueFollowUps}
            />
          </div>

          {/* Upcoming this week */}
          {upcomingFollowUps.length > 0 && (
            <div className="attention-card">
              <div className="attention-card-header">
                <div className="attention-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="calendar" size={16} color="#0d9488" />
                  <span>Upcoming Follow-ups (Next 7 Days)</span>
                </div>
                <span className="small muted">{upcomingFollowUps.length} scheduled</span>
              </div>
              <DataTable
                onRowClick={(row) => navigate(`/patients/${row.patient?._id}`)}
                columns={[
                  {
                    key: 'patient',
                    header: 'Patient',
                    render: (r) => `${r.patient?.firstName} ${r.patient?.lastName}`,
                  },
                  { key: 'reason', header: 'Reason' },
                  { key: 'dueDate', header: 'Due Date', render: (r) => formatDate(r.dueDate) },
                  {
                    key: 'assignedClinician',
                    header: 'Provider',
                    render: (r) => r.assignedClinician?.name,
                  },
                ]}
                rows={upcomingFollowUps}
              />
            </div>
          )}

          {/* Recent Clinical Activity Audit Feed */}
          <div className="attention-card">
            <div className="attention-card-header">
              <div className="attention-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="file-text" size={16} color="#475569" />
                <span>Recent Clinical Activity</span>
              </div>
              <span className="small muted font-mono">Real-time log</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentAudit.slice(0, 6).map((log) => (
                <div
                  key={log._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12.5,
                    padding: '6px 8px',
                    borderRadius: 4,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <strong>{log.action}</strong>
                    <span className="muted" style={{ marginLeft: 6 }}>({log.entity})</span>
                    <span className="muted small" style={{ marginLeft: 8 }}>by {log.user?.name || 'System'}</span>
                  </div>
                  <span className="muted small mono">{formatDateTime(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Updated Patients Roster */}
          <div className="attention-card">
            <div className="attention-card-header">
              <div className="attention-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="users" size={16} color="#475569" />
                <span>Recently Updated Patients</span>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => navigate('/patients')}>
                Patient Directory →
              </button>
            </div>
            <DataTable
              onRowClick={(row) => navigate(`/patients/${row._id}`)}
              columns={[
                { key: 'patientId', header: 'ID' },
                { key: 'name', header: 'Name', render: (r) => <strong>{r.firstName} {r.lastName}</strong> },
                { key: 'gender', header: 'Sex/Age', render: (r) => `${r.gender}` },
                { key: 'bloodGroup', header: 'Blood', render: (r) => <span className="blood-badge">{r.bloodGroup || '—'}</span> },
                { key: 'lastReviewed', header: 'Last Reviewed', render: (r) => formatDate(r.lastReviewed) },
                { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
              ]}
              rows={recentPatients.slice(0, 6)}
            />
          </div>
        </div>
      </div>

      {reviewTarget && (
        <ReviewFindingModal
          finding={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReviewed={() => {
            setReviewTarget(null);
            onReload();
          }}
        />
      )}
    </div>
  );
}

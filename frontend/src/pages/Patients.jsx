import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPatients, createPatient } from '../api/patients';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

function age(dob) {
  if (!dob) return '—';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const emptyForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'Female',
  bloodGroup: 'O+',
  phone: '',
  email: '',
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const res = await listPatients({ search, status });
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to load patients list:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const patient = await createPatient({
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        contact: { phone: form.phone, email: form.email },
      });
      setShowModal(false);
      setForm(emptyForm);
      navigate(`/patients/${patient._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create patient.');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Patient Clinical Directory</h1>
          <p className="muted small" style={{ margin: 0 }}>
            Active patient master index with longitudinal clinical records and decision-support history.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Patient
        </button>
      </div>

      <div className="toolbar">
        <input
          className="field-search"
          style={{
            width: 280,
            padding: '7px 10px',
            border: '1px solid var(--border)',
            borderRadius: 5,
            fontSize: 13.5,
          }}
          placeholder="Search by patient name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13.5 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <span className="muted small" style={{ marginLeft: 'auto' }}>
          Showing {patients.length} patient records
        </span>
      </div>

      {loading ? (
        <div className="muted" style={{ padding: 24 }}>Loading patients...</div>
      ) : (
        <DataTable
          onRowClick={(row) => navigate(`/patients/${row._id}`)}
          columns={[
            {
              key: 'patient',
              header: 'Patient Name & ID',
              render: (r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={
                      r.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        r.firstName + ' ' + r.lastName
                      )}&background=1e293b&color=ffffff&size=64`
                    }
                    alt=""
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
                    <span className="mono small muted">{r.patientId}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'age',
              header: 'Age / Sex',
              render: (r) => `${age(r.dateOfBirth)} yrs · ${r.gender}`,
            },
            {
              key: 'bloodGroup',
              header: 'Blood',
              render: (r) => <span className="blood-badge">{r.bloodGroup || 'Unknown'}</span>,
            },
            {
              key: 'conditions',
              header: 'Chronic Conditions',
              render: (r) =>
                r.medicalHistory && r.medicalHistory.length > 0 ? (
                  <span className="small">{r.medicalHistory.map((h) => h.condition).join(', ')}</span>
                ) : (
                  <span className="muted small">—</span>
                ),
            },
            {
              key: 'allergies',
              header: 'Allergies',
              render: (r) =>
                r.allergies && r.allergies.length > 0 ? (
                  <span style={{ color: '#b91c1c', fontWeight: 600, fontSize: 12 }}>
                    ⚠️ {r.allergies.map((a) => a.substance).join(', ')}
                  </span>
                ) : (
                  <span className="muted small">None</span>
                ),
            },
            {
              key: 'lastReviewed',
              header: 'Last Reviewed',
              render: (r) => (r.lastReviewed ? new Date(r.lastReviewed).toLocaleDateString() : 'Requires review'),
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <StatusBadge value={r.status} />,
            },
          ]}
          rows={patients}
        />
      )}

      {showModal && (
        <Modal title="Register New Patient" onClose={() => setShowModal(false)} width={600}>
          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="field-row">
              <div className="field">
                <label>First Name</label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="field-row-3">
              <div className="field">
                <label>Date of Birth</label>
                <input
                  required
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                  <option>Undisclosed</option>
                </select>
              </div>
              <div className="field">
                <label>Blood Group</label>
                <select
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="555-0199"
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="patient@example.com"
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              style={{ width: '100%', marginTop: 8 }}
            >
              Create Patient Record
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

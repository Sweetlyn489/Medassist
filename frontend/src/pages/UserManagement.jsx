import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listUsers, updateUserStatus, registerUser } from '../api/auth';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { Icon } from '../components/common/Icons';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionError, setActionError] = useState('');

  async function load() {
    setLoading(true);
    setActionError('');
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to load user roster.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleStatus(targetUser) {
    if (String(targetUser._id) === String(currentUser._id)) {
      setActionError('Administrators cannot deactivate their own active account.');
      return;
    }
    setActionError('');
    try {
      await updateUserStatus(targetUser._id, !targetUser.active);
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update user status.');
    }
  }

  const cliniciansCount = users.filter((u) => u.role === 'clinician').length;
  const adminsCount = users.filter((u) => u.role === 'admin').length;
  const activeCount = users.filter((u) => u.active).length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>User & Clinician Management</h1>
          <p className="muted small" style={{ marginTop: 4 }}>
            Control staff authorization, clinician credentialing, and system administrator privileges.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="user-plus" size={15} />
          <span>Register New Staff</span>
        </button>
      </div>

      {actionError && (
        <div className="alert-card alert-critical" style={{ marginBottom: 16 }}>
          <Icon name="alert-octagon" size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Staff Telemetry Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total System Users</div>
          <div className="kpi-value">{users.length}</div>
          <div className="kpi-hint">All registered personnel</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Licensed Clinicians</div>
          <div className="kpi-value" style={{ color: '#0d9488' }}>{cliniciansCount}</div>
          <div className="kpi-hint">With clinical EHR access</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Administrators</div>
          <div className="kpi-value" style={{ color: '#4f46e5' }}>{adminsCount}</div>
          <div className="kpi-hint">System & audit governance</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Accounts</div>
          <div className="kpi-value">{activeCount}</div>
          <div className="kpi-hint">{users.length - activeCount} inactive / suspended</div>
        </div>
      </div>

      {loading ? (
        <div className="muted">Loading user roster...</div>
      ) : (
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Staff Member',
              render: (u) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                  <div className="muted small">{u.title || 'Staff Member'}</div>
                </div>
              ),
            },
            {
              key: 'email',
              header: 'Work Email',
              render: (u) => <span className="mono small">{u.email}</span>,
            },
            {
              key: 'role',
              header: 'Access Role',
              render: (u) => (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: u.role === 'admin' ? '#eef2ff' : '#ecfdf5',
                    color: u.role === 'admin' ? '#4338ca' : '#047857',
                    border: `1px solid ${u.role === 'admin' ? '#c7d2fe' : '#a7f3d0'}`,
                  }}
                >
                  {u.role === 'admin' ? 'Administrator' : 'Clinician'}
                </span>
              ),
            },
            {
              key: 'active',
              header: 'Status',
              render: (u) => <StatusBadge value={u.active ? 'Active' : 'Inactive'} />,
            },
            {
              key: 'createdAt',
              header: 'Enrolled Date',
              render: (u) => <span className="small muted">{new Date(u.createdAt).toLocaleDateString()}</span>,
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (u) => {
                const isSelf = String(u._id) === String(currentUser._id);
                return isSelf ? (
                  <span className="small muted" style={{ fontStyle: 'italic' }}>Current User</span>
                ) : (
                  <button
                    className={`btn btn-sm ${u.active ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => handleToggleStatus(u)}
                    style={{ fontSize: 12, padding: '4px 10px' }}
                  >
                    {u.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                );
              },
            },
          ]}
          rows={users}
        />
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AddUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    title: '',
    role: 'clinician',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await registerUser(form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user account.');
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Register New Healthcare Staff / Clinician" onClose={onClose}>
      {error && (
        <div className="alert-card alert-critical" style={{ marginBottom: 12 }}>
          <Icon name="alert-octagon" size={14} />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="e.g. Dr. Sarah Jenkins"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Work Email</label>
            <input
              type="email"
              placeholder="s.jenkins@mediassist.local"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Title / Credential</label>
            <input
              type="text"
              placeholder="e.g. MD, Neurology Specialist"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>System Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="clinician">Clinician (Full Medical EHR & CDS)</option>
              <option value="admin">Administrator (Governance & Compliance)</option>
            </select>
          </div>
          <div className="field">
            <label>Initial Password</label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Enroll Staff Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

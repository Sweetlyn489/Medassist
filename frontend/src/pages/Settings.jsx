import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listRules, updateRule } from '../api/rules';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

export default function Settings() {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    setRules(await listRules());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(rule) {
    if (user.role !== 'admin') return;
    await updateRule(rule._id, { active: !rule.active });
    load();
  }

  async function saveThreshold(rule, newThreshold, newMessage) {
    await updateRule(rule._id, { threshold: newThreshold, message: newMessage });
    setEditing(null);
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings — Clinical Decision Support Rules</h1>
      </div>
      <p className="muted small" style={{ marginTop: -10, marginBottom: 14 }}>
        These are transparent, configurable demonstration rules that drive the rule engine. They never diagnose — every rule
        produces a "requires clinical review" style finding for a clinician to act on.
        {user.role !== 'admin' && ' You are viewing in read-only mode; only administrators can edit rules.'}
      </p>

      {loading ? (
        <div className="muted">Loading rules...</div>
      ) : (
        <DataTable
          columns={[
            { key: 'name', header: 'Rule' },
            { key: 'type', header: 'Type' },
            { key: 'field', header: 'Field' },
            { key: 'operator', header: 'Operator' },
            { key: 'threshold', header: 'Threshold', render: (r) => (r.type === 'medication_interaction' ? '—' : r.threshold) },
            { key: 'severity', header: 'Severity', render: (r) => <StatusBadge value={r.severity} /> },
            { key: 'active', header: 'Active', render: (r) => <StatusBadge value={r.active ? 'Active' : 'Inactive'} /> },
            {
              key: 'actions',
              header: '',
              render: (r) =>
                user.role === 'admin' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => setEditing(r)}>Edit</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => toggleActive(r)}>{r.active ? 'Disable' : 'Enable'}</button>
                  </div>
                ) : null,
            },
          ]}
          rows={rules}
        />
      )}

      {editing && (
        <EditRuleModal rule={editing} onClose={() => setEditing(null)} onSave={saveThreshold} />
      )}
    </div>
  );
}

function EditRuleModal({ rule, onClose, onSave }) {
  const [threshold, setThreshold] = useState(rule.threshold ?? 0);
  const [message, setMessage] = useState(rule.message);

  return (
    <Modal title={`Edit rule: ${rule.name}`} onClose={onClose}>
      <p className="small muted">{rule.description}</p>
      {rule.type !== 'medication_interaction' && (
        <div className="field">
          <label>Threshold ({rule.operator})</label>
          <input type="number" step="0.1" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} />
        </div>
      )}
      <div className="field">
        <label>Finding message shown to clinicians</label>
        <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onSave(rule, threshold, message)}>Save Changes</button>
    </Modal>
  );
}

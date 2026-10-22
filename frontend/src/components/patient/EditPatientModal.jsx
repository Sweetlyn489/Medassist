import { useState } from 'react';
import Modal from '../common/Modal';
import { updatePatient } from '../../api/patients';

export default function EditPatientModal({ patient, onClose, onUpdated }) {
  const [form, setForm] = useState({
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : '',
    gender: patient.gender || 'Female',
    bloodGroup: patient.bloodGroup || '',
    status: patient.status || 'Active',
    phone: patient.contact?.phone || '',
    email: patient.contact?.email || '',
    address: patient.contact?.address || '',
  });

  const [allergies, setAllergies] = useState(patient.allergies ? [...patient.allergies] : []);
  const [history, setHistory] = useState(patient.medicalHistory ? [...patient.medicalHistory] : []);

  const [newAllergy, setNewAllergy] = useState({ substance: '', severity: 'Mild', reaction: '' });
  const [newCondition, setNewCondition] = useState({ condition: '', diagnosedYear: new Date().getFullYear(), notes: '' });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addAllergy() {
    if (!newAllergy.substance.trim()) return;
    setAllergies((prev) => [...prev, { ...newAllergy }]);
    setNewAllergy({ substance: '', severity: 'Mild', reaction: '' });
  }

  function removeAllergy(index) {
    setAllergies((prev) => prev.filter((_, i) => i !== index));
  }

  function addCondition() {
    if (!newCondition.condition.trim()) return;
    setHistory((prev) => [...prev, { ...newCondition, diagnosedYear: parseInt(newCondition.diagnosedYear, 10) || undefined }]);
    setNewCondition({ condition: '', diagnosedYear: new Date().getFullYear(), notes: '' });
  }

  function removeCondition(index) {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        status: form.status,
        contact: {
          phone: form.phone,
          email: form.email,
          address: form.address,
        },
        allergies,
        medicalHistory: history,
      };

      const updated = await updatePatient(patient._id, payload);
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update patient details.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Edit Patient: ${patient.firstName} ${patient.lastName} (${patient.patientId})`} onClose={onClose} width={680}>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label>First Name</label>
            <input required value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
          </div>
          <div className="field">
            <label>Last Name</label>
            <input required value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
          </div>
        </div>

        <div className="field-row-3">
          <div className="field">
            <label>Date of Birth</label>
            <input type="date" required value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
          </div>
          <div className="field">
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Undisclosed">Undisclosed</option>
            </select>
          </div>
          <div className="field">
            <label>Blood Group</label>
            <select value={form.bloodGroup} onChange={(e) => updateField('bloodGroup', e.target.value)}>
              <option value="">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className="field-row-3">
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="555-0123" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="patient@example.com" />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Allergies management */}
        <h3 style={{ marginTop: 14, marginBottom: 8 }}>Documented Allergies</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {allergies.length === 0 && <span className="muted small">No allergies recorded.</span>}
          {allergies.map((a, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '6px 10px', borderRadius: 5, border: '1px solid #e2e8f0' }}>
              <div>
                <strong>{a.substance}</strong> ({a.severity}) {a.reaction && <span className="muted">— {a.reaction}</span>}
              </div>
              <button type="button" className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => removeAllergy(idx)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="field-row-3" style={{ background: '#f1f5f9', padding: '10px', borderRadius: 6, marginBottom: 14 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Substance</label>
            <input value={newAllergy.substance} onChange={(e) => setNewAllergy((a) => ({ ...a, substance: e.target.value }))} placeholder="e.g. Penicillin" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Severity</label>
            <select value={newAllergy.severity} onChange={(e) => setNewAllergy((a) => ({ ...a, severity: e.target.value }))}>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div className="field" style={{ margin: 0, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <label>Reaction</label>
              <input value={newAllergy.reaction} onChange={(e) => setNewAllergy((a) => ({ ...a, reaction: e.target.value }))} placeholder="e.g. Hives" />
            </div>
            <button type="button" className="btn btn-sm" style={{ height: 35 }} onClick={addAllergy}>+ Add</button>
          </div>
        </div>

        {/* Chronic Conditions management */}
        <h3 style={{ marginTop: 14, marginBottom: 8 }}>Chronic Medical History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {history.length === 0 && <span className="muted small">No chronic conditions recorded.</span>}
          {history.map((h, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '6px 10px', borderRadius: 5, border: '1px solid #e2e8f0' }}>
              <div>
                <strong>{h.condition}</strong> {h.diagnosedYear && <span className="muted">(Diag: {h.diagnosedYear})</span>} {h.notes && <span className="muted">— {h.notes}</span>}
              </div>
              <button type="button" className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => removeCondition(idx)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="field-row-3" style={{ background: '#f1f5f9', padding: '10px', borderRadius: 6, marginBottom: 16 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Condition</label>
            <input value={newCondition.condition} onChange={(e) => setNewCondition((c) => ({ ...c, condition: e.target.value }))} placeholder="e.g. Type 2 Diabetes" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Diagnosed Year</label>
            <input type="number" value={newCondition.diagnosedYear} onChange={(e) => setNewCondition((c) => ({ ...c, diagnosedYear: e.target.value }))} />
          </div>
          <div className="field" style={{ margin: 0, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <label>Notes</label>
              <input value={newCondition.notes} onChange={(e) => setNewCondition((c) => ({ ...c, notes: e.target.value }))} placeholder="e.g. Stage 2" />
            </div>
            <button type="button" className="btn btn-sm" style={{ height: 35 }} onClick={addCondition}>+ Add</button>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
          {submitting ? 'Saving changes...' : 'Save Patient Changes'}
        </button>
      </form>
    </Modal>
  );
}

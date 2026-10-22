import { useState } from 'react';
import Modal from '../common/Modal';
import { createMedication } from '../../api/patients';

export default function AddMedicationModal({ patientId, onClose, onCreated }) {
  const [form, setForm] = useState({ medication: '', dosage: '', frequency: '', route: 'Oral', startDate: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await createMedication(patientId, form);
      onCreated(result);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save medication.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add Medication" onClose={onClose}>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Medication</label>
          <input required value={form.medication} onChange={(e) => update('medication', e.target.value)} placeholder="e.g. Warfarin" />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Dosage</label>
            <input required value={form.dosage} onChange={(e) => update('dosage', e.target.value)} placeholder="e.g. 5mg" />
          </div>
          <div className="field">
            <label>Frequency</label>
            <input required value={form.frequency} onChange={(e) => update('frequency', e.target.value)} placeholder="e.g. Once daily" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Route</label>
            <select value={form.route} onChange={(e) => update('route', e.target.value)}>
              <option>Oral</option><option>IV</option><option>IM</option><option>Topical</option><option>Subcutaneous</option><option>Inhaled</option><option>Other</option>
            </select>
          </div>
          <div className="field">
            <label>Start date</label>
            <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
          </div>
        </div>

        <p className="muted small">New medications are checked against the patient's active medications using configured demonstration interaction rules.</p>

        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 6 }}>
          {submitting ? 'Saving...' : 'Save Medication'}
        </button>
      </form>
    </Modal>
  );
}

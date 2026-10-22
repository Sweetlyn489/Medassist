import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { createFollowUp } from '../../api/followUps';
import { listClinicians, me } from '../../api/auth';

export default function ScheduleFollowUpModal({ patientId, onClose, onCreated }) {
  const [form, setForm] = useState({
    reason: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    assignedClinician: '',
    notes: '',
  });
  const [clinicians, setClinicians] = useState([]);
  const [loadingClinicians, setLoadingClinicians] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([listClinicians(), me()])
      .then(([clinicianList, meRes]) => {
        setClinicians(clinicianList || []);
        const myId = meRes?.user?.id || (clinicianList[0]?._id ?? '');
        setForm((f) => ({ ...f, assignedClinician: myId }));
      })
      .catch((err) => {
        console.error('Failed to load clinicians list:', err);
      })
      .finally(() => setLoadingClinicians(false));
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.assignedClinician) {
      setError('Please select an assigned clinician.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const result = await createFollowUp({ patient: patientId, ...form });
      onCreated(result);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule follow-up.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Schedule Follow-up" onClose={onClose} width={520}>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Reason for Follow-up</label>
          <input
            required
            value={form.reason}
            onChange={(e) => update('reason', e.target.value)}
            placeholder="e.g. Recheck blood pressure & medication tolerance"
          />
        </div>

        <div className="field">
          <label>Due Date</label>
          <input
            required
            type="date"
            value={form.dueDate}
            onChange={(e) => update('dueDate', e.target.value)}
          />
        </div>

        <div className="field">
          <label>Assigned Clinician</label>
          {loadingClinicians ? (
            <div className="muted small">Loading clinicians...</div>
          ) : (
            <select
              required
              value={form.assignedClinician}
              onChange={(e) => update('assignedClinician', e.target.value)}
            >
              <option value="">Select a clinician...</option>
              {clinicians.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.title ? `(${c.title})` : ''} — {c.role}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="field">
          <label>Clinical Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Instructions or specific monitoring targets..."
          />
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={submitting || loadingClinicians}
          style={{ width: '100%', marginTop: 6 }}
        >
          {submitting ? 'Scheduling...' : 'Schedule Follow-up'}
        </button>
      </form>
    </Modal>
  );
}

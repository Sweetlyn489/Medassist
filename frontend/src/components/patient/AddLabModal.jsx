import { useState } from 'react';
import Modal from '../common/Modal';
import { createLab } from '../../api/patients';

export default function AddLabModal({ patientId, onClose, onCreated }) {
  const [form, setForm] = useState({ test: '', result: '', unit: '', referenceLow: '', referenceHigh: '', date: new Date().toISOString().slice(0, 10) });
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
      const result = await createLab(patientId, {
        test: form.test,
        result: parseFloat(form.result),
        unit: form.unit,
        referenceLow: parseFloat(form.referenceLow),
        referenceHigh: parseFloat(form.referenceHigh),
        date: form.date,
      });
      onCreated(result);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save lab result.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add Laboratory Result" onClose={onClose}>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label>Test</label>
            <input required value={form.test} onChange={(e) => update('test', e.target.value)} placeholder="e.g. Potassium" />
          </div>
          <div className="field">
            <label>Unit</label>
            <input required value={form.unit} onChange={(e) => update('unit', e.target.value)} placeholder="e.g. mmol/L" />
          </div>
        </div>
        <div className="field-row-3">
          <div className="field">
            <label>Result</label>
            <input required type="number" step="0.01" value={form.result} onChange={(e) => update('result', e.target.value)} />
          </div>
          <div className="field">
            <label>Reference low</label>
            <input required type="number" step="0.01" value={form.referenceLow} onChange={(e) => update('referenceLow', e.target.value)} />
          </div>
          <div className="field">
            <label>Reference high</label>
            <input required type="number" step="0.01" value={form.referenceHigh} onChange={(e) => update('referenceHigh', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        </div>

        <p className="muted small">Results outside the reference range, or matching a configured demonstration rule, will generate a finding for clinical review.</p>

        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 6 }}>
          {submitting ? 'Saving...' : 'Save Lab Result'}
        </button>
      </form>
    </Modal>
  );
}

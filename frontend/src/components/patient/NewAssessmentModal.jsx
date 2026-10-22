import { useState } from 'react';
import Modal from '../common/Modal';
import { createAssessment } from '../../api/patients';

const COMMON_SYMPTOMS = [
  'Fever',
  'Cough',
  'Dyspnea / Shortness of breath',
  'Chest pain',
  'Palpitations',
  'Headache',
  'Fatigue',
  'Dizziness',
  'Nausea',
  'Expiratory wheezing',
  'Rash / Pruritus',
  'Joint pain',
];

const emptyVitals = {
  temperatureC: '',
  heartRate: '',
  respiratoryRate: '',
  systolicBP: '',
  diastolicBP: '',
  oxygenSaturation: '',
};

export default function NewAssessmentModal({ patientId, onClose, onCreated }) {
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [vitals, setVitals] = useState(emptyVitals);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function setVital(key, value) {
    setVitals((v) => ({ ...v, [key]: value }));
  }

  function toggleSymptom(symptom) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  function addCustomSymptom() {
    if (!customSymptom.trim()) return;
    if (!selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms((prev) => [...prev, customSymptom.trim()]);
    }
    setCustomSymptom('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const numericVitals = Object.fromEntries(
        Object.entries(vitals)
          .filter(([, v]) => v !== '')
          .map(([k, v]) => [k, parseFloat(v)])
      );
      const result = await createAssessment(patientId, {
        chiefComplaint,
        symptoms: selectedSymptoms,
        assessmentNotes,
        vitals: numericVitals,
      });
      onCreated(result);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save assessment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="New Clinical Assessment" onClose={onClose} width={640}>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Chief Complaint</label>
          <input
            required
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="e.g. Exertional dyspnea and productive cough for 3 days"
          />
        </div>

        {/* Symptoms selection */}
        <div className="field">
          <label>Associated Clinical Symptoms (select all that apply)</label>
          <div className="tag-chips-container">
            {COMMON_SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <div
                  key={sym}
                  className={`tag-chip ${isSelected ? 'tag-chip-selected' : ''}`}
                  onClick={() => toggleSymptom(sym)}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {sym}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              style={{ flex: 1 }}
              placeholder="Or add other symptom..."
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSymptom();
                }
              }}
            />
            <button type="button" className="btn btn-sm" onClick={addCustomSymptom}>
              + Add Symptom
            </button>
          </div>
        </div>

        <h3 style={{ marginTop: 14 }}>Vital Signs Intake</h3>
        <div className="field-row-3">
          <div className="field">
            <label>Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              value={vitals.temperatureC}
              onChange={(e) => setVital('temperatureC', e.target.value)}
              placeholder="37.0"
            />
          </div>
          <div className="field">
            <label>Heart Rate (bpm)</label>
            <input
              type="number"
              value={vitals.heartRate}
              onChange={(e) => setVital('heartRate', e.target.value)}
              placeholder="75"
            />
          </div>
          <div className="field">
            <label>Respiratory Rate (/min)</label>
            <input
              type="number"
              value={vitals.respiratoryRate}
              onChange={(e) => setVital('respiratoryRate', e.target.value)}
              placeholder="16"
            />
          </div>
        </div>

        <div className="field-row-3">
          <div className="field">
            <label>Systolic BP (mmHg)</label>
            <input
              type="number"
              value={vitals.systolicBP}
              onChange={(e) => setVital('systolicBP', e.target.value)}
              placeholder="120"
            />
          </div>
          <div className="field">
            <label>Diastolic BP (mmHg)</label>
            <input
              type="number"
              value={vitals.diastolicBP}
              onChange={(e) => setVital('diastolicBP', e.target.value)}
              placeholder="80"
            />
          </div>
          <div className="field">
            <label>Oxygen Saturation (%)</label>
            <input
              type="number"
              value={vitals.oxygenSaturation}
              onChange={(e) => setVital('oxygenSaturation', e.target.value)}
              placeholder="98"
            />
          </div>
        </div>

        <div className="field">
          <label>Assessment & Clinical Notes</label>
          <textarea
            rows={3}
            value={assessmentNotes}
            onChange={(e) => setAssessmentNotes(e.target.value)}
            placeholder="Clinical observations, plan, examination details..."
          />
        </div>

        <p className="muted small">
          Vitals outside configured clinical thresholds will automatically generate non-diagnostic
          decision-support findings for physician review.
        </p>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={submitting}
          style={{ width: '100%', marginTop: 6 }}
        >
          {submitting ? 'Saving Assessment...' : 'Save Assessment'}
        </button>
      </form>
    </Modal>
  );
}

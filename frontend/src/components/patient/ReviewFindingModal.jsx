import { useState } from 'react';
import Modal from '../common/Modal';
import { reviewFinding } from '../../api/findings';

export default function ReviewFindingModal({ finding, onClose, onReviewed }) {
  const [status, setStatus] = useState('Reviewed');
  const [reviewNotes, setReviewNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const updated = await reviewFinding(finding._id, { status, reviewNotes });
      onReviewed(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update finding.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Review Clinical Finding" onClose={onClose}>
      {error && <div className="error-text">{error}</div>}
      <div className="panel" style={{ background: 'var(--surface-alt)', marginBottom: 14 }}>
        <div className="small"><strong>{finding.finding}</strong></div>
        <div className="small muted" style={{ marginTop: 4 }}>{finding.reason}</div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Outcome</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Reviewed">Reviewed — acknowledged, no further action recorded here</option>
            <option value="Resolved">Resolved — addressed</option>
          </select>
        </div>
        <div className="field">
          <label>Review notes</label>
          <textarea rows={3} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Clinical rationale for this outcome..." />
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 6 }}>
          {submitting ? 'Saving...' : 'Submit Review'}
        </button>
      </form>
    </Modal>
  );
}

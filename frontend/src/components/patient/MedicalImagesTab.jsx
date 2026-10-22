import { useState } from 'react';
import Modal from '../common/Modal';

export default function MedicalImagesTab({ images }) {
  const [activeImage, setActiveImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
        <h3>No Diagnostic Imaging on Record</h3>
        <p className="muted small">
          No diagnostic radiology, ultrasound, or electrodiagnostic imaging studies have been filed for this patient.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0 }}>Diagnostic & Medical Imaging</h2>
          <p className="muted small" style={{ margin: 0 }}>
            Demonstration medical imagery linked to patient clinical record. Click any study to open the clinical viewer.
          </p>
        </div>
        <div style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>
          SYNTHETIC DEMO ASSETS ONLY
        </div>
      </div>

      <div className="image-gallery-grid">
        {images.map((img) => (
          <div key={img._id} className="image-card" onClick={() => setActiveImage(img)}>
            <div className="image-card-thumb">
              <img src={img.thumbnailUrl || img.imageUrl} alt={img.title} />
              <div className="synthetic-banner-tag">SYNTHETIC DEMO</div>
            </div>
            <div className="image-card-body">
              <div>
                <div className="image-card-title">{img.title}</div>
                <div className="image-card-meta">
                  <span>{img.modality}</span>
                  {img.bodySite && <span> · {img.bodySite}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 11.5, color: '#64748b' }}>
                <span>{new Date(img.acquisitionDate).toLocaleDateString()}</span>
                <span className="btn btn-sm btn-ghost" style={{ padding: '2px 6px' }}>View Study →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeImage && (
        <Modal
          title={`Diagnostic Study: ${activeImage.title}`}
          onClose={() => setActiveImage(null)}
          width={860}
        >
          <div className="lightbox-modal-body">
            <div className="lightbox-preview-pane">
              <img src={activeImage.imageUrl} alt={activeImage.title} />
            </div>
            <div className="lightbox-details-pane">
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 5, padding: '8px 12px', color: '#92400e', fontSize: 12 }}>
                <strong>Demonstration Record Notice:</strong> This study is an artificial synthetic asset generated strictly for testing clinical decision workflows.
              </div>

              <div className="panel" style={{ margin: 0, padding: 12 }}>
                <div className="kv-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px 14px' }}>
                  <div>
                    <div className="kv-label">Modality</div>
                    <div className="kv-value">{activeImage.modality}</div>
                  </div>
                  <div>
                    <div className="kv-label">Anatomical Site</div>
                    <div className="kv-value">{activeImage.bodySite || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="kv-label">Acquired Date</div>
                    <div className="kv-value">{new Date(activeImage.acquisitionDate).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="kv-label">Ordering Clinician</div>
                    <div className="kv-value">{activeImage.orderedBy?.name || 'Dr. Elena Voss, MD'}</div>
                  </div>
                </div>
              </div>

              {activeImage.indication && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>
                    Clinical Indication
                  </div>
                  <div style={{ fontSize: 13.5, color: '#1e293b' }}>{activeImage.indication}</div>
                </div>
              )}

              {activeImage.findings && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>
                    Radiologist / Diagnostic Findings
                  </div>
                  <div style={{ fontSize: 13.5, color: '#1e293b', background: '#f8fafc', padding: 10, borderRadius: 5, border: '1px solid #e2e8f0', lineHeight: 1.4 }}>
                    {activeImage.findings}
                  </div>
                </div>
              )}

              {activeImage.impression && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: 2 }}>
                    Impression
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0c4a6e', background: '#f0f9ff', padding: 10, borderRadius: 5, border: '1px solid #bae6fd' }}>
                    {activeImage.impression}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button className="btn btn-sm" onClick={() => window.print()}>
                  Print / Save Study
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

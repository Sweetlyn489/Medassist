import { useState, useMemo } from 'react';

function formatDateShort(d) {
  if (!d) return '';
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function SvgTrendChart({ title, data, valueKey, valueKey2, unit, minNormal, maxNormal, minNormal2, maxNormal2, label1, label2, color1 = '#2563eb', color2 = '#0d9488' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const points = useMemo(() => {
    return (data || [])
      .filter((item) => {
        const val = typeof item[valueKey] === 'number' ? item[valueKey] : item.vitals?.[valueKey] ?? item.result;
        return typeof val === 'number' && !isNaN(val);
      })
      .map((item) => {
        const v1 = typeof item[valueKey] === 'number' ? item[valueKey] : item.vitals?.[valueKey] ?? item.result;
        const v2 = valueKey2 ? (typeof item[valueKey2] === 'number' ? item[valueKey2] : item.vitals?.[valueKey2]) : null;
        return {
          date: item.createdAt || item.date,
          v1,
          v2,
          raw: item,
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data, valueKey, valueKey2]);

  if (points.length === 0) {
    return (
      <div className="panel" style={{ padding: 20 }}>
        <h3>{title}</h3>
        <p className="muted small">Insufficient longitudinal data recorded for this metric.</p>
      </div>
    );
  }

  // Calculate chart bounds
  const allValues = points.flatMap((p) => [p.v1, p.v2].filter((v) => v !== null && v !== undefined));
  if (minNormal !== undefined) allValues.push(minNormal);
  if (maxNormal !== undefined) allValues.push(maxNormal);

  const minVal = Math.floor(Math.min(...allValues) * 0.92);
  const maxVal = Math.ceil(Math.max(...allValues) * 1.08);
  const range = maxVal - minVal || 1;

  const width = 640;
  const height = 220;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;
  const graphWidth = width - padLeft - padRight;
  const graphHeight = height - padTop - padBottom;

  const getX = (idx) => padLeft + (points.length === 1 ? graphWidth / 2 : (idx / (points.length - 1)) * graphWidth);
  const getY = (val) => padTop + graphHeight - ((val - minVal) / range) * graphHeight;

  // Build SVG path
  const pathD1 = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.v1)}`).join(' ');
  const pathD2 = valueKey2 ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.v2)}`).join(' ') : null;

  return (
    <div className="panel" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          {title}
          <span className="muted small font-normal">({unit})</span>
        </h3>
        <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
          {label1 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color1 }} />
              {label1}
            </span>
          )}
          {label2 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color2 }} />
              {label2}
            </span>
          )}
          {minNormal !== undefined && maxNormal !== undefined && (
            <span style={{ color: '#64748b' }}>
              Target: {minNormal}–{maxNormal} {unit}
            </span>
          )}
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxHeight: 240, display: 'block' }}>
          {/* Normal Target Range Background Shading */}
          {minNormal !== undefined && maxNormal !== undefined && (
            <rect
              x={padLeft}
              y={Math.min(getY(minNormal), getY(maxNormal))}
              width={graphWidth}
              height={Math.abs(getY(minNormal) - getY(maxNormal))}
              fill="#ecfdf5"
              opacity="0.8"
            />
          )}

          {/* Grid lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const v = Math.round(minVal + ratio * range);
            const y = getY(v);
            return (
              <g key={ratio}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={padLeft - 6} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">
                  {v}
                </text>
              </g>
            );
          })}

          {/* Trend lines */}
          <path d={pathD1} fill="none" stroke={color1} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {pathD2 && <path d={pathD2} fill="none" stroke={color2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Data Points */}
          {points.map((p, i) => {
            const x = getX(i);
            const y1 = getY(p.v1);
            const isOut1 = (minNormal !== undefined && p.v1 < minNormal) || (maxNormal !== undefined && p.v1 > maxNormal);

            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y1}
                  r={hoveredIdx === i ? 6 : 4}
                  fill={isOut1 ? '#ef4444' : color1}
                  stroke="#ffffff"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                {p.v2 !== null && (
                  <circle
                    cx={x}
                    cy={getY(p.v2)}
                    r={hoveredIdx === i ? 6 : 4}
                    fill={color2}
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                )}

                {/* X axis dates */}
                <text x={x} y={height - 10} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                  {formatDateShort(p.date)}
                </text>

                {/* Hover Value Tooltip */}
                {hoveredIdx === i && (
                  <g>
                    <rect
                      x={Math.max(10, Math.min(x - 55, width - 110))}
                      y={Math.max(5, y1 - 32)}
                      width={100}
                      height={24}
                      rx="4"
                      fill="#0f172a"
                      opacity="0.9"
                    />
                    <text
                      x={Math.max(10, Math.min(x - 55, width - 110)) + 50}
                      y={Math.max(5, y1 - 32) + 16}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {p.v2 !== null ? `${p.v1}/${p.v2}` : p.v1} {unit}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function ClinicalTrendsTab({ assessments, labs }) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter lab datasets
  const glucoseLabs = useMemo(() => (labs || []).filter((l) => /glucose/i.test(l.test)), [labs]);
  const potassiumLabs = useMemo(() => (labs || []).filter((l) => /potassium/i.test(l.test)), [labs]);
  const hemoglobinLabs = useMemo(() => (labs || []).filter((l) => /hemoglobin/i.test(l.test)), [labs]);
  const creatinineLabs = useMemo(() => (labs || []).filter((l) => /creatinine/i.test(l.test)), [labs]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0 }}>Longitudinal Clinical Trends</h2>
          <p className="muted small" style={{ margin: 0 }}>
            Chronological trajectories computed across serial clinical encounters and diagnostic lab panels.
          </p>
        </div>
        <div className="toolbar" style={{ margin: 0 }}>
          <button
            className={`btn btn-sm ${selectedFilter === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All Metrics
          </button>
          <button
            className={`btn btn-sm ${selectedFilter === 'bp' ? 'btn-primary' : ''}`}
            onClick={() => setSelectedFilter('bp')}
          >
            Blood Pressure
          </button>
          <button
            className={`btn btn-sm ${selectedFilter === 'hr' ? 'btn-primary' : ''}`}
            onClick={() => setSelectedFilter('hr')}
          >
            Heart Rate
          </button>
          <button
            className={`btn btn-sm ${selectedFilter === 'spo2' ? 'btn-primary' : ''}`}
            onClick={() => setSelectedFilter('spo2')}
          >
            SpO2 & RR
          </button>
          <button
            className={`btn btn-sm ${selectedFilter === 'labs' ? 'btn-primary' : ''}`}
            onClick={() => setSelectedFilter('labs')}
          >
            Diagnostic Labs
          </button>
        </div>
      </div>

      {(selectedFilter === 'all' || selectedFilter === 'bp') && (
        <SvgTrendChart
          title="Blood Pressure Longitudinal Trajectory"
          data={assessments}
          valueKey="systolicBP"
          valueKey2="diastolicBP"
          label1="Systolic"
          label2="Diastolic"
          unit="mmHg"
          minNormal={90}
          maxNormal={120}
          color1="#e11d48"
          color2="#2563eb"
        />
      )}

      {(selectedFilter === 'all' || selectedFilter === 'hr') && (
        <SvgTrendChart
          title="Resting Heart Rate"
          data={assessments}
          valueKey="heartRate"
          label1="Heart Rate"
          unit="bpm"
          minNormal={60}
          maxNormal={100}
          color1="#0284c7"
        />
      )}

      {(selectedFilter === 'all' || selectedFilter === 'spo2') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SvgTrendChart
            title="Oxygen Saturation (SpO2)"
            data={assessments}
            valueKey="oxygenSaturation"
            label1="SpO2"
            unit="%"
            minNormal={94}
            maxNormal={100}
            color1="#059669"
          />
          <SvgTrendChart
            title="Respiratory Rate"
            data={assessments}
            valueKey="respiratoryRate"
            label1="Resp Rate"
            unit="/min"
            minNormal={12}
            maxNormal={20}
            color1="#d97706"
          />
        </div>
      )}

      {(selectedFilter === 'all' || selectedFilter === 'labs') && (
        <div>
          <h3 style={{ marginTop: 10, marginBottom: 12 }}>Serial Laboratory Trends</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {glucoseLabs.length > 0 && (
              <SvgTrendChart
                title="Fasting Blood Glucose"
                data={glucoseLabs}
                valueKey="result"
                label1="Glucose"
                unit="mg/dL"
                minNormal={70}
                maxNormal={99}
                color1="#7c3aed"
              />
            )}
            {potassiumLabs.length > 0 && (
              <SvgTrendChart
                title="Serum Potassium"
                data={potassiumLabs}
                valueKey="result"
                label1="Potassium"
                unit="mmol/L"
                minNormal={3.5}
                maxNormal={5.0}
                color1="#ea580c"
              />
            )}
            {hemoglobinLabs.length > 0 && (
              <SvgTrendChart
                title="Hemoglobin (Hb)"
                data={hemoglobinLabs}
                valueKey="result"
                label1="Hemoglobin"
                unit="g/dL"
                minNormal={12.0}
                maxNormal={17.5}
                color1="#dc2626"
              />
            )}
            {creatinineLabs.length > 0 && (
              <SvgTrendChart
                title="Serum Creatinine"
                data={creatinineLabs}
                valueKey="result"
                label1="Creatinine"
                unit="mg/dL"
                minNormal={0.6}
                maxNormal={1.3}
                color1="#4f46e5"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

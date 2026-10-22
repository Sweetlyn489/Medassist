import './tabs.css';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs-bar">
      {tabs.map((t) => (
        <button key={t.key} className={`tab-btn ${active === t.key ? 'tab-active' : ''}`} onClick={() => onChange(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

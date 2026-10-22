import './inlineAlert.css';

/** tone: "info" | "warning" | "critical" | "success" */
export default function InlineAlert({ tone = 'info', children }) {
  return <div className={`inline-alert alert-${tone}`}>{children}</div>;
}
